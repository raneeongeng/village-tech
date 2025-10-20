'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { MemberStickerCard } from './MemberStickerCard'
import {
  MemberSelectionFormSchema,
  type MemberSelectionForm,
  type SelectedMember,
  transformMembersToSelectable,
  validatePeopleStickerSubmission,
  hasUploadingDocuments,
  getSelectedMembersForSubmission,
  transformToApiFormat,
  defaultPeopleStickerForm
} from '@/lib/validations/people-sticker'
import { useAuth } from '@/hooks/useAuth'
import { useTenant } from '@/hooks/useTenant'
import { useHouseholdMembers } from '@/hooks/useHouseholdMembers'
import { getCachedHouseholdInfo } from '@/lib/auth'
import { supabase } from '@/lib/supabase/client'

interface PeopleStickerRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  onError?: (error: string) => void
  onSwitchToVehicle?: () => void
}

export function PeopleStickerRequestModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
  onSwitchToVehicle
}: PeopleStickerRequestModalProps) {
  const { user } = useAuth()
  const { tenant } = useTenant()
  const { members: householdMembers, loading: isLoadingMembers, error: membersError } = useHouseholdMembers()

  const [selectableMembers, setSelectableMembers] = useState<SelectedMember[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadResults, setUploadResults] = useState<Record<string, { id_document_url?: string; photo_url?: string }>>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<MemberSelectionForm>({
    resolver: zodResolver(MemberSelectionFormSchema),
    defaultValues: {
      members: [],
      ...defaultPeopleStickerForm
    }
  })

  // Initialize selectable members when household members load
  useEffect(() => {
    console.log('PeopleStickerModal - useEffect triggered')
    console.log('householdMembers:', householdMembers)
    console.log('householdMembers.length:', householdMembers.length)
    console.log('isLoadingMembers:', isLoadingMembers)
    console.log('membersError:', membersError)
    console.log('tenant:', tenant)
    console.log('user:', user)

    if (householdMembers.length > 0) {
      const initializeMembers = async () => {
        console.log('Initializing members...')
        // Check which members already have active stickers
        const activeStickers: string[] = []

        for (const member of householdMembers) {
          console.log('Checking member:', member)
          if (tenant?.id) {
            try {
              const { data: hasSticker } = await supabase
                .rpc('has_active_people_sticker', {
                  p_tenant_id: tenant.id,
                  p_member_id: member.id
                })

              console.log('Has sticker check result for', member.name, ':', hasSticker)
              if (hasSticker) {
                activeStickers.push(member.id)
              }
            } catch (error) {
              console.error('Error checking sticker status for member:', member.id, error)
            }
          }
        }

        console.log('Active stickers:', activeStickers)
        const transformed = transformMembersToSelectable(householdMembers, activeStickers)
        console.log('Transformed members:', transformed)
        setSelectableMembers(transformed)
        setValue('members', transformed)
      }

      initializeMembers()
    }
  }, [householdMembers, tenant?.id, setValue])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset()
      setSelectableMembers([])
      setUploadResults({})
      setValidationErrors({})
    }
  }, [isOpen, reset])

  const handleMemberSelectionChange = (memberId: string, selected: boolean) => {
    const updatedMembers = selectableMembers.map(member =>
      member.member_id === memberId ? { ...member, selected } : member
    )
    setSelectableMembers(updatedMembers)
    setValue('members', updatedMembers)

    // Clear validation errors when selection changes
    setValidationErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.members
      return newErrors
    })
  }

  const handleSelectAll = () => {
    const eligibleMembers = selectableMembers.filter(member => !member.has_active_sticker)
    const allSelected = eligibleMembers.every(member => member.selected)

    const updatedMembers = selectableMembers.map(member =>
      member.has_active_sticker ? member : { ...member, selected: !allSelected }
    )
    setSelectableMembers(updatedMembers)
    setValue('members', updatedMembers)
  }

  const handleDocumentUpload = async (memberId: string, documentType: 'id' | 'photo', file: File) => {
    // Update uploading state
    const updatedMembers = selectableMembers.map(member =>
      member.member_id === memberId
        ? { ...member, [`${documentType}_document_uploading`]: true }
        : member
    )
    setSelectableMembers(updatedMembers)

    try {
      // Generate secure upload path using the database function
      const { data: securePathData, error: pathError } = await supabase.rpc('generate_upload_url', {
        p_user_id: user?.id,
        p_tenant_id: tenant?.id,
        p_file_name: `${documentType}-${file.name}`,
        p_file_type: 'people-sticker-docs'
      })

      if (pathError || !securePathData) {
        throw pathError || new Error('Failed to generate secure upload path')
      }

      const filePath = securePathData

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get signed URL (bucket is private)
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 60 * 60 * 24 * 7) // 7 days expiry

      if (urlError || !signedUrlData) {
        throw urlError || new Error('Failed to get signed URL')
      }

      const fileUrl = signedUrlData.signedUrl

      // Update upload results
      setUploadResults(prev => ({
        ...prev,
        [memberId]: {
          ...prev[memberId],
          [`${documentType}_document_url`]: fileUrl
        }
      }))

      // Update member state with uploaded file
      const finalUpdatedMembers = selectableMembers.map(member =>
        member.member_id === memberId
          ? {
              ...member,
              [documentType]: file,
              [`${documentType}_document_uploading`]: false
            }
          : member
      )
      setSelectableMembers(finalUpdatedMembers)
      setValue('members', finalUpdatedMembers)

    } catch (error) {
      console.error(`Failed to upload ${documentType} document:`, error)
      onError?.(`Failed to upload ${documentType} document. Please try again.`)

      // Reset uploading state
      const resetMembers = selectableMembers.map(member =>
        member.member_id === memberId
          ? { ...member, [`${documentType}_document_uploading`]: false }
          : member
      )
      setSelectableMembers(resetMembers)
    }
  }

  const handleDocumentRemove = (memberId: string, documentType: 'id' | 'photo') => {
    // Remove from upload results
    setUploadResults(prev => {
      const updated = { ...prev }
      if (updated[memberId]) {
        const propertyName = documentType === 'id' ? 'id_document_url' : 'photo_url'
        delete updated[memberId][propertyName]
      }
      return updated
    })

    // Update member state
    const updatedMembers = selectableMembers.map(member =>
      member.member_id === memberId
        ? { ...member, [documentType]: undefined }
        : member
    )
    setSelectableMembers(updatedMembers)
    setValue('members', updatedMembers)
  }

  const onSubmit = async (formData: MemberSelectionForm) => {
    // Validate submission
    const validation = validatePeopleStickerSubmission(formData)
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      return
    }

    const tenantId = tenant?.id || user?.tenant_id

    if (!user?.id || !tenantId) {
      onError?.('User or tenant information is missing')
      return
    }

    setIsSubmitting(true)

    try {
      // Get selected members and transform to API format
      const selectedMembers = getSelectedMembersForSubmission(formData.members)
      const apiMembers = transformToApiFormat(selectedMembers, uploadResults)

      // Get household ID from cached info
      const householdInfo = getCachedHouseholdInfo()
      if (!householdInfo?.id) {
        throw new Error('Household information not found. Please refresh and try again.')
      }

      // Submit people sticker request
      const { data, error } = await supabase.rpc('submit_people_sticker_request', {
        p_tenant_id: tenantId,
        p_requester_id: user.id,
        p_household_id: householdInfo.id,
        p_selected_members: apiMembers,
        p_remarks: formData.remarks || null,
      })

      if (error) {
        throw error
      }

      // Reset form and close modal
      reset()
      setSelectableMembers([])
      setUploadResults({})
      setValidationErrors({})
      onClose()
      onSuccess?.()

    } catch (error) {
      console.error('Failed to submit people sticker request:', error)
      const errorMessage = error instanceof Error ? error.message : 'Please try again.'
      onError?.(`Failed to submit people sticker request: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const selectedCount = selectableMembers.filter(member => member.selected).length
  const eligibleCount = selectableMembers.filter(member => !member.has_active_sticker).length
  const hasUploading = hasUploadingDocuments(selectableMembers)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-4xl transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-text">
                Request People Stickers
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Select household members who need personal identification stickers
              </p>
            </div>
            <div className="flex items-center gap-3">
              {onSwitchToVehicle && (
                <button
                  onClick={onSwitchToVehicle}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14a3 3 0 01-3 3h-8a3 3 0 01-3-3V9a3 3 0 013-3h8a3 3 0 013 3v5zM6 20a1 1 0 100-2 1 1 0 000 2zM18 20a1 1 0 100-2 1 1 0 000 2z" />
                  </svg>
                  Switch to Vehicle
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Selection Summary and Controls */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-blue-900">
                    Member Selection
                  </h4>
                  <p className="text-sm text-blue-700">
                    {selectedCount} of {eligibleCount} eligible members selected
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleSelectAll}
                  variant="outline"
                  size="sm"
                  disabled={eligibleCount === 0}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  {selectableMembers.filter(m => !m.has_active_sticker).every(m => m.selected)
                    ? 'Deselect All'
                    : 'Select All Eligible'
                  }
                </Button>
              </div>

              {validationErrors.members && (
                <p className="mt-2 text-sm text-red-600">{validationErrors.members}</p>
              )}
            </div>

            {/* Debug Info */}
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <p><strong>Debug:</strong></p>
              <p>Loading: {isLoadingMembers ? 'true' : 'false'}</p>
              <p>Error: {membersError ? membersError.message : 'none'}</p>
              <p>Household Members: {householdMembers.length}</p>
              <p>Selectable Members: {selectableMembers.length}</p>
              <p>Tenant: {tenant?.id || 'none'}</p>
              <p>User: {user?.id || 'none'}</p>
            </div>

            {/* Member Selection Grid */}
            <div className="max-h-96 overflow-y-auto">
              {isLoadingMembers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-gray-600">Loading household members...</span>
                </div>
              ) : membersError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">Error loading household members: {membersError.message}</p>
                </div>
              ) : selectableMembers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No household members found</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Original members: {householdMembers.length} |
                    Loading: {isLoadingMembers ? 'yes' : 'no'} |
                    Error: {membersError ? 'yes' : 'no'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectableMembers.map((member) => (
                    <MemberStickerCard
                      key={member.member_id}
                      member={member}
                      onSelectionChange={handleMemberSelectionChange}
                      onDocumentUpload={handleDocumentUpload}
                      onDocumentRemove={handleDocumentRemove}
                      disabled={isSubmitting}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-text mb-2" htmlFor="remarks">
                Additional Remarks (Optional)
              </label>
              <textarea
                {...register('remarks')}
                id="remarks"
                className="w-full rounded-lg border-0 bg-gray-50 focus:ring-2 focus:ring-primary px-4 py-3 text-text"
                rows={3}
                placeholder="Any additional information for the admin review..."
              />
              {errors.remarks && (
                <p className="mt-1 text-sm text-red-600">{errors.remarks.message}</p>
              )}
              {validationErrors.remarks && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.remarks}</p>
              )}
            </div>

            {/* Validation Errors */}
            {validationErrors.uploads && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-700 text-sm">{validationErrors.uploads}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={isSubmitting || selectedCount === 0 || hasUploading}
                className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-lg transition-all"
              >
                {isSubmitting
                  ? 'Submitting...'
                  : hasUploading
                  ? 'Uploading Documents...'
                  : `Submit Request${selectedCount > 0 ? ` (${selectedCount} members)` : ''}`
                }
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
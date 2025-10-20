'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  VehicleStickerRequestSchema,
  type VehicleStickerRequestData,
  type HouseholdMemberOption,
  vehicleTypeOptions,
  validateFileUpload,
  defaultStickerRequestValues
} from '@/lib/validations/sticker'
import { useAuth } from '@/hooks/useAuth'
import { useTenant } from '@/hooks/useTenant'
import { useHouseholdMembers } from '@/hooks/useHouseholdMembers'
import { getCachedHouseholdInfo } from '@/lib/auth'
import { supabase } from '@/lib/supabase/client'

interface StickerRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  onError?: (error: string) => void
  onSwitchToPeople?: () => void
}

export function StickerRequestModal({ isOpen, onClose, onSuccess, onError, onSwitchToPeople }: StickerRequestModalProps) {
  const { user } = useAuth()
  const { tenant } = useTenant()
  const { members: householdMembers, loading: isLoadingMembers, error: membersError } = useHouseholdMembers()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<Omit<VehicleStickerRequestData, 'proofFile'>>({
    resolver: zodResolver(VehicleStickerRequestSchema.omit({ proofFile: true })),
    defaultValues: defaultStickerRequestValues,
  })

  const selectedMemberId = watch('householdMemberId')

  // Form values for development debugging (commented out)
  // const formValues = watch()
  // console.log('Current form values:', formValues)
  // console.log('Form errors:', errors)

  // Transform household members to dropdown options
  const householdMemberOptions: HouseholdMemberOption[] = householdMembers.map(member => ({
    id: member.id,
    name: member.name,
    relationshipCode: member.relationship?.code?.toLowerCase() || 'unknown',
    relationshipName: member.relationship?.name || 'Unknown',
    isPrimary: member.is_primary || false
  }))

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset()
      setSelectedFile(null)
      setFileError(null)
    }
  }, [isOpen, reset])

  const handleFileSelect = (file: File) => {
    const error = validateFileUpload(file)
    if (error) {
      setFileError(error)
      setSelectedFile(null)
    } else {
      setFileError(null)
      setSelectedFile(file)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)

    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUploadAreaClick = () => {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.click()
    }
  }

  const onSubmit = async (formData: Omit<VehicleStickerRequestData, 'proofFile'>) => {
    if (!selectedFile) {
      setFileError('Proof of ownership is required')
      return
    }

    const tenantId = tenant?.id || user?.tenant_id

    if (!user?.id || !tenantId) {
      onError?.('User or tenant information is missing')
      return
    }

    setIsSubmitting(true)

    try {
      // Generate secure upload path using the database function
      const { data: securePathData, error: pathError } = await supabase.rpc('generate_upload_url', {
        p_user_id: user.id,
        p_tenant_id: tenantId,
        p_file_name: selectedFile.name,
        p_file_type: 'sticker-proofs'
      })

      if (pathError || !securePathData) {
        throw pathError || new Error('Failed to generate secure upload path')
      }

      const filePath = securePathData

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile)

      if (uploadError) {
        throw uploadError
      }

      // Get signed URL for the uploaded file (bucket is private)
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 60 * 60 * 24 * 7) // 7 days expiry

      if (urlError || !signedUrlData) {
        throw urlError || new Error('Failed to get signed URL')
      }

      const fileUrl = signedUrlData.signedUrl

      // Get household ID from cached info
      const householdInfo = getCachedHouseholdInfo()
      if (!householdInfo?.id) {
        throw new Error('Household information not found. Please refresh and try again.')
      }

      // Submit vehicle sticker request using the database function
      const { data, error } = await supabase.rpc('submit_vehicle_sticker_request', {
        p_tenant_id: tenantId,
        p_requester_id: user.id,
        p_household_id: householdInfo.id,
        p_household_member_id: formData.householdMemberId,
        p_vehicle_type: formData.vehicleType,
        p_vehicle_make: formData.make,
        p_vehicle_model: formData.model,
        p_vehicle_plate: formData.plateNumber,
        p_vehicle_color: formData.color,
        p_proof_file_url: fileUrl,
        p_remarks: formData.remarks || null,
      })

      if (error) {
        throw error
      }

      // Reset form and close modal
      reset()
      setSelectedFile(null)
      setFileError(null)
      onClose()
      onSuccess?.()
    } catch (error) {
      console.error('Failed to submit sticker request:', error)
      const errorMessage = error instanceof Error ? error.message : 'Please try again.'
      onError?.(`Failed to submit sticker request: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

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
          className="relative w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-text">
                Request Vehicle Sticker
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Register a vehicle for access stickers
              </p>
            </div>
            <div className="flex items-center gap-3">
              {onSwitchToPeople && (
                <button
                  onClick={onSwitchToPeople}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Switch to People
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

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto">
                  {/* Household Member Selection */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-2" htmlFor="householdMemberId">
                      Household Member
                    </label>
                    <select
                      {...register('householdMemberId')}
                      disabled={isLoadingMembers || !!membersError}
                      className={`w-full rounded-lg border-0 bg-gray-50 focus:ring-2 focus:ring-primary px-4 py-3 text-text appearance-none ${
                        isLoadingMembers || membersError ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem',
                      }}
                    >
                      <option value="">
                        {isLoadingMembers
                          ? 'Loading household members...'
                          : membersError
                          ? 'Error loading members'
                          : householdMemberOptions.length === 0
                          ? 'No household members found'
                          : 'Select household member'}
                      </option>
                      {!isLoadingMembers && !membersError && householdMemberOptions.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.relationshipName})
                        </option>
                      ))}
                    </select>
                    {membersError && (
                      <p className="mt-1 text-sm text-red-600">{membersError.message || 'Error loading household members'}</p>
                    )}
                    {errors.householdMemberId && !membersError && (
                      <p className="mt-1 text-sm text-red-600">{errors.householdMemberId.message}</p>
                    )}
                    {isLoadingMembers && (
                      <p className="mt-1 text-sm text-gray-500">Loading your household members...</p>
                    )}
                  </div>

                  {/* Vehicle Type */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-2" htmlFor="vehicleType">
                      Vehicle Type
                    </label>
                    <select
                      {...register('vehicleType')}
                      className="w-full rounded-lg border-0 bg-gray-50 focus:ring-2 focus:ring-primary px-4 py-3 text-text appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem',
                      }}
                    >
                      {vehicleTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.vehicleType && (
                      <p className="mt-1 text-sm text-red-600">{errors.vehicleType.message}</p>
                    )}
                  </div>

                  {/* Plate Number */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-2" htmlFor="plateNumber">
                      Plate Number
                    </label>
                    <Input
                      {...register('plateNumber')}
                      id="plateNumber"
                      type="text"
                      placeholder="e.g., ABC 1234"
                      className={errors.plateNumber ? 'border-red-500' : ''}
                    />
                    {errors.plateNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.plateNumber.message}</p>
                    )}
                  </div>

                  {/* Brand and Model */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text mb-2" htmlFor="make">
                        Brand
                      </label>
                      <Input
                        {...register('make')}
                        id="make"
                        type="text"
                        placeholder="e.g., Toyota"
                        className={errors.make ? 'border-red-500' : ''}
                      />
                      {errors.make && (
                        <p className="mt-1 text-sm text-red-600">{errors.make.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-2" htmlFor="model">
                        Model
                      </label>
                      <Input
                        {...register('model')}
                        id="model"
                        type="text"
                        placeholder="e.g., Vios"
                        className={errors.model ? 'border-red-500' : ''}
                      />
                      {errors.model && (
                        <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-2" htmlFor="color">
                      Color
                    </label>
                    <Input
                      {...register('color')}
                      id="color"
                      type="text"
                      placeholder="e.g., Silver"
                      className={errors.color ? 'border-red-500' : ''}
                    />
                    {errors.color && (
                      <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
                    )}
                  </div>

                  {/* Proof of Ownership Upload */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Upload Proof of Ownership
                    </label>
                    <div
                      className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
                        isDragOver
                          ? 'border-primary bg-primary/5'
                          : fileError
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300 hover:border-primary/50'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={handleUploadAreaClick}
                    >
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                          >
                            <span>{selectedFile ? 'Change file' : 'Upload a file'}</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                        {selectedFile && (
                          <p className="text-sm text-primary mt-2">
                            Selected: {selectedFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                    {fileError && (
                      <p className="mt-1 text-sm text-red-600">{fileError}</p>
                    )}
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-2" htmlFor="remarks">
                      Remarks
                    </label>
                    <textarea
                      {...register('remarks')}
                      className="w-full rounded-lg border-0 bg-gray-50 focus:ring-2 focus:ring-primary px-4 py-3 text-text"
                      rows={4}
                      placeholder="Any additional information..."
                    />
                    {errors.remarks && (
                      <p className="mt-1 text-sm text-red-600">{errors.remarks.message}</p>
                    )}
                  </div>

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
                      disabled={isSubmitting}
                      className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-lg transition-all"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  </div>
                </form>
        </div>
      </div>
    </div>
  )
}
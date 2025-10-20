import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useTenant } from './useTenant'
import type { SelectedMember } from '@/lib/validations/people-sticker'

interface DocumentUploadResult {
  success: boolean
  url?: string
  error?: string
}

interface MemberEligibilityStatus {
  [memberId: string]: {
    hasActiveSticker: boolean
    loading: boolean
    error?: string
  }
}

export function useMemberSelection() {
  const { tenant } = useTenant()
  const [eligibilityStatus, setEligibilityStatus] = useState<MemberEligibilityStatus>({})
  const [uploadProgress, setUploadProgress] = useState<Record<string, { id?: number; photo?: number }>>({})

  // Check if a member already has an active people sticker
  const checkMemberEligibility = useCallback(async (memberId: string): Promise<boolean> => {
    if (!tenant?.id) return false

    setEligibilityStatus(prev => ({
      ...prev,
      [memberId]: { ...prev[memberId], loading: true }
    }))

    try {
      const { data: hasSticker, error } = await supabase
        .rpc('has_active_people_sticker', {
          p_tenant_id: tenant.id,
          p_member_id: memberId
        })

      if (error) {
        throw error
      }

      setEligibilityStatus(prev => ({
        ...prev,
        [memberId]: {
          hasActiveSticker: !!hasSticker,
          loading: false
        }
      }))

      return !hasSticker
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check eligibility'

      setEligibilityStatus(prev => ({
        ...prev,
        [memberId]: {
          hasActiveSticker: false,
          loading: false,
          error: errorMessage
        }
      }))

      console.error('Error checking member eligibility:', err)
      return true // Allow selection if check fails
    }
  }, [tenant?.id])

  // Check eligibility for multiple members
  const checkMultipleMembersEligibility = useCallback(async (memberIds: string[]): Promise<string[]> => {
    const eligibleMembers: string[] = []

    for (const memberId of memberIds) {
      const isEligible = await checkMemberEligibility(memberId)
      if (isEligible) {
        eligibleMembers.push(memberId)
      }
    }

    return eligibleMembers
  }, [checkMemberEligibility])

  // Upload document for a member
  const uploadMemberDocument = useCallback(async (
    memberId: string,
    documentType: 'id' | 'photo',
    file: File
  ): Promise<DocumentUploadResult> => {
    if (!tenant?.id) {
      return {
        success: false,
        error: 'Tenant information is missing'
      }
    }

    try {
      // Set upload progress
      setUploadProgress(prev => ({
        ...prev,
        [memberId]: {
          ...prev[memberId],
          [documentType]: 0
        }
      }))

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `people-sticker-docs/${tenant.id}/${memberId}/${documentType}-${fileName}`

      // Set upload progress to 50% when starting upload
      setUploadProgress(prev => ({
        ...prev,
        [memberId]: {
          ...prev[memberId],
          [documentType]: 50
        }
      }))

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      // Set upload progress to 100% before clearing
      setUploadProgress(prev => ({
        ...prev,
        [memberId]: {
          ...prev[memberId],
          [documentType]: 100
        }
      }))

      // Clear upload progress after a short delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const updated = { ...prev }
          if (updated[memberId]) {
            delete updated[memberId][documentType]
          }
          return updated
        })
      }, 500)

      return {
        success: true,
        url: publicUrl
      }
    } catch (err) {
      // Clear upload progress on error
      setUploadProgress(prev => {
        const updated = { ...prev }
        if (updated[memberId]) {
          delete updated[memberId][documentType]
        }
        return updated
      })

      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      console.error(`Failed to upload ${documentType} document:`, err)

      return {
        success: false,
        error: errorMessage
      }
    }
  }, [tenant?.id])

  // Remove uploaded document
  const removeMemberDocument = useCallback(async (
    filePath: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.storage
        .from('documents')
        .remove([filePath])

      if (error) {
        throw error
      }

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove document'
      console.error('Failed to remove document:', err)

      return {
        success: false,
        error: errorMessage
      }
    }
  }, [])

  // Validate member selection
  const validateSelection = useCallback((members: SelectedMember[]): {
    isValid: boolean
    errors: string[]
    selectedCount: number
    eligibleCount: number
  } => {
    const errors: string[] = []
    const selectedMembers = members.filter(member => member.selected)
    const eligibleMembers = members.filter(member => !member.has_active_sticker)
    const selectedEligibleMembers = selectedMembers.filter(member => !member.has_active_sticker)

    if (selectedMembers.length === 0) {
      errors.push('Please select at least one household member')
    }

    if (selectedEligibleMembers.length === 0) {
      errors.push('Selected members already have active stickers')
    }

    // Check for members with uploading documents
    const uploadingMembers = selectedMembers.filter(member =>
      member.id_document_uploading || member.photo_uploading
    )

    if (uploadingMembers.length > 0) {
      errors.push('Please wait for all document uploads to complete')
    }

    return {
      isValid: errors.length === 0,
      errors,
      selectedCount: selectedMembers.length,
      eligibleCount: eligibleMembers.length
    }
  }, [])

  // Get selection summary
  const getSelectionSummary = useCallback((members: SelectedMember[]) => {
    const selectedMembers = members.filter(member => member.selected)
    const eligibleMembers = members.filter(member => !member.has_active_sticker)
    const selectedEligibleMembers = selectedMembers.filter(member => !member.has_active_sticker)
    const membersWithActiveStickers = members.filter(member => member.has_active_sticker)

    return {
      totalMembers: members.length,
      selectedCount: selectedMembers.length,
      eligibleCount: eligibleMembers.length,
      selectedEligibleCount: selectedEligibleMembers.length,
      ineligibleCount: membersWithActiveStickers.length,
      canSelectAll: eligibleMembers.length > 0,
      allEligibleSelected: eligibleMembers.length > 0 && eligibleMembers.every(member => member.selected)
    }
  }, [])

  return {
    eligibilityStatus,
    uploadProgress,
    checkMemberEligibility,
    checkMultipleMembersEligibility,
    uploadMemberDocument,
    removeMemberDocument,
    validateSelection,
    getSelectionSummary
  }
}
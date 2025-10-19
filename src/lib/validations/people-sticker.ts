import { z } from 'zod'

// =============================================================================
// BASE VALIDATION SCHEMAS
// =============================================================================

// UUID validation for database references
const uuidSchema = z
  .string()
  .uuid('Please select a valid option')

// Optional file validation for ID documents and photos
const optionalFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
  .refine(
    (file) => ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type),
    'File must be JPG, PNG, or PDF'
  )
  .optional()

// Optional remarks validation
const remarksSchema = z
  .string()
  .max(500, 'Remarks must be at most 500 characters')
  .optional()

// =============================================================================
// MEMBER SELECTION SCHEMAS
// =============================================================================

// Individual member selection with optional documents
export const SelectedMemberSchema = z.object({
  // Member identification
  member_id: uuidSchema,
  member_name: z.string().min(1, 'Member name is required'),
  relationship: z.string().min(1, 'Relationship is required'),

  // Optional documents
  id_document: optionalFileSchema,
  photo: optionalFileSchema,

  // Selection state
  selected: z.boolean().default(false),

  // Upload status tracking
  id_document_uploading: z.boolean().default(false),
  photo_uploading: z.boolean().default(false),

  // Eligibility check
  has_active_sticker: z.boolean().default(false),
})

export type SelectedMember = z.infer<typeof SelectedMemberSchema>

// Member selection for form state (includes files)
export const MemberSelectionFormSchema = z.object({
  members: z.array(SelectedMemberSchema).min(1, 'At least one member must be available'),
  remarks: remarksSchema,
})

export type MemberSelectionForm = z.infer<typeof MemberSelectionFormSchema>

// =============================================================================
// API SUBMISSION SCHEMAS
// =============================================================================

// Individual member data for API submission (after file upload)
export const ApiMemberSchema = z.object({
  member_id: uuidSchema,
  member_name: z.string(),
  relationship: z.string(),
  id_document_url: z.string().url().optional(),
  photo_url: z.string().url().optional(),
})

export type ApiMember = z.infer<typeof ApiMemberSchema>

// People sticker request for API submission
export const PeopleStickerRequestSchema = z.object({
  household_id: uuidSchema,
  selected_members: z.array(ApiMemberSchema).min(1, 'At least one member must be selected'),
  remarks: remarksSchema,
})

export type PeopleStickerRequestData = z.infer<typeof PeopleStickerRequestSchema>

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

// Validate member selection has at least one selected member
export const validateMemberSelection = (members: SelectedMember[]): string | null => {
  const selectedMembers = members.filter(member => member.selected && !member.has_active_sticker)

  if (selectedMembers.length === 0) {
    return 'Please select at least one household member who does not already have an active sticker'
  }

  return null
}

// Validate individual member for eligibility
export const validateMemberEligibility = (member: SelectedMember): string | null => {
  if (member.has_active_sticker) {
    return `${member.member_name} already has an active people sticker`
  }

  return null
}

// Check if any required documents are still uploading
export const hasUploadingDocuments = (members: SelectedMember[]): boolean => {
  return members.some(member =>
    member.selected && (member.id_document_uploading || member.photo_uploading)
  )
}

// Get selected members for API submission
export const getSelectedMembersForSubmission = (members: SelectedMember[]): SelectedMember[] => {
  return members.filter(member => member.selected && !member.has_active_sticker)
}

// =============================================================================
// FILE UPLOAD VALIDATION
// =============================================================================

// Validate file upload for member documents
export const validateMemberDocument = (file: File | null, documentType: 'id' | 'photo'): string | null => {
  if (!file) {
    return null // Optional documents
  }

  if (file.size > 5 * 1024 * 1024) {
    return `${documentType === 'id' ? 'ID document' : 'Photo'} must be less than 5MB`
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
  if (!allowedTypes.includes(file.type)) {
    return `${documentType === 'id' ? 'ID document' : 'Photo'} must be JPG, PNG, or PDF`
  }

  return null
}

// =============================================================================
// FORM TRANSFORMATION HELPERS
// =============================================================================

// Transform household members to selectable format
export const transformMembersToSelectable = (
  members: Array<{
    id: string
    name: string
    relationship?: { name: string }
  }>,
  activeStickers: string[] = []
): SelectedMember[] => {
  return members.map(member => ({
    member_id: member.id,
    member_name: member.name,
    relationship: member.relationship?.name || 'Unknown',
    selected: false,
    has_active_sticker: activeStickers.includes(member.id),
    id_document_uploading: false,
    photo_uploading: false,
  }))
}

// Transform selected members to API format (after file uploads)
export const transformToApiFormat = (
  selectedMembers: SelectedMember[],
  uploadResults: Record<string, { id_document_url?: string; photo_url?: string }>
): ApiMember[] => {
  return selectedMembers
    .filter(member => member.selected && !member.has_active_sticker)
    .map(member => ({
      member_id: member.member_id,
      member_name: member.member_name,
      relationship: member.relationship,
      id_document_url: uploadResults[member.member_id]?.id_document_url,
      photo_url: uploadResults[member.member_id]?.photo_url,
    }))
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const defaultPeopleStickerForm: Pick<MemberSelectionForm, 'remarks'> = {
  remarks: '',
}

// =============================================================================
// FORM SUBMISSION VALIDATION
// =============================================================================

export const validatePeopleStickerSubmission = (
  formData: MemberSelectionForm
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {}

  // Check if at least one member is selected
  const selectionError = validateMemberSelection(formData.members)
  if (selectionError) {
    errors.members = selectionError
  }

  // Check for uploading documents
  if (hasUploadingDocuments(formData.members)) {
    errors.uploads = 'Please wait for all document uploads to complete'
  }

  // Validate individual members
  formData.members.forEach((member, index) => {
    if (member.selected) {
      const eligibilityError = validateMemberEligibility(member)
      if (eligibilityError) {
        errors[`member_${index}`] = eligibilityError
      }
    }
  })

  // Validate remarks if provided
  if (formData.remarks && formData.remarks.length > 500) {
    errors.remarks = 'Remarks must be at most 500 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
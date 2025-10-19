import { z } from 'zod'

// =============================================================================
// BASE VALIDATION SCHEMAS
// =============================================================================

// UUID validation for database references
const uuidSchema = z
  .string()
  .uuid('Please select a valid option')

// Vehicle plate number validation
const plateNumberSchema = z
  .string()
  .min(1, 'Plate number is required')
  .max(20, 'Plate number must be at most 20 characters')
  .regex(/^[A-Za-z0-9\s\-]+$/, 'Plate number contains invalid characters')

// Vehicle make/model validation
const vehicleNameSchema = z
  .string()
  .min(1, 'This field is required')
  .max(50, 'Must be at most 50 characters')
  .regex(/^[a-zA-Z0-9\s\-\.]+$/, 'Contains invalid characters')

// Vehicle color validation
const colorSchema = z
  .string()
  .min(1, 'Color is required')
  .max(30, 'Color must be at most 30 characters')
  .regex(/^[a-zA-Z\s\-]+$/, 'Color contains invalid characters')

// File validation
const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
  .refine(
    (file) => ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type),
    'File must be JPG, PNG, or PDF'
  )

// Optional remarks validation
const remarksSchema = z
  .string()
  .max(500, 'Remarks must be at most 500 characters')
  .optional()

// =============================================================================
// VEHICLE STICKER REQUEST VALIDATION
// =============================================================================

export const VehicleTypeSchema = z.enum(['sedan', 'suv', 'motorcycle', 'van'], {
  errorMap: () => ({ message: 'Please select a valid vehicle type' })
})

export const VehicleStickerRequestSchema = z.object({
  // Household member selection
  householdMemberId: uuidSchema,

  // Vehicle information
  vehicleType: VehicleTypeSchema,
  plateNumber: plateNumberSchema,
  make: vehicleNameSchema,
  model: vehicleNameSchema,
  color: colorSchema,

  // Proof of ownership
  proofFile: fileSchema,

  // Optional remarks
  remarks: remarksSchema,
})

export type VehicleStickerRequestData = z.infer<typeof VehicleStickerRequestSchema>

// =============================================================================
// HOUSEHOLD MEMBER SELECTION
// =============================================================================

export const HouseholdMemberOption = z.object({
  id: uuidSchema,
  name: z.string(),
  relationshipCode: z.string(),
  relationshipName: z.string(),
  isPrimary: z.boolean(),
})

export type HouseholdMemberOption = z.infer<typeof HouseholdMemberOption>

// =============================================================================
// FORM VALIDATION HELPERS
// =============================================================================

// Helper to validate individual fields
export const validateStickerField = <T>(schema: z.ZodSchema<T>, value: T): string | null => {
  try {
    schema.parse(value)
    return null
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || 'Invalid value'
    }
    return 'Validation error'
  }
}

// Helper to get field-specific error messages
export const getStickerFieldError = (
  errors: z.ZodError | null,
  fieldPath: string
): string | null => {
  if (!errors) return null

  const fieldError = errors.errors.find(error =>
    error.path.join('.') === fieldPath
  )

  return fieldError?.message || null
}

// =============================================================================
// API DATA TRANSFORMATION
// =============================================================================

export const transformStickerRequestToAPI = (
  formData: VehicleStickerRequestData,
  tenantId: string,
  householdId: string,
  requesterId: string,
  proofFileUrl: string
) => {
  return {
    tenant_id: tenantId,
    requester_id: requesterId,
    household_id: householdId,
    household_member_id: formData.householdMemberId,
    vehicle_type: formData.vehicleType,
    vehicle_make: formData.make,
    vehicle_model: formData.model,
    vehicle_plate: formData.plateNumber,
    vehicle_color: formData.color,
    proof_file_url: proofFileUrl,
    remarks: formData.remarks || null,
  }
}

// =============================================================================
// DEFAULT FORM VALUES
// =============================================================================

export const defaultStickerRequestValues: Omit<VehicleStickerRequestData, 'proofFile'> = {
  householdMemberId: '',
  vehicleType: 'sedan',
  plateNumber: '',
  make: '',
  model: '',
  color: '',
  remarks: '',
}

// =============================================================================
// VEHICLE TYPE OPTIONS
// =============================================================================

export const vehicleTypeOptions = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'van', label: 'Van' },
] as const

// =============================================================================
// FILE UPLOAD VALIDATION
// =============================================================================

export const validateFileUpload = (file: File | null): string | null => {
  if (!file) {
    return 'Proof of ownership is required'
  }

  if (file.size > 10 * 1024 * 1024) {
    return 'File size must be less than 10MB'
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
  if (!allowedTypes.includes(file.type)) {
    return 'File must be JPG, PNG, or PDF'
  }

  return null
}

// =============================================================================
// STICKER TYPE DEFINITIONS
// =============================================================================

export const StickerTypeSchema = z.enum(['vehicle', 'people', 'construction', 'visitor'], {
  errorMap: () => ({ message: 'Please select a valid sticker type' })
})

export type StickerType = z.infer<typeof StickerTypeSchema>

// =============================================================================
// FORM SUBMISSION VALIDATION
// =============================================================================

export const validateStickerRequestSubmission = (
  formData: VehicleStickerRequestData
): { isValid: boolean; errors: Record<string, string> } => {
  try {
    VehicleStickerRequestSchema.parse(formData)
    return { isValid: true, errors: {} }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return { isValid: false, errors }
    }
    return { isValid: false, errors: { general: 'Validation failed' } }
  }
}
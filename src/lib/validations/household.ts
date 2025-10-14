import { z } from 'zod'

// =============================================================================
// BASE VALIDATION SCHEMAS
// =============================================================================

// Phone number validation (flexible format)
const phoneSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(20, 'Phone number must be at most 20 characters')
  .regex(/^[\d\s\-\+\(\)\.]+$/, 'Phone number contains invalid characters')

// Email validation
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

// Name validation (required names)
const requiredNameSchema = z
  .string()
  .min(1, 'This field is required')
  .max(50, 'Name must be at most 50 characters')
  .regex(/^[a-zA-Z\s\-\.\']+$/, 'Name contains invalid characters')

// Optional name validation
const optionalNameSchema = z
  .string()
  .max(50, 'Name must be at most 50 characters')
  .regex(/^[a-zA-Z\s\-\.\']*$/, 'Name contains invalid characters')
  .optional()

// Password validation
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be at most 100 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  )

// UUID validation for lookup values
const uuidSchema = z
  .string()
  .uuid('Please select a valid option')

// =============================================================================
// ADDRESS VALIDATION
// =============================================================================

export const AddressInfoSchema = z.object({
  lotNumber: z
    .string()
    .min(1, 'Lot number is required')
    .max(20, 'Lot number must be at most 20 characters')
    .regex(/^[a-zA-Z0-9\-\s]+$/, 'Lot number contains invalid characters'),

  street: z
    .string()
    .min(1, 'Street name is required')
    .max(100, 'Street name must be at most 100 characters')
    .regex(/^[a-zA-Z0-9\s\-\.\,\']+$/, 'Street name contains invalid characters'),
})

export type AddressInfo = z.infer<typeof AddressInfoSchema>

// =============================================================================
// HOUSEHOLD HEAD VALIDATION
// =============================================================================

export const HouseholdHeadInfoSchema = z.object({
  firstName: requiredNameSchema,
  middleName: optionalNameSchema,
  lastName: requiredNameSchema,
  suffix: optionalNameSchema,
  phone: phoneSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type HouseholdHeadInfo = z.infer<typeof HouseholdHeadInfoSchema>

// =============================================================================
// HOUSEHOLD MEMBER VALIDATION
// =============================================================================

export const HouseholdMemberSchema = z.object({
  firstName: requiredNameSchema,
  middleName: optionalNameSchema,
  lastName: requiredNameSchema,
  suffix: optionalNameSchema,
  relationshipId: uuidSchema,
  relationshipName: z.string(), // For display purposes, populated from lookup
  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)\.]*$/, 'Phone number contains invalid characters')
    .optional(),
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
})

export type HouseholdMemberInfo = z.infer<typeof HouseholdMemberSchema>

// =============================================================================
// COMPLETE HOUSEHOLD FORM VALIDATION
// =============================================================================

export const NewHouseholdFormSchema = z.object({
  // Step 1: Address Information
  address: AddressInfoSchema,

  // Step 2: Household Head Information
  householdHead: HouseholdHeadInfoSchema,

  // Note: Members will be added separately after household creation
})

export type NewHouseholdFormData = z.infer<typeof NewHouseholdFormSchema>

// =============================================================================
// STEP-BY-STEP VALIDATION SCHEMAS
// =============================================================================

// For individual step validation
export const Step1Schema = z.object({
  address: AddressInfoSchema,
})

export const Step2Schema = z.object({
  householdHead: HouseholdHeadInfoSchema,
})

// Step 3 removed - members will be managed separately

// =============================================================================
// FORM FIELD VALIDATION HELPERS
// =============================================================================

// Helper to validate individual fields
export const validateField = <T>(schema: z.ZodSchema<T>, value: T): string | null => {
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

// Helper to validate email uniqueness (to be used with API call)
export const EmailAvailabilitySchema = z.object({
  email: emailSchema,
})

// Helper to get field-specific error messages
export const getFieldError = (
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
// FORM DATA TRANSFORMERS
// =============================================================================

// Transform form data to API format
export const transformFormDataToAPI = (
  formData: NewHouseholdFormData,
  tenantId: string,
  pendingStatusId: string
) => {
  const { address, householdHead } = formData

  // Household data for database
  const householdData = {
    tenant_id: tenantId,
    address: `${address.lotNumber} ${address.street}`,
    status_id: pendingStatusId,
  }

  // User data for household head
  const headUserData = {
    tenant_id: tenantId,
    email: householdHead.email,
    first_name: householdHead.firstName,
    middle_name: householdHead.middleName || null,
    last_name: householdHead.lastName,
    suffix: householdHead.suffix || null,
    phone: householdHead.phone,
    // Note: password will be handled by auth system
  }

  // No members during creation - will be added separately
  const memberData: any[] = []

  return {
    householdData,
    headUserData,
    memberData,
  }
}

// =============================================================================
// DEFAULT FORM VALUES
// =============================================================================

export const defaultFormValues: NewHouseholdFormData = {
  address: {
    lotNumber: '',
    street: '',
  },
  householdHead: {
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
  // Note: Members removed from creation flow
}

// Default member values for adding new members
export const defaultMemberValues: HouseholdMemberInfo = {
  firstName: '',
  middleName: '',
  lastName: '',
  suffix: '',
  relationshipId: '',
  relationshipName: '',
  phone: '',
  email: '',
}
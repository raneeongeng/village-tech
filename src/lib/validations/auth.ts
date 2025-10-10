import { z } from 'zod'

// Login form validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters long'),
  tenant_id: z.string().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Tenant selection validation schema
export const tenantSelectionSchema = z.object({
  tenant_id: z.string().min(1, 'Please select a village'),
})

export type TenantSelectionData = z.infer<typeof tenantSelectionSchema>

// Password validation schema (for future registration)
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  )

// Registration form validation schema (for future use)
export const registrationSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    full_name: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Full name must be at least 2 characters long'),
    tenant_id: z.string().min(1, 'Please select a village'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type RegistrationFormData = z.infer<typeof registrationSchema>

// User profile validation schema
export const userProfileSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters long'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  role: z.enum([
    'superadmin',
    'admin-head',
    'admin-officer',
    'household-head',
    'household-member',
    'beneficial-user',
    'security-head',
    'security-officer',
  ]),
  is_active: z.boolean(),
})

export type UserProfileData = z.infer<typeof userProfileSchema>

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
})

export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>

// Reset password validation schema
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>
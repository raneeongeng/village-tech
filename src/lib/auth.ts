import { supabase } from './supabase/client'
import type { LoginFormData, User, UserProfile, AuthSession } from '@/types/auth'

export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  credentials: { email: string; password: string }
): Promise<AuthSession> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      throw new AuthError(error.message)
    }

    if (!data.user || !data.session) {
      throw new AuthError('Authentication failed')
    }

    // Get the complete user profile with tenant and role data
    const userProfile = await getUserProfile(data.user.id)

    const userSession: AuthSession = {
      user: userProfile,
      tenant: userProfile.tenant,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at || 0,
    }

    return userSession
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError('Invalid email or password')
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new AuthError(error.message)
    }

    // Clear any cached data or local storage if needed
    if (typeof window !== 'undefined') {
      // Clear any auth-related localStorage items
      localStorage.removeItem('supabase.auth.token')
      // Clear any session storage items
      sessionStorage.clear()
    }
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError('Failed to sign out')
  }
}

/**
 * Get current session
 */
export async function getCurrentSession(): Promise<AuthSession | null> {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      throw new AuthError(error.message)
    }

    if (!session?.user) {
      return null
    }

    const userProfile = await getUserProfile(session.user.id)

    return {
      user: userProfile,
      tenant: userProfile.tenant,
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at || 0,
    }
  } catch (error) {
    console.error('Error getting current session:', error)
    return null
  }
}

/**
 * Get user profile with role and tenant information
 */
async function getUserProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      email,
      first_name,
      middle_name,
      last_name,
      suffix,
      is_active,
      last_login_at,
      created_at,
      updated_at,
      tenant:villages!tenant_id(
        id,
        name,
        status:lookup_values!villages_status_id_fkey(
          id,
          code,
          name,
          color_code,
          icon
        )
      ),
      role:lookup_values!users_role_id_fkey(
        id,
        code,
        name,
        description,
        color_code,
        icon
      )
    `)
    .eq('id', userId)
    .single()

  if (error) {
    throw new AuthError('Failed to fetch user profile')
  }

  if (!data) {
    throw new AuthError('User profile not found')
  }

  return data as UserProfile
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: User | UserProfile, permission: string): boolean {
  const roleCode = user.role.code

  const rolePermissions = {
    superadmin: ['*'], // All permissions
    admin_head: [
      'manage_households',
      'manage_fees',
      'manage_security',
      'manage_rules',
      'view_reports',
    ],
    admin_officer: ['manage_households', 'manage_fees', 'manage_deliveries'],
    household_head: ['manage_household', 'submit_requests', 'view_rules'],
    security_officer: ['manage_gate_logs', 'manage_visitors', 'view_incidents'],
  }

  const userPermissions = rolePermissions[roleCode as keyof typeof rolePermissions] || []
  return userPermissions.includes('*') || userPermissions.includes(permission)
}

/**
 * Detect tenant from subdomain
 */
export function detectTenantFromSubdomain(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const hostname = window.location.hostname
  const parts = hostname.split('.')

  // Check if we have a subdomain (more than 2 parts for domain.com)
  // or more than 3 parts for domain.co.uk style domains
  if (parts.length >= 3) {
    return parts[0] // Return the subdomain
  }

  return null
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generate secure password requirements
 */
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
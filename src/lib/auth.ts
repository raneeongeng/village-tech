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

    // Clear cached data
    if (typeof window !== 'undefined') {
      // Clear our cached user profile, tenant info, and household info
      sessionStorage.removeItem(CACHE_KEYS.USER_PROFILE)
      sessionStorage.removeItem(CACHE_KEYS.TENANT_INFO)
      sessionStorage.removeItem(CACHE_KEYS.HOUSEHOLD_INFO)
      // Clear any auth-related localStorage items
      localStorage.removeItem('supabase.auth.token')
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
 * Cache keys for session storage
 */
const CACHE_KEYS = {
  USER_PROFILE: 'vmp_user_profile',
  TENANT_INFO: 'vmp_tenant_info',
  HOUSEHOLD_INFO: 'vmp_household_info',
}

/**
 * Get user profile with role and tenant information
 * Uses sessionStorage cache to avoid repeated database queries
 */
async function getUserProfile(userId: string): Promise<UserProfile> {
  // Try to get from cache first
  if (typeof window !== 'undefined') {
    const cachedProfile = sessionStorage.getItem(CACHE_KEYS.USER_PROFILE)
    if (cachedProfile) {
      try {
        const profile = JSON.parse(cachedProfile) as UserProfile
        // Verify the cached profile matches the requested userId
        if (profile.id === userId) {
          return profile
        }
      } catch (e) {
        // Invalid cache, continue to fetch fresh data
      }
    }
  }
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
      tenant_id,
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
    console.error('Error fetching user profile:', error)
    throw new AuthError(`Failed to fetch user profile: ${error.message}`)
  }

  if (!data) {
    console.error('No user data returned for userId:', userId)
    throw new AuthError('User profile not found')
  }

  console.log('User profile loaded:', {
    userId: data.id,
    email: data.email,
    hasTenant: !!data.tenant,
    hasRole: !!data.role,
    tenant_id: data.tenant_id
  })

  const profile = data as any as UserProfile

  // Cache the profile in sessionStorage
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(CACHE_KEYS.USER_PROFILE, JSON.stringify(profile))
    // Also cache just the tenant info separately for easy access
    if (profile.tenant) {
      sessionStorage.setItem(CACHE_KEYS.TENANT_INFO, JSON.stringify(profile.tenant))
    }

    // For household_head users, fetch and cache their household
    if (profile.role.code === 'household_head') {
      // Use async IIFE to handle the promise properly
      ;(async () => {
        try {
          const { data: households, error } = await supabase
            .from('households')
            .select('id, address, status_id')
            .eq('tenant_id', profile.tenant_id)
            .eq('household_head_id', profile.id)
            .limit(1)

          if (!error && households && households.length > 0) {
            sessionStorage.setItem(CACHE_KEYS.HOUSEHOLD_INFO, JSON.stringify(households[0]))
            console.log('Cached household info:', households[0].id)
          } else {
            console.log('No household found for user')
            sessionStorage.setItem(CACHE_KEYS.HOUSEHOLD_INFO, 'null')
          }
        } catch (err: any) {
          console.error('Error fetching household:', err)
          sessionStorage.setItem(CACHE_KEYS.HOUSEHOLD_INFO, 'null')
        }
      })()
    }
  }

  return profile
}

/**
 * Get cached tenant info from sessionStorage
 * Fast way to access tenant without querying database
 */
export function getCachedTenantInfo(): { id: string; name: string } | null {
  if (typeof window === 'undefined') {
    return null
  }

  const cachedTenant = sessionStorage.getItem(CACHE_KEYS.TENANT_INFO)
  if (cachedTenant) {
    try {
      return JSON.parse(cachedTenant)
    } catch (e) {
      return null
    }
  }

  return null
}

/**
 * Get cached household info from sessionStorage
 * Fast way to access household without querying database
 */
export function getCachedHouseholdInfo(): { id: string; address: string; status_id: string } | null {
  if (typeof window === 'undefined') {
    return null
  }

  const cachedHousehold = sessionStorage.getItem(CACHE_KEYS.HOUSEHOLD_INFO)
  if (cachedHousehold && cachedHousehold !== 'null') {
    try {
      return JSON.parse(cachedHousehold)
    } catch (e) {
      return null
    }
  }

  return null
}

/**
 * Clear cached user data (useful for forcing refresh)
 */
export function clearAuthCache(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(CACHE_KEYS.USER_PROFILE)
    sessionStorage.removeItem(CACHE_KEYS.TENANT_INFO)
    sessionStorage.removeItem(CACHE_KEYS.HOUSEHOLD_INFO)
  }
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
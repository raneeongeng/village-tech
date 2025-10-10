import { User as SupabaseUser } from '@supabase/supabase-js'

// Base user roles in the system
export type UserRole =
  | 'superadmin'
  | 'admin_head'
  | 'admin_officer'
  | 'household_head'
  | 'security_officer'

// Lookup value structure for roles and statuses
export interface LookupValue {
  id: string
  code: string
  name: string
  description?: string
  color_code?: string
  icon?: string
}

// Extended user interface with VMP-specific fields
export interface User extends SupabaseUser {
  id: string
  email: string
  first_name: string
  middle_name?: string
  last_name: string
  suffix?: string
  is_active: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
  role: LookupValue
  tenant_id: string
}

// User profile with tenant information (from database queries)
export interface UserProfile extends User {
  tenant: Tenant
}

// Tenant/Village information
export interface Tenant {
  id: string
  name: string
  status: LookupValue
}

// Tenant-specific settings
export interface TenantSettings {
  allow_registration: boolean
  require_approval: boolean
  branding: {
    logo_url?: string
    primary_color?: string
    secondary_color?: string
  }
}

// Authentication session with VMP context
export interface AuthSession {
  user: UserProfile
  tenant: Tenant
  access_token: string
  refresh_token: string
  expires_at: number
}

// Role permissions for navigation and features
export interface RolePermissions {
  role: UserRole
  permissions: string[]
  navigation: string[]
  restricted_routes: string[]
}

// Login form data
export interface LoginFormData {
  email: string
  password: string
  tenant_id?: string
}

// Tenant selection data
export interface TenantSelectionData {
  tenant_id: string
  subdomain: string
  name: string
}
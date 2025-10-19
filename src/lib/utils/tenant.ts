import type { Tenant } from '@/types/auth'
import { supabase } from '@/lib/supabase/client'

/**
 * Detect tenant from subdomain
 */
export function detectTenantFromSubdomain(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const hostname = window.location.hostname

  // Skip localhost and IP addresses for development
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null
  }

  const parts = hostname.split('.')

  // Check if we have a subdomain (more than 2 parts for domain.com)
  // or more than 3 parts for domain.co.uk style domains
  if (parts.length >= 3) {
    const subdomain = parts[0]

    // Skip common subdomains that aren't tenants
    const systemSubdomains = ['www', 'api', 'admin', 'app', 'mail', 'ftp']
    if (systemSubdomains.includes(subdomain)) {
      return null
    }

    return subdomain
  }

  return null
}

/**
 * Get tenant from server-side request headers
 */
export function detectTenantFromHeaders(headers: Headers): string | null {
  const host = headers.get('host')

  if (!host) {
    return null
  }

  // Skip localhost and IP addresses for development
  if (host.includes('localhost') || /^\d+\.\d+\.\d+\.\d+/.test(host)) {
    return null
  }

  const parts = host.split('.')

  if (parts.length >= 3) {
    const subdomain = parts[0]

    // Skip common subdomains that aren't tenants
    const systemSubdomains = ['www', 'api', 'admin', 'app', 'mail', 'ftp']
    if (systemSubdomains.includes(subdomain)) {
      return null
    }

    return subdomain
  }

  return null
}

/**
 * Get tenant from session storage
 */
export function getTenantFromSessionStorage(): Tenant | null {
  if (typeof window === 'undefined') return null

  try {
    const tenantData = sessionStorage.getItem('vmp_tenant_info')
    if (!tenantData) return null

    return JSON.parse(tenantData) as Tenant
  } catch (error) {
    console.error('Failed to parse tenant from session storage:', error)
    return null
  }
}

/**
 * Set tenant in session storage
 */
export function setTenantInSessionStorage(tenant: Tenant): void {
  if (typeof window === 'undefined') return

  try {
    sessionStorage.setItem('vmp_tenant_info', JSON.stringify(tenant))
  } catch (error) {
    console.error('Failed to save tenant to session storage:', error)
  }
}

/**
 * Get tenant by subdomain
 */
export async function getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
  try {
    const { data, error } = await supabase
      .from('villages')
      .select('*')
      .eq('settings->>subdomain', subdomain)
      .eq('status_id', (await supabase.from('lookup_values').select('id').eq('code', 'active').single()).data?.id)
      .single()

    if (error) {
      console.error('Error fetching tenant by subdomain:', error)
      return null
    }

    return data as Tenant
  } catch (error) {
    console.error('Failed to fetch tenant by subdomain:', error)
    return null
  }
}

/**
 * Get all available tenants
 */
export async function getAllTenants(): Promise<Tenant[]> {
  // First check if we have a tenant in session storage
  const sessionTenant = getTenantFromSessionStorage()
  if (sessionTenant) {
    return [sessionTenant]
  }

  try {
    const { data, error } = await supabase
      .from('villages')
      .select('*')
      .eq('status_id', (await supabase.from('lookup_values').select('id').eq('code', 'active').single()).data?.id)

    if (error) {
      console.error('Error fetching tenants:', error)
      return []
    }

    return data as Tenant[]
  } catch (error) {
    console.error('Failed to fetch tenants:', error)
    return []
  }
}

/**
 * Validate tenant access
 */
export function validateTenantAccess(tenant: Tenant): boolean {
  return (tenant as any).is_active
}

/**
 * Get tenant-specific branding
 */
export function getTenantBranding(tenant: Tenant) {
  const t = tenant as any
  return {
    primaryColor: t.settings?.branding?.primary_color || '#22574A',
    secondaryColor: t.settings?.branding?.secondary_color || '#E8DCCA',
    logoUrl: t.settings?.branding?.logo_url,
  }
}

/**
 * Format tenant display name
 */
export function formatTenantName(tenant: Tenant): string {
  return tenant.name
}

/**
 * Check if tenant allows registration
 */
export function canRegisterInTenant(tenant: Tenant): boolean {
  return (tenant as any).settings?.allow_registration || false
}

/**
 * Check if tenant requires approval
 */
export function requiresApprovalInTenant(tenant: Tenant): boolean {
  return (tenant as any).settings?.require_approval || false
}
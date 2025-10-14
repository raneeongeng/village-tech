import type { Tenant } from '@/types/auth'

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
 * Mock tenant data for development
 * In production, this would fetch from Supabase
 */
export const MOCK_TENANTS: Tenant[] = [
  {
    id: '1',
    name: 'Greenville Village',
    subdomain: 'greenville',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    settings: {
      allow_registration: true,
      require_approval: false,
      branding: {
        primary_color: '#22574A',
        secondary_color: '#E8DCCA',
      },
    },
  } as any,
  {
    id: '2',
    name: 'Sunset Heights',
    subdomain: 'sunset-heights',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    settings: {
      allow_registration: false,
      require_approval: true,
      branding: {
        primary_color: '#22574A',
        secondary_color: '#E8DCCA',
      },
    },
  } as any,
  {
    id: '3',
    name: 'Riverside Commons',
    subdomain: 'riverside',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    settings: {
      allow_registration: true,
      require_approval: true,
      branding: {
        primary_color: '#22574A',
        secondary_color: '#E8DCCA',
      },
    },
  } as any,
]

/**
 * Get tenant by subdomain
 */
export async function getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
  // In production, this would query Supabase
  // For now, return mock data
  const tenant = MOCK_TENANTS.find(t => (t as any).subdomain === subdomain)
  return tenant || null
}

/**
 * Get all available tenants
 */
export async function getAllTenants(): Promise<Tenant[]> {
  // In production, this would query Supabase
  // For now, return mock data
  return MOCK_TENANTS.filter(t => (t as any).is_active)
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
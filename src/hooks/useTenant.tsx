'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Tenant } from '@/types/auth'
import {
  detectTenantFromSubdomain,
  getTenantBySubdomain,
  getAllTenants,
} from '@/lib/utils/tenant'

interface TenantContextType {
  tenant: Tenant | null
  availableTenants: Tenant[]
  isLoading: boolean
  error: string | null
  setTenant: (tenant: Tenant | null) => void
  refreshTenants: () => Promise<void>
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshTenants = async () => {
    try {
      const tenants = await getAllTenants()
      setAvailableTenants(tenants)
    } catch (err) {
      setError('Failed to load available tenants')
      console.error('Error loading tenants:', err)
    }
  }

  useEffect(() => {
    const initializeTenant = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // First, load all available tenants
        await refreshTenants()

        // Try to detect tenant from subdomain
        const detectedSubdomain = detectTenantFromSubdomain()

        if (detectedSubdomain) {
          const detectedTenant = await getTenantBySubdomain(detectedSubdomain)

          if (detectedTenant) {
            setTenant(detectedTenant)
          } else {
            setError(`Village "${detectedSubdomain}" not found`)
          }
        }
        // If no subdomain detected, tenant selection will be shown
      } catch (err) {
        setError('Failed to initialize tenant context')
        console.error('Error initializing tenant:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initializeTenant()
  }, [])

  const value: TenantContextType = {
    tenant,
    availableTenants,
    isLoading,
    error,
    setTenant,
    refreshTenants,
  }

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}

export function useTenantSelection() {
  const { tenant, availableTenants, setTenant } = useTenant()

  const needsTenantSelection = !tenant && availableTenants.length > 0

  const selectTenant = (tenantId: string) => {
    const selectedTenant = availableTenants.find(t => t.id === tenantId)
    if (selectedTenant) {
      setTenant(selectedTenant)
    }
  }

  return {
    needsTenantSelection,
    availableTenants,
    selectTenant,
    selectedTenant: tenant,
  }
}
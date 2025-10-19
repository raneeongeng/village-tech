'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Tenant } from '@/types/auth'
import {
  detectTenantFromSubdomain,
  getTenantBySubdomain,
  getAllTenants,
  getTenantFromSessionStorage,
  setTenantInSessionStorage,
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
        // First, check for tenant in session storage
        const sessionTenant = getTenantFromSessionStorage()
        console.log('Session storage tenant:', sessionTenant)

        if (sessionTenant) {
          setTenant(sessionTenant)
          setAvailableTenants([sessionTenant])
          console.log('Using tenant from session storage:', sessionTenant)
          return
        }

        // If no session tenant, load all available tenants
        const allTenants = await getAllTenants()
        setAvailableTenants(allTenants)

        // Try to detect tenant from subdomain
        const detectedSubdomain = detectTenantFromSubdomain()
        console.log('Detected subdomain:', detectedSubdomain)

        if (detectedSubdomain) {
          const detectedTenant = await getTenantBySubdomain(detectedSubdomain)
          console.log('Found tenant for subdomain:', detectedTenant)

          if (detectedTenant) {
            setTenant(detectedTenant)
            setTenantInSessionStorage(detectedTenant)
            console.log('Tenant set successfully:', detectedTenant)
          } else {
            setError(`Village "${detectedSubdomain}" not found`)
            console.log('No tenant found for subdomain:', detectedSubdomain)
          }
        } else {
          console.log('No subdomain detected, using first available tenant for development')
          // For development on localhost, automatically select the first tenant
          if (allTenants.length > 0) {
            setTenant(allTenants[0])
            setTenantInSessionStorage(allTenants[0])
            console.log('Auto-selected tenant for development:', allTenants[0])
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

  const setTenantWithStorage = (tenant: Tenant | null) => {
    setTenant(tenant)
    if (tenant) {
      setTenantInSessionStorage(tenant)
    }
  }

  const value: TenantContextType = {
    tenant,
    availableTenants,
    isLoading,
    error,
    setTenant: setTenantWithStorage,
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
'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { LookupService, LOOKUP_CATEGORIES } from '@/lib/api/services/lookup'
import type { LookupValue } from '@/types/village'

/**
 * Lookup context data structure
 */
interface LookupContextData {
  // Common lookup data
  householdStatuses: LookupValue[]
  relationshipTypes: LookupValue[]
  userRoles: LookupValue[]

  // Loading states
  loading: boolean
  error: string | null

  // Utility functions
  getHouseholdStatusById: (id: string) => LookupValue | undefined
  getRelationshipTypeById: (id: string) => LookupValue | undefined
  getUserRoleById: (id: string) => LookupValue | undefined
  getHouseholdStatusByCode: (code: string) => LookupValue | undefined
  getRelationshipTypeByCode: (code: string) => LookupValue | undefined
  getUserRoleByCode: (code: string) => LookupValue | undefined

  // Refresh function
  refresh: () => Promise<void>

  // Individual fetch functions for additional categories
  fetchValuesByCategoryCode: (categoryCode: string) => Promise<LookupValue[]>
}

/**
 * Default context value
 */
const defaultContextValue: LookupContextData = {
  householdStatuses: [],
  relationshipTypes: [],
  userRoles: [],
  loading: false,
  error: null,
  getHouseholdStatusById: () => undefined,
  getRelationshipTypeById: () => undefined,
  getUserRoleById: () => undefined,
  getHouseholdStatusByCode: () => undefined,
  getRelationshipTypeByCode: () => undefined,
  getUserRoleByCode: () => undefined,
  refresh: async () => {},
  fetchValuesByCategoryCode: async () => [],
}

/**
 * Lookup context
 */
const LookupContext = createContext<LookupContextData>(defaultContextValue)

/**
 * Hook to use lookup context
 */
export function useLookup(): LookupContextData {
  const context = useContext(LookupContext)
  if (!context) {
    throw new Error('useLookup must be used within a LookupProvider')
  }
  return context
}

/**
 * Lookup provider props
 */
interface LookupProviderProps {
  children: ReactNode
  preloadCommon?: boolean // Whether to preload common lookup data on mount
}

/**
 * Lookup provider component
 */
export function LookupProvider({ children, preloadCommon = true }: LookupProviderProps) {
  const [householdStatuses, setHouseholdStatuses] = useState<LookupValue[]>([])
  const [relationshipTypes, setRelationshipTypes] = useState<LookupValue[]>([])
  const [userRoles, setUserRoles] = useState<LookupValue[]>([])
  const [loading, setLoading] = useState(preloadCommon)
  const [error, setError] = useState<string | null>(null)

  /**
   * Load common lookup data
   */
  const loadCommonLookups = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await LookupService.getCommonLookups()

      if (result.success && result.data) {
        setHouseholdStatuses(result.data.householdStatuses)
        setRelationshipTypes(result.data.relationshipTypes)
        setUserRoles(result.data.userRoles)
      } else {
        throw new Error(result.error?.message || 'Failed to load common lookup data')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error loading common lookup data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Fetch values by category code (for additional categories)
   */
  const fetchValuesByCategoryCode = useCallback(async (categoryCode: string): Promise<LookupValue[]> => {
    try {
      const result = await LookupService.getValuesByCategoryCode(categoryCode)

      if (result.success && result.data) {
        return result.data
      } else {
        throw new Error(result.error?.message || `Failed to fetch values for ${categoryCode}`)
      }
    } catch (err) {
      console.error(`Error fetching values for category ${categoryCode}:`, err)
      return []
    }
  }, [])

  /**
   * Utility function to find household status by ID
   */
  const getHouseholdStatusById = useCallback((id: string) => {
    return householdStatuses.find(status => status.id === id)
  }, [householdStatuses])

  /**
   * Utility function to find relationship type by ID
   */
  const getRelationshipTypeById = useCallback((id: string) => {
    return relationshipTypes.find(type => type.id === id)
  }, [relationshipTypes])

  /**
   * Utility function to find user role by ID
   */
  const getUserRoleById = useCallback((id: string) => {
    return userRoles.find(role => role.id === id)
  }, [userRoles])

  /**
   * Utility function to find household status by code
   */
  const getHouseholdStatusByCode = useCallback((code: string) => {
    return householdStatuses.find(status => status.code === code)
  }, [householdStatuses])

  /**
   * Utility function to find relationship type by code
   */
  const getRelationshipTypeByCode = useCallback((code: string) => {
    return relationshipTypes.find(type => type.code === code)
  }, [relationshipTypes])

  /**
   * Utility function to find user role by code
   */
  const getUserRoleByCode = useCallback((code: string) => {
    return userRoles.find(role => role.code === code)
  }, [userRoles])

  /**
   * Refresh all lookup data
   */
  const refresh = useCallback(async () => {
    // Clear cache and reload
    LookupService.invalidateAll()
    await loadCommonLookups()
  }, [loadCommonLookups])

  /**
   * Load common lookup data on mount if preloadCommon is true
   */
  useEffect(() => {
    if (preloadCommon) {
      loadCommonLookups()
    }
  }, [preloadCommon, loadCommonLookups])

  /**
   * Context value
   */
  const contextValue: LookupContextData = {
    householdStatuses,
    relationshipTypes,
    userRoles,
    loading,
    error,
    getHouseholdStatusById,
    getRelationshipTypeById,
    getUserRoleById,
    getHouseholdStatusByCode,
    getRelationshipTypeByCode,
    getUserRoleByCode,
    refresh,
    fetchValuesByCategoryCode,
  }

  return (
    <LookupContext.Provider value={contextValue}>
      {children}
    </LookupContext.Provider>
  )
}

/**
 * Higher-order component for wrapping components that need lookup data
 */
export function withLookup<P extends object>(Component: React.ComponentType<P>) {
  return function WrappedComponent(props: P) {
    return (
      <LookupProvider>
        <Component {...props} />
      </LookupProvider>
    )
  }
}

/**
 * Hook for loading additional lookup categories on demand
 */
export function useLookupCategory(categoryCode: string) {
  const { fetchValuesByCategoryCode } = useLookup()
  const [values, setValues] = useState<LookupValue[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadValues = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchValuesByCategoryCode(categoryCode)
      setValues(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error(`Error loading values for category ${categoryCode}:`, err)
    } finally {
      setLoading(false)
    }
  }, [categoryCode, fetchValuesByCategoryCode])

  useEffect(() => {
    if (categoryCode) {
      loadValues()
    }
  }, [categoryCode, loadValues])

  return {
    values,
    loading,
    error,
    reload: loadValues,
  }
}

export default LookupContext
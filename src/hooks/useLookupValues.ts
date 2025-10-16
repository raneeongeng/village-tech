'use client'

import { useLookup, useLookupCategory } from '@/contexts/LookupContext'
import { LOOKUP_CATEGORIES } from '@/lib/api/services/lookup'
import { useCallback } from 'react'

interface UseLookupValuesReturn {
  villageStatuses: import('@/types/village').LookupValue[]
  userRoles: import('@/types/village').LookupValue[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  getAdminHeadRoleId: () => string | null
}

export function useLookupValues(): UseLookupValuesReturn {
  // Use the global lookup context for common data
  const { userRoles, loading: commonLoading, error: commonError, refresh } = useLookup()

  // Load village statuses separately as they're not in common lookups
  const {
    values: villageStatuses,
    loading: villageStatusesLoading,
    error: villageStatusesError,
    reload: reloadVillageStatuses
  } = useLookupCategory(LOOKUP_CATEGORIES.VILLAGE_TENANT_STATUSES)

  // Combine loading states
  const loading = commonLoading || villageStatusesLoading

  // Combine errors
  const error = commonError ? new Error(commonError) :
                villageStatusesError ? new Error(villageStatusesError) : null

  const getAdminHeadRoleId = useCallback(() => {
    const adminHeadRole = userRoles.find(role => role.code === 'admin_head')
    return adminHeadRole?.id || null
  }, [userRoles])

  const refetch = useCallback(async () => {
    await Promise.all([
      refresh(),
      reloadVillageStatuses()
    ])
  }, [refresh, reloadVillageStatuses])

  return {
    villageStatuses,
    userRoles,
    loading,
    error,
    refetch,
    getAdminHeadRoleId,
  }
}
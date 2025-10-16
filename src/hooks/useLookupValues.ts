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

  const getAdminHeadRoleId = useCallback(async () => {
    console.log('[useLookupValues] getAdminHeadRoleId called', { userRoles })
    if (!userRoles || userRoles.length === 0) {
      console.log('[useLookupValues] No userRoles available in cache, fetching from database')

      // Fetch directly from database when cache is empty
      try {
        // First get the category ID for user_roles
        const supabase = (await import('@/lib/supabase/client')).supabase

        const { data: category, error: categoryError } = await supabase
          .from('lookup_categories')
          .select('id')
          .eq('code', 'user_roles')
          .eq('is_active', true)
          .single()

        if (categoryError || !category) {
          console.error('[useLookupValues] Error fetching user_roles category:', categoryError)
          return null
        }

        // Now get the admin_head role using the category ID
        const { data, error } = await supabase
          .from('lookup_values')
          .select('id, code, name')
          .eq('category_id', category.id)
          .eq('code', 'admin_head')
          .eq('is_active', true)
          .single()

        if (error) {
          console.error('[useLookupValues] Error fetching admin_head role from database:', error)
          return null
        }

        console.log('[useLookupValues] Found admin_head role from database:', data)
        return data?.id || null
      } catch (error) {
        console.error('[useLookupValues] Exception fetching admin_head role:', error)
        return null
      }
    }

    console.log('[useLookupValues] Available user roles:', userRoles.map(role => ({ id: role.id, code: role.code, name: role.name })))
    console.log('[useLookupValues] Looking for role with code: admin_head')
    const adminHeadRole = userRoles.find(role => {
      console.log(`[useLookupValues] Checking role: ${role.code} === 'admin_head'?`, role.code === 'admin_head')
      return role.code === 'admin_head'
    })
    console.log('[useLookupValues] Found admin_head role:', adminHeadRole)
    console.log('[useLookupValues] Admin head role ID:', adminHeadRole?.id)
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
'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { LookupValue } from '@/types/village'

interface UseLookupValuesReturn {
  villageStatuses: LookupValue[]
  userRoles: LookupValue[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  getAdminHeadRoleId: () => string | null
}

export function useLookupValues(): UseLookupValuesReturn {
  const [villageStatuses, setVillageStatuses] = useState<LookupValue[]>([])
  const [userRoles, setUserRoles] = useState<LookupValue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchLookupValues = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Get village_tenant_statuses category
      const { data: statusCategoryData, error: statusCategoryError } = await supabase
        .from('lookup_categories')
        .select('id')
        .eq('code', 'village_tenant_statuses')
        .single()

      if (statusCategoryError) {
        console.error('Error fetching status category:', statusCategoryError)
        throw new Error('Failed to fetch village status category')
      }

      // Get user_roles category
      const { data: roleCategoryData, error: roleCategoryError } = await supabase
        .from('lookup_categories')
        .select('id')
        .eq('code', 'user_roles')
        .single()

      if (roleCategoryError) {
        console.error('Error fetching role category:', roleCategoryError)
        throw new Error('Failed to fetch user role category')
      }

      // Fetch village statuses
      const { data: statusData, error: statusError } = await supabase
        .from('lookup_values')
        .select('*')
        .eq('category_id', statusCategoryData.id)
        .eq('is_active', true)
        .order('sort_order')

      if (statusError) {
        console.error('Error fetching village statuses:', statusError)
        throw new Error('Failed to fetch village statuses')
      }

      // Fetch user roles
      const { data: roleData, error: roleError } = await supabase
        .from('lookup_values')
        .select('*')
        .eq('category_id', roleCategoryData.id)
        .eq('is_active', true)
        .order('sort_order')

      if (roleError) {
        console.error('Error fetching user roles:', roleError)
        throw new Error('Failed to fetch user roles')
      }

      setVillageStatuses(statusData || [])
      setUserRoles(roleData || [])
      setLoading(false)
    } catch (err) {
      console.error('Error in fetchLookupValues:', err)
      setError(err as Error)
      setLoading(false)
    }
  }, [])

  const getAdminHeadRoleId = useCallback(() => {
    const adminHeadRole = userRoles.find(role => role.code === 'admin_head')
    return adminHeadRole?.id || null
  }, [userRoles])

  const refetch = useCallback(async () => {
    await fetchLookupValues()
  }, [fetchLookupValues])

  useEffect(() => {
    fetchLookupValues()
  }, [fetchLookupValues])

  return {
    villageStatuses,
    userRoles,
    loading,
    error,
    refetch,
    getAdminHeadRoleId,
  }
}
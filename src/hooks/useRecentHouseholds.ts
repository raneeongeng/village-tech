'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Household, RecentHouseholdsData, DashboardError } from '@/types/dashboard'

interface UseRecentHouseholdsReturn extends RecentHouseholdsData {
  refetch: () => Promise<void>
}

export function useRecentHouseholds(limit: number = 5): UseRecentHouseholdsReturn {
  const [data, setData] = useState<Household[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const createError = (message: string, type: DashboardError['type'] = 'query'): DashboardError => {
    const error = new Error(message) as DashboardError
    error.type = type
    return error
  }

  const fetchRecentHouseholds = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: households, error: householdsError } = await supabase
        .from('households')
        .select(`
          id,
          address,
          status_id,
          created_at,
          tenant_id,
          household_head_id,
          villages!tenant_id (
            name
          ),
          household_head:users!household_head_id (
            first_name,
            last_name
          ),
          status:lookup_values!status_id (
            code,
            name,
            color_code
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (householdsError) {
        console.error('Error fetching recent households:', householdsError)
        throw createError('Failed to fetch recent households')
      }

      // Format the data to match our interface
      const formattedHouseholds: Household[] = (households || []).map(household => ({
        id: household.id,
        tenant_id: household.tenant_id,
        household_head_id: household.household_head_id,
        address: household.address,
        status_id: household.status_id,
        created_at: household.created_at,
        updated_at: '', // Will be populated if needed
        // Joined data
        village: household.villages ? {
          id: household.tenant_id,
          name: household.villages.name,
          status_id: '',
          settings: {},
          created_at: '',
          updated_at: ''
        } : undefined,
        household_head: household.household_head ? {
          id: household.household_head_id,
          tenant_id: household.tenant_id,
          email: '',
          role_id: '',
          first_name: household.household_head.first_name,
          last_name: household.household_head.last_name,
          is_active: true,
          created_at: '',
          updated_at: ''
        } : undefined,
        status: household.status ? {
          id: household.status_id,
          category_id: '',
          code: household.status.code,
          name: household.status.name,
          color_code: household.status.color_code || '#6c757d',
          is_active: true,
          sort_order: 0,
          created_at: '',
          updated_at: ''
        } : undefined,
      }))

      setData(formattedHouseholds)
      setLoading(false)
    } catch (error) {
      console.error('Error in fetchRecentHouseholds:', error)
      setData(null)
      setLoading(false)
      setError(error as DashboardError)
    }
  }, [limit])

  const refetch = useCallback(async () => {
    await fetchRecentHouseholds()
  }, [fetchRecentHouseholds])

  useEffect(() => {
    fetchRecentHouseholds()
  }, [fetchRecentHouseholds])

  return {
    data,
    loading,
    error,
    refetch,
  }
}
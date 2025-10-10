'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Village, RecentVillagesData, DashboardError } from '@/types/dashboard'

interface UseRecentVillagesReturn extends RecentVillagesData {
  refetch: () => Promise<void>
}

export function useRecentVillages(limit: number = 5): UseRecentVillagesReturn {
  const [data, setData] = useState<Village[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const createError = (message: string, type: DashboardError['type'] = 'query'): DashboardError => {
    const error = new Error(message) as DashboardError
    error.type = type
    return error
  }

  const fetchRecentVillages = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // First, fetch villages without the join
      const { data: villages, error: villagesError } = await supabase
        .from('villages')
        .select(`
          id,
          name,
          created_at,
          status_id,
          settings
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (villagesError) {
        console.error('Error fetching recent villages:', villagesError)
        throw createError('Failed to fetch recent villages')
      }

      // If we have villages, fetch their status information separately
      let statusLookup: { [key: string]: any } = {}

      if (villages && villages.length > 0) {
        const statusIds = [...new Set(villages.map(v => v.status_id))]
        const { data: statuses, error: statusError } = await supabase
          .from('lookup_values')
          .select('id, code, name, color_code')
          .in('id', statusIds)

        if (!statusError && statuses) {
          statusLookup = statuses.reduce((acc, status) => {
            acc[status.id] = status
            return acc
          }, {})
        }
      }

      // Format the data to match our interface
      const formattedVillages: Village[] = (villages || []).map(village => ({
        id: village.id,
        name: village.name,
        status_id: village.status_id,
        settings: village.settings,
        created_at: village.created_at,
        updated_at: '', // Will be populated if needed
        // Add status data from lookup
        status: statusLookup[village.status_id] ? {
          id: village.status_id,
          category_id: '',
          code: statusLookup[village.status_id].code,
          name: statusLookup[village.status_id].name,
          color_code: statusLookup[village.status_id].color_code || '#6c757d',
          is_active: true,
          sort_order: 0,
          created_at: '',
          updated_at: ''
        } : undefined,
      }))

      setData(formattedVillages)
      setLoading(false)
    } catch (error) {
      console.error('Error in fetchRecentVillages:', error)
      setData(null)
      setLoading(false)
      setError(error as DashboardError)
    }
  }, [limit])

  const refetch = useCallback(async () => {
    await fetchRecentVillages()
  }, [fetchRecentVillages])

  useEffect(() => {
    fetchRecentVillages()
  }, [fetchRecentVillages])

  return {
    data,
    loading,
    error,
    refetch,
  }
}
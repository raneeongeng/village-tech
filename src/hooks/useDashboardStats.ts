'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useLookup } from '@/contexts/LookupContext'
import { DashboardStats, DataState, DashboardError } from '@/types/dashboard'

// Request deduplication for same-render duplicate calls (React Strict Mode)
const pendingVillageStatsRequests = new Map<string, Promise<any>>()

interface UseDashboardStatsReturn {
  totalVillages: DataState<number>
  activeVillages: DataState<number>
  inactiveVillages: DataState<number>
  refetchAll: () => Promise<void>
}

export function useDashboardStats(): UseDashboardStatsReturn {
  const [totalVillages, setTotalVillages] = useState<DataState<number>>({
    data: null,
    loading: true,
    error: null,
  })

  const [activeVillages, setActiveVillages] = useState<DataState<number>>({
    data: null,
    loading: true,
    error: null,
  })

  const [inactiveVillages, setInactiveVillages] = useState<DataState<number>>({
    data: null,
    loading: true,
    error: null,
  })

  // Use cached lookup data instead of making API calls
  const { fetchValuesByCategoryCode } = useLookup()

  const createError = (message: string, type: DashboardError['type'] = 'query'): DashboardError => {
    const error = new Error(message) as DashboardError
    error.type = type
    return error
  }

  const fetchTotalVillages = useCallback(async () => {
    const requestKey = 'total_villages'

    console.log(`[useDashboardStats] fetchTotalVillages called with key: ${requestKey}`)

    // Check if request is already pending
    if (pendingVillageStatsRequests.has(requestKey)) {
      console.log(`[useDashboardStats] Request already pending for key: ${requestKey}, waiting for existing request`)
      try {
        const result = await pendingVillageStatsRequests.get(requestKey)
        console.log(`[useDashboardStats] Using cached result for key: ${requestKey}`)
        return result
      } catch (error) {
        console.log(`[useDashboardStats] Cached request failed for key: ${requestKey}, proceeding with new request`)
        pendingVillageStatsRequests.delete(requestKey)
      }
    }

    console.log(`[useDashboardStats] Starting new request for key: ${requestKey}`)
    setTotalVillages(prev => ({ ...prev, loading: true, error: null }))

    // Create the actual async function that will be cached
    const requestPromise = (async () => {
      try {
        console.log(`[useDashboardStats] Making API call for total villages`)
        const { count, error } = await supabase
          .from('villages')
          .select('*', { count: 'exact', head: true })

        if (error) {
          console.error('Error fetching total villages:', error)
          throw createError('Failed to fetch total villages count')
        }

        console.log(`[useDashboardStats] API call completed for total villages: ${count}`)
        return count || 0
      } finally {
        pendingVillageStatsRequests.delete(requestKey)
        console.log(`[useDashboardStats] Cleaned up pending request for key: ${requestKey}`)
      }
    })()

    // Store pending request for deduplication
    pendingVillageStatsRequests.set(requestKey, requestPromise)

    try {
      const count = await requestPromise
      setTotalVillages({
        data: count,
        loading: false,
        error: null,
      })
    } catch (error) {
      console.error('Error in fetchTotalVillages:', error)
      setTotalVillages({
        data: null,
        loading: false,
        error: error as DashboardError,
      })
    }
  }, [])

  const fetchActiveVillages = useCallback(async () => {
    const requestKey = 'active_villages'

    console.log(`[useDashboardStats] fetchActiveVillages called with key: ${requestKey}`)

    // Check if request is already pending
    if (pendingVillageStatsRequests.has(requestKey)) {
      console.log(`[useDashboardStats] Request already pending for key: ${requestKey}, waiting for existing request`)
      try {
        const result = await pendingVillageStatsRequests.get(requestKey)
        console.log(`[useDashboardStats] Using cached result for key: ${requestKey}`)
        return result
      } catch (error) {
        console.log(`[useDashboardStats] Cached request failed for key: ${requestKey}, proceeding with new request`)
        pendingVillageStatsRequests.delete(requestKey)
      }
    }

    console.log(`[useDashboardStats] Starting new request for key: ${requestKey}`)
    setActiveVillages(prev => ({ ...prev, loading: true, error: null }))

    // Create the actual async function that will be cached
    const requestPromise = (async () => {
      try {
        // Get active status ID from cached lookup data instead of API calls
        console.log(`[useDashboardStats] Fetching village tenant statuses from cache`)
        const villageTenantStatuses = await fetchValuesByCategoryCode('village_tenant_statuses')
        const activeStatus = villageTenantStatuses?.find((status: any) => status.code === 'active')
        if (!activeStatus) {
          throw createError('Active status not found in cached lookup data')
        }

        console.log(`[useDashboardStats] Using cached active status ID: ${activeStatus.id}`)
        console.log(`[useDashboardStats] Making API call for active villages`)

        // Count villages with active status
        const { count, error } = await supabase
          .from('villages')
          .select('*', { count: 'exact', head: true })
          .eq('status_id', activeStatus.id)

        if (error) {
          console.error('Error fetching active villages:', error)
          throw createError('Failed to fetch active villages count')
        }

        console.log(`[useDashboardStats] API call completed for active villages: ${count}`)
        return count || 0
      } finally {
        pendingVillageStatsRequests.delete(requestKey)
        console.log(`[useDashboardStats] Cleaned up pending request for key: ${requestKey}`)
      }
    })()

    // Store pending request for deduplication
    pendingVillageStatsRequests.set(requestKey, requestPromise)

    try {
      const count = await requestPromise
      setActiveVillages({
        data: count,
        loading: false,
        error: null,
      })
    } catch (error) {
      console.error('Error in fetchActiveVillages:', error)
      setActiveVillages({
        data: null,
        loading: false,
        error: error as DashboardError,
      })
    }
  }, [fetchValuesByCategoryCode])

  const fetchInactiveVillages = useCallback(async () => {
    const requestKey = 'inactive_villages'

    console.log(`[useDashboardStats] fetchInactiveVillages called with key: ${requestKey}`)

    // Check if request is already pending
    if (pendingVillageStatsRequests.has(requestKey)) {
      console.log(`[useDashboardStats] Request already pending for key: ${requestKey}, waiting for existing request`)
      try {
        const result = await pendingVillageStatsRequests.get(requestKey)
        console.log(`[useDashboardStats] Using cached result for key: ${requestKey}`)
        return result
      } catch (error) {
        console.log(`[useDashboardStats] Cached request failed for key: ${requestKey}, proceeding with new request`)
        pendingVillageStatsRequests.delete(requestKey)
      }
    }

    console.log(`[useDashboardStats] Starting new request for key: ${requestKey}`)
    setInactiveVillages(prev => ({ ...prev, loading: true, error: null }))

    // Create the actual async function that will be cached
    const requestPromise = (async () => {
      try {
        // Get inactive status ID from cached lookup data instead of API calls
        console.log(`[useDashboardStats] Fetching village tenant statuses from cache`)
        const villageTenantStatuses = await fetchValuesByCategoryCode('village_tenant_statuses')
        const inactiveStatus = villageTenantStatuses?.find((status: any) => status.code === 'inactive')
        if (!inactiveStatus) {
          throw createError('Inactive status not found in cached lookup data')
        }

        console.log(`[useDashboardStats] Using cached inactive status ID: ${inactiveStatus.id}`)
        console.log(`[useDashboardStats] Making API call for inactive villages`)

        // Count villages with inactive status
        const { count, error } = await supabase
          .from('villages')
          .select('*', { count: 'exact', head: true })
          .eq('status_id', inactiveStatus.id)

        if (error) {
          console.error('Error fetching inactive villages:', error)
          throw createError('Failed to fetch inactive villages count')
        }

        console.log(`[useDashboardStats] API call completed for inactive villages: ${count}`)
        return count || 0
      } finally {
        pendingVillageStatsRequests.delete(requestKey)
        console.log(`[useDashboardStats] Cleaned up pending request for key: ${requestKey}`)
      }
    })()

    // Store pending request for deduplication
    pendingVillageStatsRequests.set(requestKey, requestPromise)

    try {
      const count = await requestPromise
      setInactiveVillages({
        data: count,
        loading: false,
        error: null,
      })
    } catch (error) {
      console.error('Error in fetchInactiveVillages:', error)
      setInactiveVillages({
        data: null,
        loading: false,
        error: error as DashboardError,
      })
    }
  }, [fetchValuesByCategoryCode])

  const refetchAll = useCallback(async () => {
    await Promise.all([
      fetchTotalVillages(),
      fetchActiveVillages(),
      fetchInactiveVillages(),
    ])
  }, [fetchTotalVillages, fetchActiveVillages, fetchInactiveVillages])

  useEffect(() => {
    refetchAll()
  }, [refetchAll])

  return {
    totalVillages,
    activeVillages,
    inactiveVillages,
    refetchAll,
  }
}
'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { DashboardStats, DataState, DashboardError } from '@/types/dashboard'

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

  const createError = (message: string, type: DashboardError['type'] = 'query'): DashboardError => {
    const error = new Error(message) as DashboardError
    error.type = type
    return error
  }

  const fetchTotalVillages = useCallback(async () => {
    setTotalVillages(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { count, error } = await supabase
        .from('villages')
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error('Error fetching total villages:', error)
        throw createError('Failed to fetch total villages count')
      }

      setTotalVillages({
        data: count || 0,
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
    setActiveVillages(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Get village_tenant_statuses category ID
      const { data: categoryData, error: categoryError } = await supabase
        .from('lookup_categories')
        .select('id')
        .eq('code', 'village_tenant_statuses')
        .single()

      if (categoryError) {
        console.error('Error fetching village_tenant_statuses category:', categoryError)
        throw createError('Failed to fetch status category configuration')
      }

      // Get 'active' status lookup value ID
      const { data: statusData, error: statusError } = await supabase
        .from('lookup_values')
        .select('id')
        .eq('code', 'active')
        .eq('category_id', categoryData.id)
        .single()

      if (statusError) {
        console.error('Error fetching active status lookup:', statusError)
        throw createError('Failed to fetch active status configuration')
      }

      // Count villages with active status
      const { count, error } = await supabase
        .from('villages')
        .select('*', { count: 'exact', head: true })
        .eq('status_id', statusData.id)

      if (error) {
        console.error('Error fetching active villages:', error)
        throw createError('Failed to fetch active villages count')
      }

      setActiveVillages({
        data: count || 0,
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
  }, [])

  const fetchInactiveVillages = useCallback(async () => {
    setInactiveVillages(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Get village_tenant_statuses category ID
      const { data: categoryData, error: categoryError } = await supabase
        .from('lookup_categories')
        .select('id')
        .eq('code', 'village_tenant_statuses')
        .single()

      if (categoryError) {
        console.error('Error fetching village_tenant_statuses category:', categoryError)
        throw createError('Failed to fetch status category configuration')
      }

      // Get 'inactive' status lookup value ID
      const { data: statusData, error: statusError } = await supabase
        .from('lookup_values')
        .select('id')
        .eq('code', 'inactive')
        .eq('category_id', categoryData.id)
        .single()

      if (statusError) {
        console.error('Error fetching inactive status lookup:', statusError)
        throw createError('Failed to fetch inactive status configuration')
      }

      // Count villages with inactive status
      const { count, error } = await supabase
        .from('villages')
        .select('*', { count: 'exact', head: true })
        .eq('status_id', statusData.id)

      if (error) {
        console.error('Error fetching inactive villages:', error)
        throw createError('Failed to fetch inactive villages count')
      }

      setInactiveVillages({
        data: count || 0,
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
  }, [])

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
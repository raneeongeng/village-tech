'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import {
  Household,
  HouseholdFilters,
  TableOptions,
  UseHouseholdsOptions,
  UseHouseholdsResult,
  HOUSEHOLDS_QUERY,
  PENDING_HOUSEHOLDS_QUERY,
} from '@/types/household'

const DEFAULT_FILTERS: HouseholdFilters = {
  search: '',
  statusId: '',
  region: '',
  dateFrom: '',
  dateTo: '',
}

const DEFAULT_PAGINATION: TableOptions = {
  page: 1,
  itemsPerPage: 10,
  sortBy: 'created_at',
  sortDirection: 'desc',
}

/**
 * Hook for fetching and managing household data with server-side pagination and filtering
 */
export function useHouseholds(options: UseHouseholdsOptions = {}): UseHouseholdsResult {
  const { user } = useAuth()
  const tenantId = (user as any)?.tenant?.id
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize filters from URL params or defaults
  const initialFilters = useMemo(() => ({
    search: searchParams.get('search') || options.filters?.search || DEFAULT_FILTERS.search,
    statusId: searchParams.get('statusId') || options.filters?.statusId || DEFAULT_FILTERS.statusId,
    region: searchParams.get('region') || options.filters?.region || DEFAULT_FILTERS.region,
    dateFrom: searchParams.get('dateFrom') || options.filters?.dateFrom || DEFAULT_FILTERS.dateFrom,
    dateTo: searchParams.get('dateTo') || options.filters?.dateTo || DEFAULT_FILTERS.dateTo,
  }), [searchParams, options.filters])

  // Initialize pagination from URL params or defaults
  const initialPagination = useMemo(() => ({
    page: parseInt(searchParams.get('page') || '1', 10) || options.pagination?.page || DEFAULT_PAGINATION.page,
    itemsPerPage: options.pagination?.itemsPerPage || DEFAULT_PAGINATION.itemsPerPage,
    sortBy: options.pagination?.sortBy || DEFAULT_PAGINATION.sortBy,
    sortDirection: (options.pagination?.sortDirection as 'asc' | 'desc') || DEFAULT_PAGINATION.sortDirection,
  }), [searchParams, options.pagination])

  // State
  const [data, setData] = useState<Household[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFiltersState] = useState<HouseholdFilters>(initialFilters)
  const [pagination, setPaginationState] = useState({
    currentPage: initialPagination.page,
    totalPages: 1,
    totalCount: 0,
    itemsPerPage: initialPagination.itemsPerPage,
  })

  // Update URL when filters or pagination change
  const updateURL = useCallback((newFilters: HouseholdFilters, newPage: number) => {
    const params = new URLSearchParams(searchParams)

    // Update filters in URL
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    // Update page in URL
    if (newPage > 1) {
      params.set('page', newPage.toString())
    } else {
      params.delete('page')
    }

    router.push(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  // Determine status filter based on options
  const statusFilter = useMemo(() => {
    switch (options.statusFilter) {
      case 'active':
        return 'active'
      case 'inactive':
        return 'inactive'
      case 'pending':
        return 'pending_approval'
      case 'all':
      default:
        return null
    }
  }, [options.statusFilter])

  // Fetch households data
  const fetchHouseholds = useCallback(async () => {
    if (!tenantId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Use the search_households database function for server-side pagination
      const { data: searchResult, error: searchError } = await supabase
        .rpc('search_households', {
          tenant_uuid: tenantId,
          search_term: filters.search || '',
          status_filter: filters.statusId ? null : statusFilter, // Use statusId if provided, otherwise use statusFilter
          page_number: pagination.currentPage,
          page_size: pagination.itemsPerPage,
        })

      if (searchError) {
        console.error('Search households error:', searchError)
        throw new Error('Failed to search households')
      }

      if (searchResult?.error) {
        throw new Error(searchResult.error)
      }

      // Extract data and pagination info from function result
      const households = searchResult?.data || []
      const paginationInfo = searchResult?.pagination || {
        current_page: 1,
        total_pages: 1,
        total_count: 0,
        page_size: pagination.itemsPerPage,
      }

      // Transform data to match expected format
      const transformedHouseholds: Household[] = households.map((item: any) => ({
        id: item.id,
        tenant_id: tenantId,
        household_head_id: item.household_head.id,
        household_head: {
          id: item.household_head.id,
          email: item.household_head.email,
          first_name: item.household_head.first_name,
          middle_name: item.household_head.middle_name,
          last_name: item.household_head.last_name,
          is_active: true,
        },
        address: item.address,
        status_id: item.status.id,
        status: {
          id: item.status.id,
          code: item.status.code as 'pending_approval' | 'active' | 'inactive',
          name: item.status.name,
          color_code: item.status.color_code,
        },
        created_at: item.created_at,
        updated_at: item.created_at, // Search function doesn't return updated_at
        member_count: 0, // Will be populated by count if needed
      }))

      setData(transformedHouseholds)
      setPaginationState({
        currentPage: paginationInfo.current_page,
        totalPages: paginationInfo.total_pages,
        totalCount: paginationInfo.total_count,
        itemsPerPage: paginationInfo.page_size,
      })

    } catch (err) {
      console.error('Error fetching households:', err)
      setError(err as Error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [tenantId, filters, pagination.currentPage, pagination.itemsPerPage, statusFilter])

  // Set filters with URL update
  const setFilters = useCallback((newFilters: Partial<HouseholdFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFiltersState(updatedFilters)
    updateURL(updatedFilters, 1) // Reset to page 1 when filters change
  }, [filters, updateURL])

  // Set page with URL update
  const setPage = useCallback((page: number) => {
    setPaginationState(prev => ({ ...prev, currentPage: page }))
    updateURL(filters, page)
  }, [filters, updateURL])

  // Refetch data
  const refetch = useCallback(async () => {
    await fetchHouseholds()
  }, [fetchHouseholds])

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchHouseholds()
  }, [fetchHouseholds])

  return {
    data,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    setPage,
    refetch,
  }
}

/**
 * Optimized hook for pending households (used by Pending Households page)
 * This version is specifically optimized to avoid unnecessary lookup API calls
 * and only fetches the pending household data that's actually needed.
 */
export function usePendingHouseholds() {
  const { user } = useAuth()
  const tenantId = (user as any)?.tenant?.id
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize filters from URL params
  const initialFilters = useMemo(() => ({
    search: searchParams.get('search') || DEFAULT_FILTERS.search,
    statusId: DEFAULT_FILTERS.statusId,
    region: DEFAULT_FILTERS.region,
    dateFrom: DEFAULT_FILTERS.dateFrom,
    dateTo: DEFAULT_FILTERS.dateTo,
  }), [searchParams])

  // Initialize pagination from URL params
  const initialPagination = useMemo(() => ({
    page: parseInt(searchParams.get('page') || '1', 10) || DEFAULT_PAGINATION.page,
    itemsPerPage: DEFAULT_PAGINATION.itemsPerPage,
    sortBy: DEFAULT_PAGINATION.sortBy,
    sortDirection: DEFAULT_PAGINATION.sortDirection as 'asc' | 'desc',
  }), [searchParams])

  // State
  const [data, setData] = useState<Household[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFiltersState] = useState<HouseholdFilters>(initialFilters)
  const [pagination, setPaginationState] = useState({
    currentPage: initialPagination.page,
    totalPages: 1,
    totalCount: 0,
    itemsPerPage: initialPagination.itemsPerPage,
  })

  // Update URL when filters or pagination change
  const updateURL = useCallback((newFilters: HouseholdFilters, newPage: number) => {
    const params = new URLSearchParams(searchParams)

    // Update filters in URL
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    // Update page in URL
    if (newPage > 1) {
      params.set('page', newPage.toString())
    } else {
      params.delete('page')
    }

    router.push(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  // Optimized fetch function that only gets pending households
  const fetchPendingHouseholds = useCallback(async () => {
    if (!tenantId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Use the search_households database function specifically for pending status
      const { data: searchResult, error: searchError } = await supabase
        .rpc('search_households', {
          tenant_uuid: tenantId,
          search_term: filters.search || '',
          status_filter: 'pending_approval', // Hard-coded to only get pending
          page_number: pagination.currentPage,
          page_size: pagination.itemsPerPage,
        })

      if (searchError) {
        console.error('Search pending households error:', searchError)
        throw new Error('Failed to search pending households')
      }

      if (searchResult?.error) {
        throw new Error(searchResult.error)
      }

      // Extract data and pagination info from function result
      const households = searchResult?.data || []
      const paginationInfo = searchResult?.pagination || {
        current_page: 1,
        total_pages: 1,
        total_count: 0,
        page_size: pagination.itemsPerPage,
      }

      // Transform data to match expected format
      const transformedHouseholds: Household[] = households.map((item: any) => ({
        id: item.id,
        tenant_id: tenantId,
        household_head_id: item.household_head.id,
        household_head: {
          id: item.household_head.id,
          email: item.household_head.email,
          first_name: item.household_head.first_name,
          middle_name: item.household_head.middle_name,
          last_name: item.household_head.last_name,
          is_active: true,
        },
        address: item.address,
        status_id: item.status.id,
        status: {
          id: item.status.id,
          code: item.status.code as 'pending_approval',
          name: item.status.name,
          color_code: item.status.color_code,
        },
        created_at: item.created_at,
        updated_at: item.created_at,
        member_count: 0,
      }))

      setData(transformedHouseholds)
      setPaginationState({
        currentPage: paginationInfo.current_page,
        totalPages: paginationInfo.total_pages,
        totalCount: paginationInfo.total_count,
        itemsPerPage: paginationInfo.page_size,
      })

    } catch (err) {
      console.error('Error fetching pending households:', err)
      setError(err as Error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [tenantId, filters, pagination.currentPage, pagination.itemsPerPage])

  // Set filters with URL update
  const setFilters = useCallback((newFilters: Partial<HouseholdFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFiltersState(updatedFilters)
    updateURL(updatedFilters, 1) // Reset to page 1 when filters change
  }, [filters, updateURL])

  // Set page with URL update
  const setPage = useCallback((page: number) => {
    setPaginationState(prev => ({ ...prev, currentPage: page }))
    updateURL(filters, page)
  }, [filters, updateURL])

  // Refetch data
  const refetch = useCallback(async () => {
    await fetchPendingHouseholds()
  }, [fetchPendingHouseholds])

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchPendingHouseholds()
  }, [fetchPendingHouseholds])

  return {
    data,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    setPage,
    refetch,
  }
}

/**
 * Simplified hook for active households (used by Active Households page)
 */
export function useActiveHouseholds() {
  return useHouseholds({
    statusFilter: 'active',
  })
}

/**
 * Hook for fetching detailed household information
 */
export function useHouseholdDetails(householdId: string | null) {
  const { user } = useAuth()
  const tenantId = (user as any)?.tenant?.id
  const [household, setHousehold] = useState<Household | null>(null)
  const [loading, setLoading] = useState(!!householdId)
  const [error, setError] = useState<Error | null>(null)

  const fetchHouseholdDetails = useCallback(async () => {
    if (!householdId || !tenantId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('households')
        .select(HOUSEHOLDS_QUERY)
        .eq('id', householdId)
        .eq('tenant_id', tenantId)
        .single()

      if (fetchError) {
        throw new Error('Failed to fetch household details')
      }

      if (!data) {
        throw new Error('Household not found')
      }

      setHousehold(data as unknown as Household)
    } catch (err) {
      console.error('Error fetching household details:', err)
      setError(err as Error)
      setHousehold(null)
    } finally {
      setLoading(false)
    }
  }, [householdId, tenantId])

  const refetch = useCallback(async () => {
    await fetchHouseholdDetails()
  }, [fetchHouseholdDetails])

  useEffect(() => {
    fetchHouseholdDetails()
  }, [fetchHouseholdDetails])

  return {
    household,
    loading,
    error,
    refetch,
  }
}
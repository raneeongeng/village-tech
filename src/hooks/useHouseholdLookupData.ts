'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { LookupValue } from '@/types/village'
import { HouseholdStatus, RelationshipType, UseLookupDataResult } from '@/types/household'

/**
 * Hook for fetching household-specific lookup data
 * Provides household statuses and member relationship types
 */
export function useHouseholdLookupData(): UseLookupDataResult {
  const [householdStatuses, setHouseholdStatuses] = useState<HouseholdStatus[]>([])
  const [relationshipTypes, setRelationshipTypes] = useState<RelationshipType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchLookupData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Get household_statuses category
      const { data: statusCategoryData, error: statusCategoryError } = await supabase
        .from('lookup_categories')
        .select('id')
        .eq('code', 'household_statuses')
        .single()

      if (statusCategoryError) {
        console.error('Error fetching household status category:', statusCategoryError)
        throw new Error('Failed to fetch household status category')
      }

      // Get household_member_relationships category
      const { data: relationshipCategoryData, error: relationshipCategoryError } = await supabase
        .from('lookup_categories')
        .select('id')
        .eq('code', 'household_member_relationships')
        .single()

      if (relationshipCategoryError) {
        console.error('Error fetching relationship category:', relationshipCategoryError)
        throw new Error('Failed to fetch household member relationship category')
      }

      // Fetch household statuses
      const { data: statusData, error: statusError } = await supabase
        .from('lookup_values')
        .select('*')
        .eq('category_id', statusCategoryData.id)
        .eq('is_active', true)
        .order('sort_order')

      if (statusError) {
        console.error('Error fetching household statuses:', statusError)
        throw new Error('Failed to fetch household statuses')
      }

      // Fetch relationship types
      const { data: relationshipData, error: relationshipError } = await supabase
        .from('lookup_values')
        .select('*')
        .eq('category_id', relationshipCategoryData.id)
        .eq('is_active', true)
        .order('sort_order')

      if (relationshipError) {
        console.error('Error fetching relationship types:', relationshipError)
        throw new Error('Failed to fetch relationship types')
      }

      // Transform raw lookup values to typed interfaces
      const transformedStatuses: HouseholdStatus[] = (statusData || []).map((item: LookupValue) => ({
        id: item.id,
        code: item.code as 'pending_approval' | 'active' | 'inactive',
        name: item.name,
        color_code: item.color_code,
      }))

      const transformedRelationships: RelationshipType[] = (relationshipData || []).map((item: LookupValue) => ({
        id: item.id,
        code: item.code as 'head' | 'spouse' | 'child' | 'parent' | 'relative' | 'tenant',
        name: item.name,
        sort_order: item.sort_order,
      }))

      setHouseholdStatuses(transformedStatuses)
      setRelationshipTypes(transformedRelationships)
      setLoading(false)
    } catch (err) {
      console.error('Error in fetchLookupData:', err)
      setError(err as Error)
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(async () => {
    await fetchLookupData()
  }, [fetchLookupData])

  useEffect(() => {
    fetchLookupData()
  }, [fetchLookupData])

  return {
    householdStatuses,
    relationshipTypes,
    loading,
    error,
  }
}

/**
 * Utility functions for working with household lookup data
 */
export function useHouseholdLookupUtils(lookupData: UseLookupDataResult) {
  // Fetch household_head role ID (for user role, not member relationship)
  const [householdHeadRoleId, setHouseholdHeadRoleId] = useState<string | null>(null)

  useEffect(() => {
    const fetchHouseholdHeadRole = async () => {
      try {
        const { data, error } = await supabase
          .from('lookup_values')
          .select('id')
          .eq('code', 'household_head')
          .single()

        if (!error && data) {
          setHouseholdHeadRoleId(data.id)
        } else {
          console.error('Error fetching household_head role:', error)
        }
      } catch (err) {
        console.error('Failed to fetch household_head role ID:', err)
      }
    }

    fetchHouseholdHeadRole()
  }, [])

  const getPendingStatusId = useCallback(() => {
    const pendingStatus = lookupData.householdStatuses.find(status => status.code === 'pending_approval')
    return pendingStatus?.id || null
  }, [lookupData.householdStatuses])

  const getActiveStatusId = useCallback(() => {
    const activeStatus = lookupData.householdStatuses.find(status => status.code === 'active')
    return activeStatus?.id || null
  }, [lookupData.householdStatuses])

  const getInactiveStatusId = useCallback(() => {
    const inactiveStatus = lookupData.householdStatuses.find(status => status.code === 'inactive')
    return inactiveStatus?.id || null
  }, [lookupData.householdStatuses])

  const getHeadRelationshipId = useCallback(() => {
    const headRelationship = lookupData.relationshipTypes.find(rel => rel.code === 'head')
    return headRelationship?.id || null
  }, [lookupData.relationshipTypes])

  const getStatusByCode = useCallback((code: string) => {
    return lookupData.householdStatuses.find(status => status.code === code) || null
  }, [lookupData.householdStatuses])

  const getRelationshipByCode = useCallback((code: string) => {
    return lookupData.relationshipTypes.find(rel => rel.code === code) || null
  }, [lookupData.relationshipTypes])

  const getHouseholdHeadRoleId = useCallback(() => {
    return householdHeadRoleId
  }, [householdHeadRoleId])

  return {
    getPendingStatusId,
    getActiveStatusId,
    getInactiveStatusId,
    getHeadRelationshipId,
    getHouseholdHeadRoleId,
    getStatusByCode,
    getRelationshipByCode,
  }
}
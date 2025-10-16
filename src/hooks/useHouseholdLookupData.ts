'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useLookup } from '@/contexts/LookupContext'
import { HouseholdStatus, RelationshipType, UseLookupDataResult } from '@/types/household'

/**
 * Hook for fetching household-specific lookup data
 * Now uses optimized global lookup context instead of direct API calls
 */
export function useHouseholdLookupData(): UseLookupDataResult {
  // Use cached lookup data from global context
  const { householdStatuses: globalHouseholdStatuses, relationshipTypes: globalRelationshipTypes, loading, error } = useLookup()

  // Transform global lookup data to match the expected types
  const householdStatuses: HouseholdStatus[] = useMemo(() => {
    if (!globalHouseholdStatuses || globalHouseholdStatuses.length === 0) {
      return []
    }
    return globalHouseholdStatuses.map(item => ({
      id: item.id,
      code: item.code as 'pending_approval' | 'active' | 'inactive',
      name: item.name,
      color_code: item.color_code,
    }))
  }, [globalHouseholdStatuses])

  const relationshipTypes: RelationshipType[] = useMemo(() => {
    if (!globalRelationshipTypes || globalRelationshipTypes.length === 0) {
      return []
    }
    return globalRelationshipTypes.map(item => ({
      id: item.id,
      code: item.code as 'head' | 'spouse' | 'child' | 'parent' | 'relative' | 'tenant',
      name: item.name,
      sort_order: item.sort_order,
    }))
  }, [globalRelationshipTypes])

  return {
    householdStatuses,
    relationshipTypes,
    loading,
    error: error ? new Error(error) : null,
  }
}

/**
 * Utility functions for working with household lookup data
 * Now uses cached lookup data instead of making additional API calls
 */
export function useHouseholdLookupUtils(lookupData: UseLookupDataResult) {
  // Get household_head role ID from cached user roles (from global context)
  const { getUserRoleByCode } = useLookup()

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

  // Get household_head role ID from cached user roles instead of making API call
  const getHouseholdHeadRoleId = useCallback(() => {
    const householdHeadRole = getUserRoleByCode('household_head')
    return householdHeadRole?.id || null
  }, [getUserRoleByCode])

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
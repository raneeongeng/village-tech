'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useTenant } from '@/hooks/useTenant'
import { getCachedHouseholdInfo } from '@/lib/auth'
import { HouseholdMembersService } from '@/lib/api/services/household-members'
import { useLookup } from '@/contexts/LookupContext'
import type { HouseholdMember, RelationshipType, ApiResponse } from '@/types/household'

export interface UseHouseholdMembersResult {
  members: HouseholdMember[]
  loading: boolean
  error: Error | null
  relationshipTypes: RelationshipType[]
  addMember: (memberData: AddMemberData) => Promise<ApiResponse<HouseholdMember>>
  updateMember: (memberId: string, memberData: Partial<AddMemberData>) => Promise<ApiResponse<HouseholdMember>>
  removeMember: (memberId: string) => Promise<ApiResponse<void>>
  refetch: () => Promise<void>
}

export interface AddMemberData {
  firstName: string
  middleName?: string
  lastName: string
  suffix?: string
  relationshipId: string
  phone?: string
  email: string
  password: string
}

export function useHouseholdMembers() {
  const [members, setMembers] = useState<HouseholdMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const { user } = useAuth()
  const { tenant: currentTenant } = useTenant()

  // Get tenant from user if subdomain tenant is not available
  const tenantId = currentTenant?.id || user?.tenant?.id
  const tenantName = currentTenant?.name || user?.tenant?.name


  // Get the user's household ID (for household heads, this would be their household)
  const getUserHouseholdId = useCallback(async (): Promise<string | null> => {
    if (!user || !tenantId) return null

    try {
      // For household heads, check cached household info first
      if (user.role.code === 'household_head') {
        const cachedHousehold = getCachedHouseholdInfo()
        if (cachedHousehold) {
          return cachedHousehold.id
        }

        // If not cached, query the database
        const { data: household, error } = await supabase
          .from('households')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('household_head_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('Error finding household:', error)
          return null
        }

        return household?.id || null
      }

      // For other roles, they might be members of a household
      const { data: member, error } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('tenant_id', tenantId)
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error finding user as household member:', error)
        return null
      }

      return member?.household_id || null
    } catch (err) {
      console.error('Error getting household ID:', err)
      return null
    }
  }, [user, tenantId])

  // Fetch household members
  const fetchMembers = useCallback(async () => {
    if (!user || !tenantId) {
      setMembers([])
      setLoading(false)
      return
    }

    try {
      setError(null)

      const householdId = await getUserHouseholdId()

      if (!householdId) {
        setMembers([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('household_members')
        .select(`
          id,
          household_id,
          user_id,
          name,
          contact_info,
          photo_url,
          is_primary,
          created_at,
          relationship_id,
          relationship:lookup_values!household_members_relationship_id_fkey (
            id,
            code,
            name,
            sort_order
          )
        `)
        .eq('tenant_id', tenantId)
        .eq('household_id', householdId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true })

      if (error) {
        throw new Error(`Failed to fetch household members: ${error.message}`)
      }

      setMembers(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(new Error(errorMessage))
    } finally {
      setLoading(false)
    }
  }, [user, tenantId, getUserHouseholdId])

  // Get relationship types from global lookup context instead of individual API calls
  const { relationshipTypes } = useLookup()

  // Add new member
  const addMember = useCallback(async (memberData: AddMemberData): Promise<ApiResponse<HouseholdMember>> => {
    if (!user || !tenantId) {
      return { success: false, error: { message: 'Authentication required - user or tenant missing' } }
    }

    try {
      const householdId = await getUserHouseholdId()
      if (!householdId) {
        return {
          success: false,
          error: {
            message: user.role.code === 'household_head'
              ? 'No household found for your account. Please contact the administrator to set up your household first.'
              : 'You are not associated with any household. Please contact the administrator.'
          }
        }
      }


      // Use centralized API service to create member
      const result = await HouseholdMembersService.createMember({
        email: memberData.email,
        password: memberData.password,
        firstName: memberData.firstName,
        middleName: memberData.middleName,
        lastName: memberData.lastName,
        suffix: memberData.suffix,
        phone: memberData.phone,
        tenantId,
        householdId,
        relationshipId: memberData.relationshipId,
        createdBy: user.id
      })

      if (!result.success) {
        console.error('Error creating household member:', result.error)
        return { success: false, error: result.error || { message: 'Failed to create household member' } }
      }

      const data = result.data

      // Refresh the members list
      await fetchMembers()

      return { success: true, data }
    } catch (err) {
      console.error('Error in addMember:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      return { success: false, error: { message: errorMessage } }
    }
  }, [user, tenantId, tenantName, getUserHouseholdId, fetchMembers])

  // Update member
  const updateMember = useCallback(async (memberId: string, memberData: Partial<AddMemberData>): Promise<ApiResponse<HouseholdMember>> => {
    if (!user || !tenantId) {
      return { success: false, error: { message: 'Authentication required' } }
    }

    try {
      const updateData: any = {
        updated_by: user.id
      }

      if (memberData.firstName || memberData.middleName || memberData.lastName || memberData.suffix) {
        const fullName = [
          memberData.firstName,
          memberData.middleName,
          memberData.lastName,
          memberData.suffix
        ].filter(Boolean).join(' ')
        updateData.name = fullName
      }
      if (memberData.relationshipId) updateData.relationship_id = memberData.relationshipId
      if (memberData.phone !== undefined || memberData.email !== undefined) {
        const currentMember = members.find(m => m.id === memberId)
        updateData.contact_info = {
          phone: memberData.phone !== undefined ? memberData.phone : currentMember?.contact_info.phone || '',
          email: memberData.email !== undefined ? memberData.email : currentMember?.contact_info.email || ''
        }
      }

      const { data, error } = await supabase
        .from('household_members')
        .update(updateData)
        .eq('id', memberId)
        .eq('tenant_id', tenantId)
        .select(`
          id,
          household_id,
          user_id,
          name,
          contact_info,
          photo_url,
          is_primary,
          created_at,
          relationship_id,
          relationship:lookup_values!household_members_relationship_id_fkey (
            id,
            code,
            name,
            sort_order
          )
        `)
        .single()

      if (error) {
        return { success: false, error: { message: error.message } }
      }

      // Refresh the members list
      await fetchMembers()

      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      return { success: false, error: { message: errorMessage } }
    }
  }, [user, tenantId, members, fetchMembers])

  // Remove member
  const removeMember = useCallback(async (memberId: string): Promise<ApiResponse<void>> => {
    if (!user || !tenantId) {
      return { success: false, error: { message: 'Authentication required' } }
    }

    try {
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('id', memberId)
        .eq('tenant_id', tenantId)

      if (error) {
        return { success: false, error: { message: error.message } }
      }

      // Refresh the members list
      await fetchMembers()

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      return { success: false, error: { message: errorMessage } }
    }
  }, [user, tenantId, fetchMembers])

  // Initialize member data (requires user/tenant)
  useEffect(() => {
    if (user && tenantId) {
      setLoading(true)
      fetchMembers().finally(() => {
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [user, tenantId, fetchMembers])

  return {
    members,
    loading,
    error,
    relationshipTypes,
    addMember,
    updateMember,
    removeMember,
    refetch: fetchMembers
  }
}
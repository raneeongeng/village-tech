'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useTenant } from '@/hooks/useTenant'
import { getCachedHouseholdInfo } from '@/lib/auth'
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

      // Transform data to handle potential array relationships
      const transformedData = (data || []).map(member => ({
        ...member,
        relationship: Array.isArray(member.relationship)
          ? member.relationship[0]
          : member.relationship
      }))
      setMembers(transformedData)
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

      // Step 1: Store current session before creating new user
      const currentSession = await supabase.auth.getSession()

      // Step 2: Create auth user account with skip_auto_insert
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: memberData.email,
        password: memberData.password,
        options: {
          emailRedirectTo: undefined, // No email confirmation
          data: {
            skip_auto_insert: 'true', // We'll handle the user record insertion manually
            first_name: memberData.firstName,
            middle_name: memberData.middleName || '',
            last_name: memberData.lastName,
            suffix: memberData.suffix || '',
            phone: memberData.phone || '',
          }
        }
      })

      // Step 3: Restore original session immediately after signup
      if (currentSession.data.session) {
        await supabase.auth.setSession({
          access_token: currentSession.data.session.access_token,
          refresh_token: currentSession.data.session.refresh_token
        })
      }

      if (authError) {
        console.error('Error creating auth user:', authError)
        return { success: false, error: { message: `Failed to create user account: ${authError.message}` } }
      }

      if (!authData.user?.id) {
        return { success: false, error: { message: 'Failed to create user account - no user ID returned' } }
      }

      // Step 4: Use database function to create household member with proper RLS handling
      const { data: functionResult, error: functionError } = await supabase
        .rpc('add_household_member', {
          member_data: {
            auth_user_id: authData.user.id,
            email: memberData.email,
            first_name: memberData.firstName,
            middle_name: memberData.middleName || null,
            last_name: memberData.lastName,
            suffix: memberData.suffix || null,
            phone: memberData.phone || '',
            relationship_id: memberData.relationshipId
          },
          household_uuid: householdId,
          tenant_uuid: tenantId,
          created_by_uuid: user.id
        })

      if (functionError) {
        console.error('Error calling add_household_member function:', functionError)
        return { success: false, error: { message: `Failed to add household member: ${functionError.message}` } }
      }

      if (!functionResult.success) {
        console.error('Database function returned error:', functionResult.error)
        return { success: false, error: { message: functionResult.error } }
      }

      // Step 5: Fetch the created member with full details for return
      const { data: newMember, error: fetchError } = await supabase
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
        .eq('id', functionResult.member_id)
        .single()

      if (fetchError) {
        console.error('Error fetching created member:', fetchError)
        // Member was created successfully, but we couldn't fetch details
        // This is not a critical error, just refresh the list
        await fetchMembers()
        return { success: true, data: undefined }
      }

      // Transform response to handle potential array relationships
      const transformedData = {
        ...newMember,
        relationship: Array.isArray(newMember.relationship)
          ? newMember.relationship[0]
          : newMember.relationship
      }

      // Refresh the members list
      await fetchMembers()

      return { success: true, data: transformedData }
    } catch (err) {
      console.error('Error in addMember:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      return { success: false, error: { message: errorMessage } }
    }
  }, [user, tenantId, getUserHouseholdId, fetchMembers])

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

      // Transform response to handle potential array relationships
      const transformedData = {
        ...data,
        relationship: Array.isArray(data.relationship)
          ? data.relationship[0]
          : data.relationship
      }

      // Refresh the members list
      await fetchMembers()

      return { success: true, data: transformedData }
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
      // Use database function to remove household member with proper RLS handling
      const { data: functionResult, error: functionError } = await supabase
        .rpc('remove_household_member', {
          member_uuid: memberId,
          tenant_uuid: tenantId,
          removed_by_uuid: user.id
        })

      if (functionError) {
        console.error('Error calling remove_household_member function:', functionError)
        return { success: false, error: { message: `Failed to remove household member: ${functionError.message}` } }
      }

      if (!functionResult.success) {
        console.error('Database function returned error:', functionResult.error)
        return { success: false, error: { message: functionResult.error } }
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
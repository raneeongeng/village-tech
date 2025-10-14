'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import {
  UseHouseholdActionsResult,
  ApiResponse,
} from '@/types/household'

/**
 * Hook for performing household management actions (approve, reject, toggle status)
 */
export function useHouseholdActions(): UseHouseholdActionsResult {
  const { user } = useAuth()
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  // Set loading state for a specific household
  const setHouseholdLoading = useCallback((householdId: string, isLoading: boolean) => {
    setLoading(prev => ({
      ...prev,
      [householdId]: isLoading,
    }))
  }, [])

  // Approve household application
  const approveHousehold = useCallback(async (householdId: string): Promise<ApiResponse<void>> => {
    if (!user?.id) {
      return {
        success: false,
        error: {
          message: 'User not authenticated',
          details: 'Authentication required to approve households',
        },
      }
    }

    setHouseholdLoading(householdId, true)

    try {
      // Call the approve_household database function
      const { data, error } = await supabase
        .rpc('approve_household', {
          household_uuid: householdId,
          approved_by_uuid: user.id,
        })

      if (error) {
        console.error('Approve household error:', error)
        return {
          success: false,
          error: {
            message: 'Failed to approve household',
            details: error.message,
          },
        }
      }

      // Check if function returned success
      if (data && !data.success) {
        return {
          success: false,
          error: {
            message: 'Approval failed',
            details: data.error || 'Unknown error occurred',
          },
        }
      }

      return {
        success: true,
      }
    } catch (err) {
      console.error('Error in approveHousehold:', err)
      return {
        success: false,
        error: {
          message: 'Network error',
          details: err instanceof Error ? err.message : 'Unknown error occurred',
        },
      }
    } finally {
      setHouseholdLoading(householdId, false)
    }
  }, [user?.id, setHouseholdLoading])

  // Reject household application (deletes the record)
  const rejectHousehold = useCallback(async (
    householdId: string,
    reason?: string
  ): Promise<ApiResponse<void>> => {
    if (!user?.id) {
      return {
        success: false,
        error: {
          message: 'User not authenticated',
          details: 'Authentication required to reject households',
        },
      }
    }

    setHouseholdLoading(householdId, true)

    try {
      // Start a transaction to delete household and related records
      const { error: deleteHouseholdMembersError } = await supabase
        .from('household_members')
        .delete()
        .eq('household_id', householdId)

      if (deleteHouseholdMembersError) {
        throw new Error(`Failed to delete household members: ${deleteHouseholdMembersError.message}`)
      }

      // Delete the household record
      const { error: deleteHouseholdError } = await supabase
        .from('households')
        .delete()
        .eq('id', householdId)

      if (deleteHouseholdError) {
        throw new Error(`Failed to delete household: ${deleteHouseholdError.message}`)
      }

      // Delete the associated user account (household head)
      // Note: This requires careful consideration of referential integrity
      // For now, we'll keep the user account but deactivate it
      const { data: householdData } = await supabase
        .from('households')
        .select('household_head_id')
        .eq('id', householdId)
        .single()

      if (householdData?.household_head_id) {
        const { error: deactivateUserError } = await supabase
          .from('users')
          .update({ is_active: false })
          .eq('id', householdData.household_head_id)

        if (deactivateUserError) {
          console.warn('Failed to deactivate user account:', deactivateUserError)
          // Don't fail the entire operation for this
        }
      }

      return {
        success: true,
      }
    } catch (err) {
      console.error('Error in rejectHousehold:', err)
      return {
        success: false,
        error: {
          message: 'Failed to reject household',
          details: err instanceof Error ? err.message : 'Unknown error occurred',
        },
      }
    } finally {
      setHouseholdLoading(householdId, false)
    }
  }, [user?.id, setHouseholdLoading])

  // Toggle household status between active and inactive
  const toggleHouseholdStatus = useCallback(async (
    householdId: string,
    currentStatus: string
  ): Promise<ApiResponse<void>> => {
    if (!user?.id) {
      return {
        success: false,
        error: {
          message: 'User not authenticated',
          details: 'Authentication required to toggle household status',
        },
      }
    }

    // Only allow toggling between active and inactive
    if (currentStatus !== 'active' && currentStatus !== 'inactive') {
      return {
        success: false,
        error: {
          message: 'Invalid status',
          details: `Cannot toggle status from ${currentStatus}. Only active/inactive households can be toggled.`,
        },
      }
    }

    setHouseholdLoading(householdId, true)

    try {
      // Call the toggle_household_status database function
      const { data, error } = await supabase
        .rpc('toggle_household_status', {
          household_uuid: householdId,
          admin_user_uuid: user.id,
        })

      if (error) {
        console.error('Toggle household status error:', error)
        return {
          success: false,
          error: {
            message: 'Failed to toggle household status',
            details: error.message,
          },
        }
      }

      // Check if function returned success
      if (data && !data.success) {
        return {
          success: false,
          error: {
            message: 'Status toggle failed',
            details: data.error || 'Unknown error occurred',
          },
        }
      }

      return {
        success: true,
      }
    } catch (err) {
      console.error('Error in toggleHouseholdStatus:', err)
      return {
        success: false,
        error: {
          message: 'Network error',
          details: err instanceof Error ? err.message : 'Unknown error occurred',
        },
      }
    } finally {
      setHouseholdLoading(householdId, false)
    }
  }, [user?.id, setHouseholdLoading])

  return {
    approveHousehold,
    rejectHousehold,
    toggleHouseholdStatus,
    loading,
  }
}
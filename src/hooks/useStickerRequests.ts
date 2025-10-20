import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import { useTenant } from './useTenant'

interface StickerRequest {
  id: string
  requester_email: string
  household_address: string
  member_name: string
  member_relationship: string
  vehicle_info: {
    vehicle_type?: string
    vehicle_make?: string
    vehicle_model?: string
    vehicle_plate?: string
    vehicle_color?: string
    type?: string
    make?: string
    model?: string
    plate?: string
    color?: string
  }
  proof_file_url: string
  remarks?: string
  submitted_at: string
  workflow_status: string
}

export function useStickerRequests() {
  const [requests, setRequests] = useState<StickerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { tenant } = useTenant()

  const fetchRequests = async () => {
    console.log('fetchRequests called, tenant:', tenant)
    if (!tenant?.id) {
      console.log('No tenant ID, returning early')
      return
    }

    console.log('Making API call to get_pending_vehicle_sticker_requests with tenant_id:', tenant.id)
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .rpc('get_pending_vehicle_sticker_requests', {
          p_tenant_id: tenant.id
        })

      console.log('API response:', { data, error: fetchError })

      if (fetchError) {
        throw fetchError
      }

      // Map database response to interface format
      const mappedRequests = (data || []).map((item: any) => ({
        id: item.request_id,
        requester_email: item.requester_email,
        household_address: item.household_address,
        member_name: item.member_name,
        member_relationship: item.member_relationship,
        vehicle_info: item.vehicle_info || {},
        proof_file_url: item.proof_file_url,
        remarks: item.remarks,
        submitted_at: item.submitted_at,
        workflow_status: item.workflow_status
      }))

      setRequests(mappedRequests)
    } catch (err) {
      console.error('Failed to fetch sticker requests:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch requests')
    } finally {
      setLoading(false)
    }
  }

  const approveRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .rpc('update_request_status', {
          p_request_id: requestId,
          p_new_status_code: 'approved',
          p_reviewer_id: user?.id,
          p_reviewer_notes: 'Request approved for sticker issuance'
        })

      if (error) {
        throw error
      }

      // Refresh the requests list
      await fetchRequests()
      return { success: true }
    } catch (err) {
      console.error('Failed to approve request:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to approve request'
      }
    }
  }

  const rejectRequest = async (requestId: string, reason: string) => {
    try {
      const { error } = await supabase
        .rpc('update_request_status', {
          p_request_id: requestId,
          p_new_status_code: 'rejected',
          p_reviewer_id: user?.id,
          p_reviewer_notes: reason
        })

      if (error) {
        throw error
      }

      // Refresh the requests list
      await fetchRequests()
      return { success: true }
    } catch (err) {
      console.error('Failed to reject request:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to reject request'
      }
    }
  }

  const printRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .rpc('mark_sticker_request_printed', {
          p_request_id: requestId
        })

      if (error) {
        throw error
      }

      // Refresh the requests list
      await fetchRequests()
      return { success: true }
    } catch (err) {
      console.error('Failed to mark request as printed:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to mark as printed'
      }
    }
  }

  const completeRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .rpc('mark_sticker_request_completed', {
          p_request_id: requestId
        })

      if (error) {
        throw error
      }

      // Refresh the requests list
      await fetchRequests()
      return { success: true }
    } catch (err) {
      console.error('Failed to complete request:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to complete request'
      }
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [tenant?.id])

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests,
    approveRequest,
    rejectRequest,
    printRequest,
    completeRequest
  }
}
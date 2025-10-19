import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import { useTenant } from './useTenant'

interface PeopleStickerRequest {
  request_id: string
  requester_email: string
  household_address: string
  selected_members: Array<{
    member_id: string
    member_name: string
    relationship: string
    id_document_url?: string
    photo_url?: string
  }>
  remarks?: string
  submitted_at: string
  workflow_status: string
}

export function usePeopleStickerRequests() {
  const [requests, setRequests] = useState<PeopleStickerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { tenant } = useTenant()

  const fetchRequests = async () => {
    console.log('People sticker fetchRequests called, tenant:', tenant)
    if (!tenant?.id) {
      console.log('No tenant ID for people stickers, returning early')
      return
    }

    console.log('Making API call to get_pending_people_sticker_requests with tenant_id:', tenant.id)
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .rpc('get_pending_people_sticker_requests', {
          p_tenant_id: tenant.id
        })

      console.log('People sticker API response:', { data, error: fetchError })

      if (fetchError) {
        throw fetchError
      }

      // Map database response to interface format
      const mappedRequests = (data || []).map((item: any) => ({
        request_id: item.request_id,
        requester_email: item.requester_email,
        household_address: item.household_address,
        selected_members: item.selected_members || [],
        remarks: item.remarks,
        submitted_at: item.submitted_at,
        workflow_status: item.workflow_status
      }))

      setRequests(mappedRequests)
    } catch (err) {
      console.error('Failed to fetch people sticker requests:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch requests')
    } finally {
      setLoading(false)
    }
  }

  const approveRequest = async (requestId: string, approvedMemberIds?: string[]) => {
    try {
      const { data, error } = await supabase
        .rpc('approve_people_sticker_request', {
          p_request_id: requestId,
          p_reviewer_id: user?.id,
          p_approved_member_ids: approvedMemberIds || null
        })

      if (error) {
        throw error
      }

      // Refresh the requests list
      await fetchRequests()
      return {
        success: true,
        data: data?.[0] || null,
        message: data?.[0]?.message || 'Request approved successfully'
      }
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

  const approveIndividualMember = async (requestId: string, memberId: string) => {
    return approveRequest(requestId, [memberId])
  }

  const approveBulkMembers = async (requestId: string, memberIds: string[]) => {
    return approveRequest(requestId, memberIds)
  }

  const approveAllMembers = async (requestId: string) => {
    return approveRequest(requestId) // No member IDs means approve all
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
    approveIndividualMember,
    approveBulkMembers,
    approveAllMembers
  }
}
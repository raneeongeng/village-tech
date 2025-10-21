import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useTenant } from '@/hooks/useTenant'

export interface OnboardingRequest {
  request_id: string
  request_type_code: string
  request_type_name: string
  requester_email: string
  submitted_at: string
  request_data: any
  workflow_status_code: string
  workflow_status_name: string
}

interface UseOnboardingRequestsOptions {
  requestType?: string
}

export function useOnboardingRequests(options: UseOnboardingRequestsOptions = {}) {
  const { tenant } = useTenant()
  const [requests, setRequests] = useState<OnboardingRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = useCallback(async () => {
    if (!tenant?.id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const { data, error: rpcError } = await supabase.rpc('get_pending_requests', {
        p_tenant_id: tenant.id,
        p_request_type_code: options.requestType || null
      })

      if (rpcError) {
        throw new Error(`Failed to fetch onboarding requests: ${rpcError.message}`)
      }

      setRequests(data || [])
    } catch (err) {
      console.error('Failed to load onboarding requests:', err)
      setError('Failed to load onboarding requests. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [tenant?.id, options.requestType])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const updateRequestStatus = async (
    requestId: string,
    statusCode: string,
    reviewerId?: string,
    reviewerNotes?: string
  ) => {
    try {
      const { error } = await supabase.rpc('update_request_status', {
        p_request_id: requestId,
        p_new_status_code: statusCode,
        p_reviewer_id: reviewerId,
        p_reviewer_notes: reviewerNotes
      })

      if (error) {
        throw error
      }

      // Refresh the requests list
      await fetchRequests()
      return true
    } catch (err) {
      console.error('Failed to update request status:', err)
      throw err
    }
  }

  return {
    requests,
    isLoading,
    error,
    refetch: fetchRequests,
    updateRequestStatus
  }
}
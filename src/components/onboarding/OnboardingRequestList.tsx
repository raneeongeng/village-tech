'use client'

import { useState } from 'react'
import { useOnboardingRequests, type OnboardingRequest } from '@/hooks/useOnboardingRequests'
import { useAuth } from '@/hooks/useAuth'
import { roleHasPermission } from '@/lib/config/roles'

interface OnboardingRequestListProps {
  requestType?: string
}

export function OnboardingRequestList({ requestType }: OnboardingRequestListProps) {
  const { user } = useAuth()
  const { requests, isLoading, error, updateRequestStatus } = useOnboardingRequests({ requestType })
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)

  const canManageRequests = user?.role?.code && roleHasPermission(user.role.code as any, 'manage_households')

  const handleApprove = async (request: OnboardingRequest) => {
    if (!user?.id) return

    try {
      setProcessingRequest(request.request_id)
      await updateRequestStatus(
        request.request_id,
        'approved',
        user.id,
        'Request approved by admin'
      )
    } catch (err) {
      console.error('Failed to approve request:', err)
      alert('Failed to approve request. Please try again.')
    } finally {
      setProcessingRequest(null)
    }
  }

  const handleReject = async (request: OnboardingRequest) => {
    if (!user?.id) return

    const reason = prompt('Please provide a reason for rejection:')
    if (!reason) return

    try {
      setProcessingRequest(request.request_id)
      await updateRequestStatus(
        request.request_id,
        'rejected',
        user.id,
        reason
      )
    } catch (err) {
      console.error('Failed to reject request:', err)
      alert('Failed to reject request. Please try again.')
    } finally {
      setProcessingRequest(null)
    }
  }

  const formatRequestData = (request: OnboardingRequest) => {
    const data = request.request_data

    switch (request.request_type_code) {
      case 'household_registration':
        return (
          <div>
            <p><strong>Address:</strong> {data.address}</p>
            {data.contact_info?.phone && <p><strong>Phone:</strong> {data.contact_info.phone}</p>}
          </div>
        )
      case 'sticker_vehicle_request':
        return (
          <div>
            <p><strong>Vehicle:</strong> {data.vehicle_info?.make} {data.vehicle_info?.model}</p>
            <p><strong>Plate:</strong> {data.vehicle_info?.plate}</p>
            <p><strong>Color:</strong> {data.vehicle_info?.color}</p>
          </div>
        )
      case 'sticker_people_request':
        return (
          <div>
            <p><strong>Member:</strong> {data.member_name}</p>
            <p><strong>Relationship:</strong> {data.relationship}</p>
          </div>
        )
      default:
        return (
          <div>
            <p><strong>Request Data:</strong> {JSON.stringify(data, null, 2)}</p>
          </div>
        )
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800'
      case 'under_review':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading requests...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.134 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
        <p className="text-gray-600">There are no onboarding requests at this time.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Household Onboarding Requests</h2>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                {canManageRequests && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.request_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.request_type_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.requester_email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatRequestData(request)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(request.workflow_status_code)}`}>
                      {request.workflow_status_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.submitted_at).toLocaleDateString()}
                  </td>
                  {canManageRequests && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {request.workflow_status_code === 'submitted' && (
                        <>
                          <button
                            onClick={() => handleApprove(request)}
                            disabled={processingRequest === request.request_id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request)}
                            disabled={processingRequest === request.request_id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {processingRequest === request.request_id && (
                        <span className="text-gray-500">Processing...</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
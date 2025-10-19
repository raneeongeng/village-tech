'use client'

import { useState } from 'react'
import { StickerRequestDetails } from './StickerRequestDetails'
import { useStickerRequests } from '@/hooks/useStickerRequests'

export function StickerRequestsManagement() {
  const { requests, loading, error, approveRequest, rejectRequest } = useStickerRequests()
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleApprove = async (requestId: string) => {
    setActionLoading(requestId)
    try {
      const result = await approveRequest(requestId)
      if (result.success) {
        // Show success message or notification
        console.log('Request approved successfully')
      } else {
        console.error('Failed to approve:', result.error)
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (requestId: string, reason: string) => {
    setActionLoading(requestId)
    try {
      const result = await rejectRequest(requestId, reason)
      if (result.success) {
        // Show success message or notification
        console.log('Request rejected successfully')
      } else {
        console.error('Failed to reject:', result.error)
      }
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading sticker requests...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading requests</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
        <p className="mt-1 text-sm text-gray-500">
          All sticker requests have been processed.
        </p>
      </div>
    )
  }

  const selectedRequestData = requests.find(r => r.id === selectedRequest)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Vehicle Sticker Requests
        </h2>
        <div className="text-sm text-gray-500">
          {requests.length} pending request{requests.length !== 1 ? 's' : ''}
        </div>
      </div>

      {selectedRequestData ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedRequest(null)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to list
          </button>
          <StickerRequestDetails
            request={selectedRequestData}
            onApprove={handleApprove}
            onReject={handleReject}
            showActions={true}
          />
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {requests.map((request) => (
              <li key={request.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {request.vehicle_info.make || request.vehicle_info.vehicle_make} {request.vehicle_info.model || request.vehicle_info.vehicle_model}
                          </p>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {request.vehicle_info.plate || request.vehicle_info.vehicle_plate}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {request.requester_email} • {request.member_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Submitted {new Date(request.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {request.workflow_status}
                      </span>
                      <button
                        onClick={() => setSelectedRequest(request.id)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Review →
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
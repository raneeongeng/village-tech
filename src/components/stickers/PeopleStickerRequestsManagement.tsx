'use client'

import { useState } from 'react'
import { PeopleStickerRequestDetails } from './PeopleStickerRequestDetails'
import { usePeopleStickerRequests } from '@/hooks/usePeopleStickerRequests'

export function PeopleStickerRequestsManagement() {
  const {
    requests,
    loading,
    error,
    approveAllMembers,
    approveBulkMembers,
    approveIndividualMember,
    rejectRequest
  } = usePeopleStickerRequests()

  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Array<{ id: string; type: 'success' | 'error'; message: string }>>([])

  const showNotification = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substring(2)
    setNotifications(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  const handleApproveAll = async (requestId: string) => {
    setActionLoading(requestId)
    try {
      const result = await approveAllMembers(requestId)
      if (result.success) {
        showNotification('success', result.message || 'All members approved successfully')
        setSelectedRequest(null) // Return to list view
      } else {
        showNotification('error', result.error || 'Failed to approve members')
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleApproveBulk = async (requestId: string, memberIds: string[]) => {
    setActionLoading(requestId)
    try {
      const result = await approveBulkMembers(requestId, memberIds)
      if (result.success) {
        showNotification('success', result.message || `${memberIds.length} members approved successfully`)
        setSelectedRequest(null) // Return to list view
      } else {
        showNotification('error', result.error || 'Failed to approve selected members')
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleApproveIndividual = async (requestId: string, memberId: string) => {
    setActionLoading(`${requestId}-${memberId}`)
    try {
      const result = await approveIndividualMember(requestId, memberId)
      if (result.success) {
        showNotification('success', 'Member approved successfully')
        // Don't close the details view for individual approvals
      } else {
        showNotification('error', result.error || 'Failed to approve member')
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
        showNotification('success', 'Request rejected successfully')
        setSelectedRequest(null) // Return to list view
      } else {
        showNotification('error', result.error || 'Failed to reject request')
      }
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading people sticker requests...</span>
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
        <p className="mt-1 text-sm text-gray-500">
          All people sticker requests have been processed.
        </p>
      </div>
    )
  }

  const selectedRequestData = requests.find(r => r.request_id === selectedRequest)

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${
                notification.type === 'success' ? 'border-l-4 border-green-400' : 'border-l-4 border-red-400'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {notification.type === 'success' ? (
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                      className="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          People Sticker Requests
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
          <PeopleStickerRequestDetails
            request={selectedRequestData}
            onApproveAll={handleApproveAll}
            onApproveBulk={handleApproveBulk}
            onApproveIndividual={handleApproveIndividual}
            onReject={handleReject}
            showActions={true}
          />
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {requests.map((request) => (
              <li key={request.request_id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {request.selected_members.length} Member{request.selected_members.length !== 1 ? 's' : ''} Requested
                          </p>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {request.selected_members.map(m => m.member_name).join(', ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {request.requester_email} • {request.household_address}
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
                        onClick={() => setSelectedRequest(request.request_id)}
                        disabled={actionLoading === request.request_id}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium disabled:opacity-50"
                      >
                        {actionLoading === request.request_id ? 'Processing...' : 'Review →'}
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
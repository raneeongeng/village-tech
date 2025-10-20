'use client'

import { useState } from 'react'
import { DocumentViewer } from './DocumentViewer'

interface SelectedMember {
  member_id: string
  member_name: string
  relationship: string
  id_document_url?: string
  photo_url?: string
}

interface PeopleStickerRequestDetailsProps {
  request: {
    request_id: string
    requester_email: string
    household_address: string
    selected_members: SelectedMember[]
    remarks?: string
    submitted_at: string
    workflow_status: string
  }
  onApproveAll?: (requestId: string) => void
  onApproveBulk?: (requestId: string, memberIds: string[]) => void
  onApproveIndividual?: (requestId: string, memberId: string) => void
  onReject?: (requestId: string, reason: string) => void
  onPrint?: (requestId: string) => void
  onComplete?: (requestId: string) => void
  showActions?: boolean
}

export function PeopleStickerRequestDetails({
  request,
  onApproveAll,
  onApproveBulk,
  onApproveIndividual,
  onReject,
  onPrint,
  onComplete,
  showActions = false
}: PeopleStickerRequestDetailsProps) {
  const [expandedDocuments, setExpandedDocuments] = useState<Set<string>>(new Set())

  const handleReject = () => {
    const reason = prompt('Please provide a reason for rejection:')
    if (reason && onReject) {
      onReject(request.request_id, reason)
    }
  }

  const toggleDocumentExpansion = (memberId: string) => {
    const newExpanded = new Set(expandedDocuments)
    if (newExpanded.has(memberId)) {
      newExpanded.delete(memberId)
    } else {
      newExpanded.add(memberId)
    }
    setExpandedDocuments(newExpanded)
  }

  const handlePrint = () => {
    if (onPrint) {
      onPrint(request.request_id)
    }
  }

  const handleComplete = () => {
    if (onComplete) {
      onComplete(request.request_id)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800'
      case 'under_review':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'ready_for_printing':
      case 'ready for printing':
        return 'bg-orange-100 text-orange-800'
      case 'printed':
        return 'bg-indigo-100 text-indigo-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Helper function to determine which actions to show based on status
  const getAvailableActions = () => {
    const status = request.workflow_status.toLowerCase()

    switch (status) {
      case 'submitted':
      case 'under_review':
        return { canApprove: true, canReject: true, canPrint: false, canComplete: false }
      case 'approved':
      case 'ready_for_printing':
      case 'ready for printing':
        return { canApprove: false, canReject: true, canPrint: true, canComplete: false }
      case 'printed':
        return { canApprove: false, canReject: false, canPrint: false, canComplete: true }
      default:
        return { canApprove: false, canReject: false, canPrint: false, canComplete: false }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            People Sticker Request
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Request ID: {request.request_id}
          </p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(request.workflow_status)}`}>
            {request.workflow_status}
          </span>
          <p className="text-xs text-gray-500">
            Submitted: {new Date(request.submitted_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Request Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 border-b pb-2">Request Information</h4>
          <div>
            <label className="text-sm font-medium text-gray-500">Requester Email</label>
            <p className="text-sm text-gray-900">{request.requester_email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Household Address</label>
            <p className="text-sm text-gray-900">{request.household_address}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Total Members Requested</label>
            <p className="text-sm text-gray-900">{request.selected_members.length} members</p>
          </div>
        </div>

        {request.remarks && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 border-b pb-2">Additional Remarks</h4>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700">{request.remarks}</p>
            </div>
          </div>
        )}
      </div>


      {/* Selected Members List */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 border-b pb-2 mb-4">Requested Members</h4>
        <div className="space-y-4">
          {request.selected_members.map((member) => (
            <div
              key={member.member_id}
              className="border rounded-lg p-4 border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{member.member_name}</h5>
                    <p className="text-sm text-gray-500">{member.relationship}</p>

                    {/* Document Status */}
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className={`text-xs ${member.id_document_url ? 'text-green-600' : 'text-gray-400'}`}>
                          ID Document {member.id_document_url ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className={`text-xs ${member.photo_url ? 'text-green-600' : 'text-gray-400'}`}>
                          Photo {member.photo_url ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Actions */}
                <div className="flex items-center space-x-2">
                  {(member.id_document_url || member.photo_url) && (
                    <button
                      onClick={() => toggleDocumentExpansion(member.member_id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {expandedDocuments.has(member.member_id) ? 'Hide' : 'View'} Documents
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Documents */}
              {expandedDocuments.has(member.member_id) && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  {member.id_document_url && (
                    <div>
                      <h6 className="text-sm font-medium text-gray-700 mb-2">ID Document</h6>
                      <DocumentViewer
                        fileUrl={member.id_document_url}
                        fileName={`${member.member_name} - ID Document`}
                        className="max-w-md"
                      />
                    </div>
                  )}
                  {member.photo_url && (
                    <div>
                      <h6 className="text-sm font-medium text-gray-700 mb-2">Photo</h6>
                      <DocumentViewer
                        fileUrl={member.photo_url}
                        fileName={`${member.member_name} - Photo`}
                        className="max-w-md"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (() => {
        const actions = getAvailableActions()
        return (
          <div className="flex justify-end space-x-3 pt-4 border-t">
            {actions.canReject && (
              <button
                onClick={handleReject}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 transition-colors"
              >
                Reject Request
              </button>
            )}
            {actions.canApprove && (
              <button
                onClick={() => onApproveAll?.(request.request_id)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                Approve
              </button>
            )}
            {actions.canPrint && (
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🖨️ Print Stickers
              </button>
            )}
            {actions.canComplete && (
              <button
                onClick={handleComplete}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                ✅ Mark as Completed
              </button>
            )}
          </div>
        )
      })()}
    </div>
  )
}
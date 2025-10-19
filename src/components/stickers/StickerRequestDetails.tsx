'use client'

import { DocumentViewer } from './DocumentViewer'

interface StickerRequestDetailsProps {
  request: {
    id: string
    requester_email: string
    household_address: string
    member_name: string
    member_relationship: string
    vehicle_info: {
      vehicle_type: string
      vehicle_make: string
      vehicle_model: string
      vehicle_plate: string
      vehicle_color: string
    }
    proof_file_url: string
    remarks?: string
    submitted_at: string
    workflow_status: string
  }
  onApprove?: (requestId: string) => void
  onReject?: (requestId: string, reason: string) => void
  showActions?: boolean
}

export function StickerRequestDetails({
  request,
  onApprove,
  onReject,
  showActions = false
}: StickerRequestDetailsProps) {
  const handleApprove = () => {
    if (onApprove) {
      onApprove(request.id)
    }
  }

  const handleReject = () => {
    const reason = prompt('Please provide a reason for rejection:')
    if (reason && onReject) {
      onReject(request.id, reason)
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
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Vehicle Sticker Request
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Request ID: {request.id}
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

      {/* Request Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Requester Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">Requester Information</h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-sm text-gray-900">{request.requester_email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Household Address</label>
              <p className="text-sm text-gray-900">{request.household_address}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Member</label>
              <p className="text-sm text-gray-900">
                {request.member_name} ({request.member_relationship})
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">Vehicle Information</h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Type</label>
              <p className="text-sm text-gray-900">{request.vehicle_info.vehicle_type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Make & Model</label>
              <p className="text-sm text-gray-900">
                {request.vehicle_info.vehicle_make} {request.vehicle_info.vehicle_model}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Plate Number</label>
              <p className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                {request.vehicle_info.vehicle_plate}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Color</label>
              <p className="text-sm text-gray-900">{request.vehicle_info.vehicle_color}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Remarks */}
      {request.remarks && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 border-b pb-2 mb-3">Additional Remarks</h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">{request.remarks}</p>
          </div>
        </div>
      )}

      {/* Document Viewer */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 border-b pb-2 mb-3">Proof of Ownership</h4>
        <DocumentViewer
          fileUrl={request.proof_file_url}
          fileName="Proof of Ownership"
        />
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={handleReject}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 transition-colors"
          >
            Reject Request
          </button>
          <button
            onClick={handleApprove}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            Approve Request
          </button>
        </div>
      )}
    </div>
  )
}
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
  onApprove?: (requestId: string) => void
  onReject?: (requestId: string, reason: string) => void
  onPrint?: (requestId: string) => void
  onComplete?: (requestId: string) => void
  showActions?: boolean
}

export function StickerRequestDetails({
  request,
  onApprove,
  onReject,
  onPrint,
  onComplete,
  showActions = false
}: StickerRequestDetailsProps) {
  // Helper function to safely get vehicle info with fallbacks
  const getVehicleInfo = () => {
    const info = request.vehicle_info
    return {
      type: info.vehicle_type || info.type || 'N/A',
      make: info.vehicle_make || info.make || 'N/A',
      model: info.vehicle_model || info.model || 'N/A',
      plate: info.vehicle_plate || info.plate || 'N/A',
      color: info.vehicle_color || info.color || 'N/A'
    }
  }

  const vehicleInfo = getVehicleInfo()
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

  const handlePrint = () => {
    if (onPrint) {
      onPrint(request.id)
    }
  }

  const handleComplete = () => {
    if (onComplete) {
      onComplete(request.id)
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
              <p className="text-sm text-gray-900">{vehicleInfo.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Make & Model</label>
              <p className="text-sm text-gray-900">
                {vehicleInfo.make} {vehicleInfo.model}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Plate Number</label>
              <p className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                {vehicleInfo.plate}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Color</label>
              <p className="text-sm text-gray-900">{vehicleInfo.color}</p>
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
                onClick={handleApprove}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                Approve Request
              </button>
            )}
            {actions.canPrint && (
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🖨️ Print Sticker
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
'use client'

import { ApprovalModalProps } from '@/types/household'

export function ApprovalModal({
  isOpen,
  household,
  onConfirm,
  onCancel,
  loading = false,
}: ApprovalModalProps) {
  if (!isOpen || !household) return null

  const getFullName = () => {
    const parts = [
      household.household_head.first_name,
      household.household_head.middle_name,
      household.household_head.last_name,
      household.household_head.suffix,
    ].filter(Boolean)
    return parts.join(' ')
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <span className="material-icons-outlined text-green-500 text-2xl">
                check_circle
              </span>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Approve Household Application
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Are you sure you want to approve this household application? This action will:
            </p>

            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
              <li>Grant access to village services and facilities</li>
              <li>Allow the household head to log in to the system</li>
              <li>Enable household management features</li>
              <li>Send a notification to the applicant</li>
            </ul>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm">
                <div className="font-medium text-gray-900">
                  {getFullName()}
                </div>
                <div className="text-gray-600">
                  {household.household_head.email}
                </div>
                <div className="text-gray-600 mt-1">
                  {household.address}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <span className="animate-spin material-icons-outlined text-sm">
                  refresh
                </span>
              )}
              {loading ? 'Approving...' : 'Approve Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
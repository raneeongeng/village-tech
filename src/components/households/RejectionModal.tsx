'use client'

import { useState } from 'react'
import { RejectionModalProps } from '@/types/household'

export function RejectionModal({
  isOpen,
  household,
  onConfirm,
  onCancel,
  loading = false,
}: RejectionModalProps) {
  const [reason, setReason] = useState('')

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

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined)
    setReason('') // Reset reason after confirmation
  }

  const handleCancel = () => {
    setReason('') // Reset reason when canceling
    onCancel()
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <span className="material-icons-outlined text-red-500 text-2xl">
                cancel
              </span>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Reject Household Application
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Are you sure you want to reject this household application? This action will:
            </p>

            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
              <li>Permanently delete the application</li>
              <li>Deactivate the associated user account</li>
              <li>Send a rejection notification (if reason provided)</li>
              <li>Remove all related household data</li>
            </ul>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
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

            {/* Rejection Reason */}
            <div>
              <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for rejection (optional)
              </label>
              <textarea
                id="rejection-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary resize-none"
                placeholder="Provide a reason for rejecting this application..."
                maxLength={500}
                disabled={loading}
              />
              <div className="text-xs text-gray-500 mt-1">
                {reason.length}/500 characters
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <div className="flex items-start">
              <span className="material-icons-outlined text-red-500 text-sm mt-0.5 mr-2">
                warning
              </span>
              <div className="text-sm text-red-800">
                <strong>Warning:</strong> This action cannot be undone. All household and member data will be permanently removed.
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <span className="animate-spin material-icons-outlined text-sm">
                  refresh
                </span>
              )}
              {loading ? 'Rejecting...' : 'Reject Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
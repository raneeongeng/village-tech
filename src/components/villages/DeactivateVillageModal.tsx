'use client'

import { useState } from 'react'
import { VillageDetails } from '@/hooks/useVillageDetails'
import { updateVillageStatus } from '@/hooks/useCreateVillage'
import { useLookupValues } from '@/hooks/useLookupValues'

interface DeactivateVillageModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  village: VillageDetails
  action: 'activate' | 'deactivate'
}

export function DeactivateVillageModal({
  isOpen,
  onClose,
  onSuccess,
  village,
  action
}: DeactivateVillageModalProps) {
  const [reason, setReason] = useState('')
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { villageStatuses } = useLookupValues()

  if (!isOpen) return null

  const getTargetStatusId = () => {
    const targetStatus = action === 'activate' ? 'active' : 'inactive'
    return villageStatuses.find(status => status.code === targetStatus)?.id || ''
  }

  const handleSubmit = async () => {
    if (action === 'deactivate' && !reason.trim()) {
      setError('Please provide a reason for deactivation')
      return
    }

    setUpdating(true)
    setError(null)

    try {
      const targetStatusId = getTargetStatusId()
      if (!targetStatusId) {
        throw new Error(`${action === 'activate' ? 'Active' : 'Inactive'} status not found`)
      }

      const result = await updateVillageStatus(village.id, targetStatusId)

      if (result.success) {
        onSuccess()
        setReason('')
      } else {
        setError(result.error?.message || `Failed to ${action} village`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} village`)
    } finally {
      setUpdating(false)
    }
  }

  const handleClose = () => {
    if (!updating) {
      setReason('')
      setError(null)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {action === 'activate' ? 'Activate' : 'Deactivate'} Village
          </h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to {action} &quot;{village.name}&quot;?
          </p>

          {action === 'deactivate' && (
            <div className="mb-4">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for deactivation *
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for deactivating this village..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={3}
                disabled={updating}
                required
              />
            </div>
          )}

          {action === 'activate' && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                Activating this village will restore access for all users and admins.
                All previously assigned permissions will be restored.
              </p>
            </div>
          )}

          {action === 'deactivate' && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                This will immediately revoke access for all users and admins in this village.
                This action can be reversed by reactivating the village.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleClose}
              disabled={updating}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={updating || (action === 'deactivate' && !reason.trim())}
              className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                action === 'activate'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {updating ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin material-icons-outlined text-sm">refresh</span>
                  {action === 'activate' ? 'Activating...' : 'Deactivating...'}
                </span>
              ) : (
                action === 'activate' ? 'Activate Village' : 'Deactivate Village'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
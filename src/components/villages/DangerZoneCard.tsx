'use client'

import { useState } from 'react'
import { VillageDetails } from '@/hooks/useVillageDetails'
import { DeactivateVillageModal } from './DeactivateVillageModal'

interface DangerZoneCardProps {
  village: VillageDetails
  onRefresh: () => void
}

export function DangerZoneCard({ village, onRefresh }: DangerZoneCardProps) {
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false)

  const isActive = village.lookup_values?.name === 'Active'

  const handleDeactivateSuccess = () => {
    setIsDeactivateModalOpen(false)
    onRefresh()
  }

  return (
    <>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Danger Zone</h3>
          <button
            onClick={() => setIsDeactivateModalOpen(true)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              isActive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isActive ? 'Deactivate Tenant' : 'Activate Tenant'}
          </button>
        </div>
        <p className="text-sm text-gray-500">
          {isActive ? (
            <>
              Deactivating the tenant will revoke all access for its users and admins.
              This action can be reversed, but requires manual reactivation.
            </>
          ) : (
            <>
              Activating the tenant will restore access for its users and admins.
              All previously assigned permissions will be restored.
            </>
          )}
        </p>
      </div>

      <DeactivateVillageModal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        onSuccess={handleDeactivateSuccess}
        village={village}
        action={isActive ? 'deactivate' : 'activate'}
      />
    </>
  )
}
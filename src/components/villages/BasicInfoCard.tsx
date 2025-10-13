'use client'

import { VillageDetails } from '@/hooks/useVillageDetails'

interface BasicInfoCardProps {
  village: VillageDetails
}

export function BasicInfoCard({ village }: BasicInfoCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString().split('T')[0]
  }

  const getRegionAddress = () => {
    const parts = []
    if (village.settings?.region) {
      parts.push(village.settings.region)
    }
    if (village.settings?.address) {
      parts.push(village.settings.address)
    }
    return parts.length > 0 ? parts.join(', ') : 'Not provided'
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
        <div>
          <p className="text-gray-500 mb-1">Created Date</p>
          <p className="font-medium text-gray-800">{formatDate(village.created_at)}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-1">Last Updated</p>
          <p className="font-medium text-gray-800">{formatDate(village.updated_at)}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-gray-500 mb-1">Region / Address</p>
          <p className="font-medium text-gray-800">{getRegionAddress()}</p>
        </div>
        {village.settings?.description && (
          <div className="sm:col-span-2">
            <p className="text-gray-500 mb-1">Description</p>
            <p className="font-medium text-gray-800">{village.settings.description}</p>
          </div>
        )}
        {village.settings?.contact_email && (
          <div>
            <p className="text-gray-500 mb-1">Contact Email</p>
            <p className="font-medium text-gray-800">{village.settings.contact_email}</p>
          </div>
        )}
        {village.settings?.contact_phone && (
          <div>
            <p className="text-gray-500 mb-1">Contact Phone</p>
            <p className="font-medium text-gray-800">{village.settings.contact_phone}</p>
          </div>
        )}
        {village.settings?.timezone && (
          <div>
            <p className="text-gray-500 mb-1">Timezone</p>
            <p className="font-medium text-gray-800">{village.settings.timezone}</p>
          </div>
        )}
        {village.settings?.currency && (
          <div>
            <p className="text-gray-500 mb-1">Currency</p>
            <p className="font-medium text-gray-800">{village.settings.currency}</p>
          </div>
        )}
      </div>
    </div>
  )
}
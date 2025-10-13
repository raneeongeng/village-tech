'use client'

import { VillageMetadata, VillageDetails } from '@/hooks/useVillageDetails'

interface MetadataSummaryProps {
  metadata: VillageMetadata | null
  village: VillageDetails
}

export function MetadataSummary({ metadata, village }: MetadataSummaryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStoragePercent = () => {
    if (!metadata || metadata.storageTotal === 0) return 0
    return Math.round((metadata.storageUsed / metadata.storageTotal) * 100)
  }

  if (!metadata) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tenant Metadata Summary</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-8"></div>
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tenant Metadata Summary</h3>
        <div className="space-y-4">

          {/* Total Members */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
            <div>
              <p className="text-sm text-gray-500">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{metadata.totalMembers}</p>
            </div>
            <span className="material-icons-outlined text-gray-400 text-3xl">group</span>
          </div>

          {/* QR Codes Generated */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
            <div>
              <p className="text-sm text-gray-500">QR Codes Generated</p>
              <p className="text-2xl font-bold text-gray-900">{metadata.qrCodesCount}</p>
            </div>
            <span className="material-icons-outlined text-gray-400 text-3xl">qr_code_2</span>
          </div>

          {/* Last Activity Date */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
            <div>
              <p className="text-sm text-gray-500">Last Activity Date</p>
              <p className="text-xl font-bold text-gray-900">{formatDate(metadata.lastActivityDate)}</p>
            </div>
            <span className="material-icons-outlined text-gray-400 text-3xl">event</span>
          </div>

          {/* Active Admins */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
            <div>
              <p className="text-sm text-gray-500">Active Admins</p>
              <p className="text-2xl font-bold text-gray-900">{metadata.activeAdminsCount}</p>
            </div>
            <span className="material-icons-outlined text-gray-400 text-3xl">shield_person</span>
          </div>

          {/* Storage Usage */}
          <div className="p-4 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-500 mb-1">Storage Usage</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${getStoragePercent()}%` }}
              ></div>
            </div>
            <p className="text-sm font-medium text-gray-800">
              {metadata.storageUsed} GB / {metadata.storageTotal} GB
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {getStoragePercent()}% used
            </p>
          </div>

        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left">
            <div>
              <p className="text-sm font-medium text-gray-900">Export Village Data</p>
              <p className="text-xs text-gray-500">Download all village information</p>
            </div>
            <span className="material-icons-outlined text-gray-400">download</span>
          </button>

          <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left">
            <div>
              <p className="text-sm font-medium text-gray-900">View All Members</p>
              <p className="text-xs text-gray-500">Manage village users</p>
            </div>
            <span className="material-icons-outlined text-gray-400">people</span>
          </button>

          <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left">
            <div>
              <p className="text-sm font-medium text-gray-900">Activity Reports</p>
              <p className="text-xs text-gray-500">Generate activity logs</p>
            </div>
            <span className="material-icons-outlined text-gray-400">assessment</span>
          </button>
        </div>
      </div>
    </div>
  )
}
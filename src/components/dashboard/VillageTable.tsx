'use client'

import { Village } from '@/types/dashboard'

interface VillageTableProps {
  villages: Village[] | null
  loading: boolean
  error: Error | null
  onRetry?: () => void
}

export function VillageTable({ villages, loading, error, onRetry }: VillageTableProps) {
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toISOString().split('T')[0]
    } catch {
      return 'Invalid date'
    }
  }

  const getStatusBadge = (statusCode: string, statusName: string, colorCode?: string) => {
    // Determine color based on status code
    let bgColor = 'bg-gray-100'
    let textColor = 'text-gray-800'

    if (statusCode === 'active') {
      bgColor = 'bg-green-100'
      textColor = 'text-green-800'
    } else if (statusCode === 'inactive') {
      bgColor = 'bg-red-100'
      textColor = 'text-red-800'
    } else if (statusCode === 'suspended') {
      bgColor = 'bg-yellow-100'
      textColor = 'text-yellow-800'
    }

    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${bgColor} ${textColor}`}>
        {statusName}
      </span>
    )
  }

  const renderLoadingRows = () => {
    return [1, 2, 3, 4, 5].map(i => (
      <tr key={i} className="animate-pulse">
        <td className="whitespace-nowrap px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </td>
        <td className="whitespace-nowrap px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </td>
        <td className="whitespace-nowrap px-6 py-4">
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        </td>
        <td className="whitespace-nowrap px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </td>
      </tr>
    ))
  }

  const renderErrorRow = () => (
    <tr>
      <td colSpan={4} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center">
          <span className="material-icons-outlined text-4xl text-red-400 mb-2">
            error
          </span>
          <p className="text-red-600 mb-2">Failed to load villages</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-primary hover:text-primary/80 underline"
            >
              Retry
            </button>
          )}
        </div>
      </td>
    </tr>
  )

  const renderEmptyRow = () => (
    <tr>
      <td colSpan={4} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center">
          <span className="material-icons-outlined text-4xl text-gray-400 mb-2">
            holiday_village
          </span>
          <p className="text-gray-600 mb-2">No villages created yet.</p>
          <button className="text-primary hover:text-primary/80 underline">
            Create New Village
          </button>
        </div>
      </td>
    </tr>
  )

  const renderVillageRows = () => {
    if (!villages || villages.length === 0) {
      return renderEmptyRow()
    }

    return villages.map((village) => {
      const villageName = village.name || 'Unknown Village'
      const location = 'N/A' // Villages table doesn't have location in current schema
      const statusCode = village.status?.code || 'unknown'
      const statusName = village.status?.name || 'Unknown Status'
      const colorCode = village.status?.color_code

      return (
        <tr key={village.id}>
          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
            {villageName}
          </td>
          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
            {location}
          </td>
          <td className="whitespace-nowrap px-6 py-4 text-sm">
            {getStatusBadge(statusCode, statusName, colorCode)}
          </td>
          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
            {formatDate(village.created_at)}
          </td>
        </tr>
      )
    })
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-900">Recently Created Villages</h2>
      <div className="mt-4 overflow-hidden rounded-lg border border-primary/20">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-primary/20">
            <thead className="bg-background">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  scope="col"
                >
                  Name
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  scope="col"
                >
                  Location
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  scope="col"
                >
                  Status
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  scope="col"
                >
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/20 bg-white">
              {loading && renderLoadingRows()}
              {error && !loading && renderErrorRow()}
              {!loading && !error && renderVillageRows()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
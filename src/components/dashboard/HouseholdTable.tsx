'use client'

import { Household } from '@/types/dashboard'

interface HouseholdTableProps {
  households: Household[] | null
  loading: boolean
  error: Error | null
  onRetry?: () => void
}

export function HouseholdTable({ households, loading, error, onRetry }: HouseholdTableProps) {
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
    } else if (statusCode === 'pending_approval') {
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
          <p className="text-red-600 mb-2">Failed to load tenants</p>
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
            home_off
          </span>
          <p className="text-gray-600 mb-2">No households created yet.</p>
          <button className="text-primary hover:text-primary/80 underline">
            Create First Household
          </button>
        </div>
      </td>
    </tr>
  )

  const renderHouseholdRows = () => {
    if (!households || households.length === 0) {
      return renderEmptyRow()
    }

    return households.map((household) => {
      const householdName = household.household_head
        ? `${household.household_head.first_name} ${household.household_head.last_name}`
        : 'Unknown Head'

      const villageName = household.village?.name || 'Unknown Village'

      const statusCode = household.status?.code || 'unknown'
      const statusName = household.status?.name || 'Unknown Status'
      const colorCode = household.status?.color_code

      return (
        <tr key={household.id}>
          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
            {householdName}
          </td>
          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
            {villageName}
          </td>
          <td className="whitespace-nowrap px-6 py-4 text-sm">
            {getStatusBadge(statusCode, statusName, colorCode)}
          </td>
          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
            {formatDate(household.created_at)}
          </td>
        </tr>
      )
    })
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-900">Recently Created Households</h2>
      <div className="mt-4 overflow-hidden rounded-lg border border-primary/20">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-primary/20">
            <thead className="bg-background">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  scope="col"
                >
                  Household Head
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  scope="col"
                >
                  Village
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
              {!loading && !error && renderHouseholdRows()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
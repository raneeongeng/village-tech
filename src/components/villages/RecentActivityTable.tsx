'use client'

import { useState, useEffect } from 'react'

interface ActivityLog {
  id: string
  action: string
  performedBy: string
  timestamp: string
}

interface RecentActivityTableProps {
  villageId: string
}

export function RecentActivityTable({ villageId }: RecentActivityTableProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading mock data for now
    // In the future, this would fetch from an actual activity log table
    const mockActivities: ActivityLog[] = [
      {
        id: '1',
        action: 'Village Created',
        performedBy: 'System',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
      },
      {
        id: '2',
        action: 'Admin Head Assigned',
        performedBy: 'Super Admin',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
      },
      {
        id: '3',
        action: 'Village Settings Updated',
        performedBy: 'Admin Head',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      },
      {
        id: '4',
        action: 'New User Registered',
        performedBy: 'Admin Head',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      }
    ]

    // Simulate network delay
    setTimeout(() => {
      setActivities(mockActivities)
      setLoading(false)
    }, 1000)
  }, [villageId])

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Performed By</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr key={i} className="bg-white border-b animate-pulse">
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <span className="material-icons-outlined text-4xl text-gray-400">history</span>
          <p className="mt-2 text-gray-600">No recent activity</p>
          <p className="mt-1 text-sm text-gray-500">
            Activity logs will appear here as actions are performed on this village.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Performed By</th>
              <th className="px-4 py-3">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-4 py-4 font-medium text-gray-900">
                  {activity.action}
                </td>
                <td className="px-4 py-4">
                  {activity.performedBy}
                </td>
                <td className="px-4 py-4">
                  {formatDateTime(activity.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show limited results note */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Showing recent 10 activities.
          <button className="ml-1 text-primary hover:underline">
            View all activity
          </button>
        </p>
      </div>
    </div>
  )
}
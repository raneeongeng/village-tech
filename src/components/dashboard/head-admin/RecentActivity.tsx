'use client'

import { Activity } from '@/hooks/useHeadAdminDashboard'

interface RecentActivityProps {
  activities: Activity[]
  loading?: boolean
  error?: Error | null
}

// Utility function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function RecentActivity({ activities, loading = false, error }: RecentActivityProps) {
  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-4xl text-red-400 mb-2">error</span>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">history</span>
          <p className="text-gray-600">No recent activity to display</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h3>

      <div className="space-y-4">
        {activities.slice(0, 4).map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBackgroundColor(activity.type)}`}>
              <span className={`material-symbols-outlined text-sm ${activity.color}`}>
                {activity.icon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 leading-relaxed">
                {activity.message}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatRelativeTime(new Date(activity.timestamp))}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Helper function to get background color for activity icons
function getIconBackgroundColor(type: Activity['type']): string {
  switch (type) {
    case 'payment':
      return 'bg-green-100'
    case 'application':
      return 'bg-primary/10'
    case 'announcement':
      return 'bg-blue-100'
    case 'security':
      return 'bg-red-100'
    default:
      return 'bg-gray-100'
  }
}
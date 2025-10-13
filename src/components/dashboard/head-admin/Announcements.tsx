'use client'

import { Announcement } from '@/hooks/useHeadAdminDashboard'

interface AnnouncementsProps {
  announcements: Announcement[]
  loading?: boolean
  error?: Error | null
}

// Utility function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  // Format as "Posted: Oct 26, 2023"
  return `Posted: ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

// Utility function to truncate content
function truncateContent(content: string, maxLength: number = 50): string {
  if (content.length <= maxLength) return content
  return content.slice(0, maxLength) + '...'
}

export function Announcements({ announcements, loading = false, error }: AnnouncementsProps) {
  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Announcements</h3>
          <button className="text-sm text-primary hover:text-primary/80">View All</button>
        </div>
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
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="border-b border-gray-100 pb-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!announcements || announcements.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Announcements</h3>
          <button className="text-sm text-primary hover:text-primary/80">View All</button>
        </div>
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">campaign</span>
          <p className="text-gray-600 mb-2">No announcements yet</p>
          <button
            onClick={() => console.log('Navigate to create announcement')}
            className="text-sm text-primary hover:text-primary/80"
          >
            Create your first announcement
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Announcements</h3>
        <button
          onClick={() => console.log('Navigate to view all announcements')}
          className="text-sm text-primary hover:text-primary/80"
        >
          View All
        </button>
      </div>

      <div className="space-y-4">
        {announcements.slice(0, 3).map((announcement, index) => (
          <div
            key={announcement.id}
            className={`${
              index < announcements.length - 1 ? 'border-b border-gray-100 pb-4' : ''
            }`}
          >
            <h4 className="font-semibold text-gray-800 mb-1">
              {announcement.title}
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              {truncateContent(announcement.content)}
            </p>
            <p className="text-xs text-gray-500">
              {formatRelativeTime(new Date(announcement.created_at))}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
'use client'

import { HouseholdStatus } from '@/types/household'

interface HouseholdStatusBadgeProps {
  status?: HouseholdStatus
  className?: string
}

export function HouseholdStatusBadge({ status, className = '' }: HouseholdStatusBadgeProps) {
  if (!status) {
    return (
      <span className={`px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full ${className}`}>
        Unknown
      </span>
    )
  }

  // Determine badge color based on status code
  let bgColor = 'bg-gray-100'
  let textColor = 'text-gray-800'
  let icon = 'help'

  switch (status.code) {
    case 'active':
      bgColor = 'bg-green-100'
      textColor = 'text-green-800'
      icon = 'check_circle'
      break
    case 'inactive':
      bgColor = 'bg-red-100'
      textColor = 'text-red-800'
      icon = 'cancel'
      break
    case 'pending_approval':
      bgColor = 'bg-yellow-100'
      textColor = 'text-yellow-800'
      icon = 'pending'
      break
    default:
      bgColor = 'bg-gray-100'
      textColor = 'text-gray-800'
      icon = 'help'
  }

  // Use custom color from database if available
  if (status.color_code) {
    // Simple hex color override - in a real app you might want more sophisticated color handling
    const customColorStyle = {
      backgroundColor: `${status.color_code}20`, // 20% opacity
      color: status.color_code,
      borderColor: status.color_code,
    }

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full border inline-flex items-center gap-1 ${className}`}
        style={customColorStyle}
      >
        <span className="material-icons-outlined text-xs">{icon}</span>
        {status.name}
      </span>
    )
  }

  return (
    <span className={`px-2 py-1 text-xs font-semibold ${bgColor} ${textColor} rounded-full inline-flex items-center gap-1 ${className}`}>
      <span className="material-icons-outlined text-xs">{icon}</span>
      {status.name}
    </span>
  )
}
import React from 'react'

export type StickerStatus = 'active' | 'expired' | 'revoked' | 'pending'

interface StickerStatusBadgeProps {
  status: StickerStatus
  className?: string
}

const statusConfig = {
  active: {
    label: 'Active',
    icon: '✓',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  expired: {
    label: 'Expired',
    icon: '⏰',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
  },
  revoked: {
    label: 'Revoked',
    icon: '✕',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
  pending: {
    label: 'Pending',
    icon: '⏳',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
  },
}

export function StickerStatusBadge({ status, className = '' }: StickerStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${className}
      `}
    >
      <span className="text-sm" aria-hidden="true">
        {config.icon}
      </span>
      {config.label}
    </span>
  )
}
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
    bgColor: 'bg-primary/10',
    textColor: 'text-primary',
    borderColor: 'border-primary/20',
  },
  expired: {
    label: 'Expired',
    icon: '⏰',
    bgColor: 'bg-accent/10',
    textColor: 'text-accent',
    borderColor: 'border-accent/20',
  },
  revoked: {
    label: 'Revoked',
    icon: '✕',
    bgColor: 'bg-accent/10',
    textColor: 'text-accent',
    borderColor: 'border-accent/20',
  },
  pending: {
    label: 'Pending',
    icon: '⏳',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
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
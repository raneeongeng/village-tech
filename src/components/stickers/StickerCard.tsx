import React from 'react'
import { StickerStatusBadge, type StickerStatus } from './StickerStatusBadge'

export interface StickerItem {
  id: string
  plateNumber: string
  stickerCode: string | null
  issuedAt: string | null
  expiresAt: string | null
  status: StickerStatus
  vehicleInfo?: {
    make: string
    model: string
    color: string
    type: string
  }
}

interface StickerCardProps {
  sticker: StickerItem
  onRenew?: (stickerId: string) => void
  className?: string
}

export function StickerCard({ sticker, onRenew, className = '' }: StickerCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const canRenew = sticker.status === 'expired' || sticker.status === 'active'
  const isPending = sticker.status === 'pending'

  // Adaptive content based on sticker type
  const isPeopleSticker = sticker.vehicleInfo?.type === 'people_sticker' || sticker.vehicleInfo?.type === 'people'

  const getCardTitle = () => {
    if (isPeopleSticker) {
      // For people stickers: member name
      return sticker.vehicleInfo?.model || sticker.plateNumber || 'Unknown Person'
    } else {
      // For vehicle stickers: vehicle make/model
      return sticker.vehicleInfo ? `${sticker.vehicleInfo.make} ${sticker.vehicleInfo.model}` : sticker.plateNumber
    }
  }

  const getCardSubtitle = () => {
    if (isPeopleSticker) {
      // For people stickers: relationship/role
      return sticker.vehicleInfo?.make || 'Household Member'
    } else {
      // For vehicle stickers: plate number
      return sticker.plateNumber || 'Vehicle'
    }
  }

  return (
    <div className={`bg-white rounded-2xl shadow-soft p-6 flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xl font-bold text-gray-800">{getCardTitle()}</p>
            <p className="text-sm text-gray-500 mt-1">{getCardSubtitle()}</p>
          </div>
          <StickerStatusBadge status={sticker.status} />
        </div>

        <div className="space-y-4 text-sm text-gray-600">
          <p className="font-mono text-gray-500">{sticker.stickerCode || 'N/A'}</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
            <p>Issued At: <span className="font-medium text-gray-900">{formatDate(sticker.issuedAt)}</span></p>
            <p>Expires At: <span className="font-medium text-gray-900">{formatDate(sticker.expiresAt)}</span></p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        {canRenew && onRenew ? (
          <button
            onClick={() => onRenew(sticker.id)}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Renew Sticker
          </button>
        ) : (
          <button
            disabled
            className="text-sm font-medium text-gray-400 cursor-not-allowed"
          >
            {isPending ? 'Pending...' : 'Renew Sticker'}
          </button>
        )}
      </div>
    </div>
  )
}
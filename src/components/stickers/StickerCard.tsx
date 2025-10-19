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
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const canRenew = sticker.status === 'expired' || sticker.status === 'active'
  const isPending = sticker.status === 'pending'

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 items-center">
          {/* Plate Number */}
          <div className="col-span-2 sm:col-span-1 md:col-span-1">
            <p className="text-sm text-gray-500 mb-1">Plate Number</p>
            <p className="font-semibold text-lg text-text">{sticker.plateNumber}</p>
            {sticker.vehicleInfo && (
              <p className="text-xs text-gray-400 mt-1">
                {sticker.vehicleInfo.make} {sticker.vehicleInfo.model}
              </p>
            )}
          </div>

          {/* Sticker Code */}
          <div className="col-span-2 sm:col-span-1 md:col-span-1">
            <p className="text-sm text-gray-500 mb-1">Sticker Code</p>
            <p className="font-mono text-base text-text">
              {sticker.stickerCode || 'N/A'}
            </p>
          </div>

          {/* Issued At - Hidden on small screens */}
          <div className="hidden md:block">
            <p className="text-sm text-gray-500 mb-1">Issued At</p>
            <p className="text-base text-text">{formatDate(sticker.issuedAt)}</p>
          </div>

          {/* Expires At - Hidden on small screens */}
          <div className="hidden md:block">
            <p className="text-sm text-gray-500 mb-1">Expires At</p>
            <p className="text-base text-text">{formatDate(sticker.expiresAt)}</p>
          </div>

          {/* Status */}
          <div className="col-span-1 self-center">
            <p className="text-sm text-gray-500 md:hidden mb-1">Status</p>
            <StickerStatusBadge status={sticker.status} />
          </div>

          {/* Actions */}
          <div className="col-span-1 flex justify-end">
            {canRenew && onRenew ? (
              <button
                onClick={() => onRenew(sticker.id)}
                className="text-primary font-semibold text-sm hover:underline transition-colors"
              >
                Renew Sticker
              </button>
            ) : (
              <button
                disabled
                className="text-gray-400 text-sm cursor-not-allowed"
              >
                {isPending ? 'Pending...' : 'Renew Sticker'}
              </button>
            )}
          </div>
        </div>

        {/* Mobile-only: Show dates on small screens */}
        <div className="md:hidden mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Issued At</p>
              <p className="text-text">{formatDate(sticker.issuedAt)}</p>
            </div>
            <div>
              <p className="text-gray-500">Expires At</p>
              <p className="text-text">{formatDate(sticker.expiresAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
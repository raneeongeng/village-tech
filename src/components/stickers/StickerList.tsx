'use client'

import React, { useState, useEffect } from 'react'
import { StickerCard, type StickerItem } from './StickerCard'
import { StickerRequestModal } from './StickerRequestModal'
import { PeopleStickerRequestModal } from './PeopleStickerRequestModal'
import { PrintAllModal } from './PrintAllModal'
import { useAuth } from '@/hooks/useAuth'
import { useTenant } from '@/hooks/useTenant'
import { getCachedHouseholdInfo } from '@/lib/auth'
import { supabase } from '@/lib/supabase/client'

interface StickerListProps {
  onRequestSuccess?: () => void
  onRequestError?: (error: string) => void
}

export function StickerList({ onRequestSuccess, onRequestError }: StickerListProps) {
  const { user } = useAuth()
  const { tenant } = useTenant()
  const [stickers, setStickers] = useState<StickerItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isVehicleStickerModalOpen, setIsVehicleStickerModalOpen] = useState(false)
  const [isPeopleStickerModalOpen, setIsPeopleStickerModalOpen] = useState(false)
  const [isPrintAllModalOpen, setIsPrintAllModalOpen] = useState(false)

  // Load household's stickers
  useEffect(() => {
    const loadStickers = async () => {
      if (!user?.id || !tenant?.id) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Get the user's household ID from session storage
        const householdInfo = getCachedHouseholdInfo()
        if (!householdInfo?.id) {
          setStickers([])
          setError('You are not assigned to a household yet.')
          setIsLoading(false)
          return
        }

        // Fetch real stickers using direct Supabase RPC call
        const { data: apiStickers, error: rpcError } = await supabase.rpc('get_household_stickers', {
          p_tenant_id: tenant.id,
          p_household_id: householdInfo.id
        })

        if (rpcError) {
          throw new Error(`Failed to fetch stickers: ${rpcError.message}`)
        }

        // Transform RPC data to match StickerItem interface
        const transformedStickers: StickerItem[] = (apiStickers || []).map((sticker: any) => {
          const isPeopleSticker = sticker.sticker_type === 'People Sticker'

          return {
            id: sticker.id,
            plateNumber: isPeopleSticker
              ? sticker.member_name || 'N/A'
              : sticker.sticker_data?.vehicle_info?.plate || 'N/A',
            stickerCode: sticker.sticker_code,
            issuedAt: sticker.issued_at,
            expiresAt: sticker.expires_at,
            status: sticker.status_name?.toLowerCase() || 'unknown',
            vehicleInfo: {
              make: isPeopleSticker
                ? sticker.sticker_data?.relationship || 'Person'
                : sticker.sticker_data?.vehicle_info?.make || 'Unknown',
              model: isPeopleSticker
                ? sticker.sticker_data?.member_name || 'Unknown'
                : sticker.sticker_data?.vehicle_info?.model || 'Unknown',
              color: isPeopleSticker
                ? 'N/A'
                : sticker.sticker_data?.vehicle_info?.color || 'Unknown',
              type: sticker.sticker_type?.toLowerCase().replace(' ', '_') || 'vehicle'
            }
          }
        })

        setStickers(transformedStickers)
        setError(null)
      } catch (err) {
        console.error('Failed to load stickers:', err)
        setError('Failed to load your stickers. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadStickers()
  }, [user?.id, tenant?.id])

  const handleRenew = (stickerId: string) => {
    // This would handle renewing a sticker
    console.log('Renewing sticker:', stickerId)
    // For now, just show an alert
    alert('Sticker renewal functionality coming soon!')
  }

  const handleVehicleStickerSuccess = () => {
    setIsVehicleStickerModalOpen(false)
    onRequestSuccess?.()
  }

  const handlePeopleStickerSuccess = () => {
    setIsPeopleStickerModalOpen(false)
    onRequestSuccess?.()
  }

  const handlePrintAll = () => {
    setIsPrintAllModalOpen(true)
  }

  // Check if there are issued stickers (stickers with codes)
  const issuedStickers = stickers.filter(sticker =>
    sticker.stickerCode && sticker.stickerCode !== 'N/A'
  )
  const hasIssuedStickers = issuedStickers.length > 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your stickers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.134 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Sticker Requests</h1>
          <p className="mt-2 text-lg text-gray-600">Request vehicle or people stickers for your household.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          {hasIssuedStickers && (
            <button
              onClick={handlePrintAll}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-primary border-2 border-primary font-bold shadow-soft hover:bg-primary hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print All Stickers
            </button>
          )}
          <button
            onClick={() => setIsPeopleStickerModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-bold shadow-soft hover:bg-primary/90 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Request Sticker
          </button>
        </div>
      </header>

      {/* Stickers List */}
      {stickers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stickers yet</h3>
          <p className="text-gray-600 mb-6">Request vehicle stickers or people stickers for your household.</p>

          <div className="flex justify-center">
            <button
              onClick={() => setIsPeopleStickerModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Request Sticker
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stickers.map((sticker) => (
            <StickerCard
              key={sticker.id}
              sticker={sticker}
              onRenew={handleRenew}
            />
          ))}
        </div>
      )}

      {/* Request Modals */}
      <PeopleStickerRequestModal
        isOpen={isPeopleStickerModalOpen}
        onClose={() => setIsPeopleStickerModalOpen(false)}
        onSuccess={handlePeopleStickerSuccess}
        onError={onRequestError}
        onSwitchToVehicle={() => {
          setIsPeopleStickerModalOpen(false)
          setIsVehicleStickerModalOpen(true)
        }}
      />

      <StickerRequestModal
        isOpen={isVehicleStickerModalOpen}
        onClose={() => setIsVehicleStickerModalOpen(false)}
        onSuccess={handleVehicleStickerSuccess}
        onError={onRequestError}
        onSwitchToPeople={() => {
          setIsVehicleStickerModalOpen(false)
          setIsPeopleStickerModalOpen(true)
        }}
      />

      {/* Print All Modal */}
      <PrintAllModal
        isOpen={isPrintAllModalOpen}
        onClose={() => setIsPrintAllModalOpen(false)}
        stickers={stickers}
      />
    </div>
  )
}
'use client'

import React, { useState, useEffect } from 'react'
import { StickerCard, type StickerItem } from './StickerCard'
import { StickerRequestModal } from './StickerRequestModal'
import { PeopleStickerRequestModal } from './PeopleStickerRequestModal'
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
        const transformedStickers: StickerItem[] = (apiStickers || []).map((sticker: any) => ({
          id: sticker.id,
          plateNumber: sticker.sticker_type === 'People Sticker'
            ? sticker.member_name || 'N/A'
            : sticker.sticker_data?.plate || sticker.sticker_data?.vehicle_plate || 'N/A',
          stickerCode: sticker.sticker_code,
          issuedAt: sticker.issued_at,
          expiresAt: sticker.expires_at,
          status: sticker.status_name?.toLowerCase() || 'unknown',
          vehicleInfo: {
            make: sticker.sticker_type === 'People Sticker'
              ? sticker.sticker_data?.relationship || 'Person'
              : sticker.sticker_data?.make || sticker.sticker_data?.vehicle_make || 'Unknown',
            model: sticker.sticker_type === 'People Sticker'
              ? sticker.sticker_data?.member_name || 'Unknown'
              : sticker.sticker_data?.model || sticker.sticker_data?.vehicle_model || 'Unknown',
            color: sticker.sticker_type === 'People Sticker'
              ? 'N/A'
              : sticker.sticker_data?.color || sticker.sticker_data?.vehicle_color || 'Unknown',
            type: sticker.sticker_type?.toLowerCase() || 'vehicle'
          }
        }))

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text">Sticker Requests</h2>
          <p className="text-gray-600 mt-1">Request vehicle stickers or people stickers for your household</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setIsVehicleStickerModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-700 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span>Vehicle Sticker</span>
          </button>
          <button
            onClick={() => setIsPeopleStickerModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold shadow-sm hover:bg-green-700 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>People Stickers</span>
          </button>
        </div>
      </div>

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

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setIsVehicleStickerModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Request Vehicle Sticker
            </button>
            <button
              onClick={() => setIsPeopleStickerModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Request People Stickers
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
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
      <StickerRequestModal
        isOpen={isVehicleStickerModalOpen}
        onClose={() => setIsVehicleStickerModalOpen(false)}
        onSuccess={handleVehicleStickerSuccess}
        onError={onRequestError}
      />

      <PeopleStickerRequestModal
        isOpen={isPeopleStickerModalOpen}
        onClose={() => setIsPeopleStickerModalOpen(false)}
        onSuccess={handlePeopleStickerSuccess}
        onError={onRequestError}
      />
    </div>
  )
}
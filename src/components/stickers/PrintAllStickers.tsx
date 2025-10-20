'use client'

import React from 'react'
import { StickerItem } from './StickerCard'

interface PrintAllStickersProps {
  stickers: StickerItem[]
}

// Simple QR code-style visual using CSS (for demonstration)
interface QRCodeProps {
  value: string
  displayText?: string
}

function QRCode({ value, displayText }: QRCodeProps) {
  // Use QR Server API to generate real scannable QR codes
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(value)}`

  return (
    <div className="qr-container">
      <div className="qr-code bg-white p-2 border print:p-1 print:border-black flex justify-center items-center">
        <img
          src={qrCodeUrl}
          alt="QR Code"
          className="w-[140px] h-[140px] print:w-[120px] print:h-[120px]"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
      <div className="qr-text text-center text-xs font-mono mt-1 text-black print:text-[10px] print:mt-0">
        {displayText || value}
      </div>
    </div>
  )
}

export function PrintAllStickers({ stickers }: PrintAllStickersProps) {
  // Filter only issued stickers (those with sticker codes)
  const issuedStickers = stickers.filter(sticker =>
    sticker.stickerCode && sticker.stickerCode !== 'N/A'
  )

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStickerType = (sticker: StickerItem) => {
    const isPeopleSticker = sticker.vehicleInfo?.type === 'people_sticker' || sticker.vehicleInfo?.type === 'people'
    return isPeopleSticker ? 'People Sticker' : 'Vehicle Sticker'
  }

  const getStickerName = (sticker: StickerItem) => {
    const isPeopleSticker = sticker.vehicleInfo?.type === 'people_sticker' || sticker.vehicleInfo?.type === 'people'
    if (isPeopleSticker) {
      return sticker.vehicleInfo?.model || sticker.plateNumber || 'Unknown Person'
    } else {
      return sticker.vehicleInfo ? `${sticker.vehicleInfo.make} ${sticker.vehicleInfo.model}` : sticker.plateNumber
    }
  }

  return (
    <>
      {/* Screen-only header */}
      <div className="print:hidden mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Print Preview</h2>
        <p className="text-gray-600">
          {issuedStickers.length} sticker{issuedStickers.length !== 1 ? 's' : ''} ready to print
        </p>
      </div>

      {/* Printable content */}
      <div className="w-full max-w-4xl mx-auto bg-white print:max-w-none print:mx-0 print:p-0">
        {/* Print header */}
        <div className="text-center mb-6 pb-3 border-b-2 border-black print:mb-4 print:pb-2">
          <h1 className="text-2xl font-bold text-black mb-1 print:text-xl print:mb-0">Village Stickers</h1>
          <p className="text-sm text-gray-600 print:text-xs">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        {/* Stickers grid */}
        <div className="grid grid-cols-2 gap-4 print:grid-cols-3 print:gap-2">
          {issuedStickers.map((sticker, index) => {
            // Generate comprehensive QR code data
            const qrData = {
              code: sticker.stickerCode || '',
              type: getStickerType(sticker),
              name: getStickerName(sticker),
              expires: formatDate(sticker.expiresAt),
              issued: formatDate(sticker.issuedAt),
              status: sticker.status || 'active'
            }

            return (
            <div key={sticker.id} className="border border-gray-300 rounded-lg p-4 print:p-2 print:rounded-md text-center bg-white min-h-[200px] print:min-h-[160px] flex flex-col justify-between print:border-2 print:border-black">
              <div className="flex justify-center items-center mb-3 print:mb-2">
                <QRCode value={JSON.stringify(qrData)} displayText={sticker.stickerCode || ''} />
              </div>

              <div className="text-xs print:text-[10px] space-y-1 print:space-y-0">
                <div className="font-bold text-sm print:text-[11px] text-black font-mono print:mb-1">{sticker.stickerCode}</div>
                <div className="font-semibold text-gray-800 print:text-black print:text-[10px]">{getStickerType(sticker)}</div>
                <div className="text-gray-600 font-medium print:text-black print:text-[9px]">{getStickerName(sticker)}</div>
                <div className="text-gray-500 text-[11px] print:text-[8px] print:text-black">Expires: {formatDate(sticker.expiresAt)}</div>
              </div>
            </div>
            )
          })}
        </div>
      </div>

    </>
  )
}
'use client'

import React, { useEffect } from 'react'
import { StickerItem } from './StickerCard'
import { PrintAllStickers } from './PrintAllStickers'

interface PrintAllModalProps {
  isOpen: boolean
  onClose: () => void
  stickers: StickerItem[]
  requestId?: string
  onPrintComplete?: (requestId: string) => Promise<void>
}

export function PrintAllModal({ isOpen, onClose, stickers, requestId, onPrintComplete }: PrintAllModalProps) {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const generatePrintWindow = () => {
    // Generate HTML content for printing
    const printContent = issuedStickers.map((sticker, index) => {
      const isPeopleSticker = sticker.vehicleInfo?.type === 'people_sticker' || sticker.vehicleInfo?.type === 'people'
      const stickerType = isPeopleSticker ? 'People Sticker' : 'Vehicle Sticker'
      const stickerName = isPeopleSticker
        ? sticker.vehicleInfo?.model || sticker.plateNumber || 'Unknown Person'
        : sticker.vehicleInfo ? `${sticker.vehicleInfo.make} ${sticker.vehicleInfo.model}` : sticker.plateNumber

      const expiryDate = sticker.expiresAt
        ? new Date(sticker.expiresAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : '-'

      // Generate comprehensive QR code data
      const qrData = {
        code: sticker.stickerCode || '',
        type: stickerType,
        name: stickerName,
        expires: expiryDate,
        issued: new Date(sticker.issuedAt || '').toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }) || '-',
        status: sticker.status || 'active'
      }

      // Use QR Server API to generate real scannable QR codes
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify(qrData))}`

      return `
        <div class="sticker-page" style="page-break-after: always; page-break-inside: avoid; width: 100%; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px; box-sizing: border-box;">
          <div style="border: 3px solid black; border-radius: 8px; padding: 30px; text-align: center; background: white; max-width: 400px; width: 100%;">
            <!-- QR Code -->
            <div style="margin-bottom: 20px;">
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: white; padding: 8px; border: 2px solid black; margin-bottom: 8px; width: fit-content; margin-left: auto; margin-right: auto;">
                <img src="${qrCodeUrl}" alt="QR Code" style="width: 150px; height: 150px; image-rendering: pixelated;" />
              </div>
              <div style="text-align: center; font-size: 12px; font-family: monospace; color: black; font-weight: bold;">
                ${qrData.code}
              </div>
            </div>

            <!-- Sticker Info -->
            <div style="space-y: 8px;">
              <div style="font-weight: bold; font-size: 16px; color: black; margin-bottom: 8px;">${sticker.stickerCode}</div>
              <div style="font-weight: 600; color: black; font-size: 14px; margin-bottom: 6px;">${stickerType}</div>
              <div style="color: black; font-weight: 500; font-size: 13px; margin-bottom: 6px;">${stickerName}</div>
              <div style="color: black; font-size: 11px;">Expires: ${expiryDate}</div>
            </div>
          </div>

          <!-- Village Header -->
          <div style="position: absolute; top: 40px; left: 50%; transform: translateX(-50%); text-align: center;">
            <h1 style="font-size: 24px; font-weight: bold; color: black; margin: 0; margin-bottom: 4px;">Village Stickers</h1>
            <p style="font-size: 12px; color: black; margin: 0;">Generated on ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
      `
    }).join('')

    // Create the full HTML document
    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Village Stickers - Print</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            @page {
              margin: 0.5in;
              size: auto;
            }

            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: white;
              color: black;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
              print-color-adjust: exact;
            }

            .sticker-page:last-child {
              page-break-after: avoid;
            }

            @media print {
              body {
                margin: 0;
                padding: 0;
              }

              .sticker-page {
                page-break-after: always;
                page-break-inside: avoid;
              }

              .sticker-page:last-child {
                page-break-after: avoid;
              }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `

    // Open new window and print
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(printHtml)
      printWindow.document.close()

      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 500)
      }
    } else {
      // Fallback if popup is blocked
      alert('Please allow popups for this site to print stickers. You can also try using the browser print function.')
    }
  }

  const handlePrint = () => {
    generatePrintWindow()
  }

  const handlePrintAndComplete = async () => {
    // Execute print functionality
    generatePrintWindow()

    // Update status if this is from a request management context
    if (requestId && onPrintComplete) {
      try {
        await onPrintComplete(requestId)
        onClose() // Close modal on success
      } catch (error) {
        console.error('Failed to update status:', error)
        // Keep modal open on error
      }
    } else {
      onClose() // Close modal for regular print (household stickers)
    }
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  // Filter only issued stickers
  const issuedStickers = stickers.filter(sticker =>
    sticker.stickerCode && sticker.stickerCode !== 'N/A'
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto print-modal-container">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity no-print"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="no-print flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Print All Stickers</h2>
              <p className="mt-1 text-sm text-gray-500">
                {issuedStickers.length} sticker{issuedStickers.length !== 1 ? 's' : ''} ready to print
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
            {issuedStickers.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No stickers to print</h3>
                <p className="text-gray-600">
                  You don&apos;t have any issued stickers yet. Request some stickers first.
                </p>
              </div>
            ) : (
              <div className="p-6 print-content">
                <PrintAllStickers stickers={stickers} />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="no-print flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              Tip: Each sticker will be printed on a separate page with QR codes
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePrintAndComplete}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Print Stickers
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Hide non-print elements during printing */
        @media print {
          /* Hide the entire page body */
          body {
            visibility: hidden !important;
          }

          /* Hide all elements */
          body * {
            visibility: hidden !important;
          }

          /* Show only the print modal and its content */
          .print-modal-container {
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: white !important;
            z-index: 999999 !important;
          }

          .print-modal-container * {
            visibility: visible !important;
          }

          /* Hide modal UI elements */
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }

          /* Style the print content */
          .print-content {
            margin: 0 !important;
            padding: 20px !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }

          /* Remove modal specific styling */
          .print-modal-container .fixed {
            position: static !important;
            background: white !important;
          }

          .print-modal-container .relative {
            position: static !important;
          }

          .print-modal-container .bg-white {
            background: white !important;
          }

          .print-modal-container .rounded-lg {
            border-radius: 0 !important;
          }

          .print-modal-container .shadow-xl {
            box-shadow: none !important;
          }

          .print-modal-container .max-w-6xl {
            max-width: none !important;
          }

          .print-modal-container .max-h-\\[90vh\\] {
            max-height: none !important;
          }

          .print-modal-container .overflow-hidden {
            overflow: visible !important;
          }

          .print-modal-container .overflow-y-auto {
            overflow: visible !important;
          }

          .print-modal-container .max-h-\\[calc\\(90vh-100px\\)\\] {
            max-height: none !important;
          }

          /* Ensure proper page margins */
          @page {
            margin: 0.5in;
            size: auto;
          }

          /* Ensure colors print correctly */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide page elements that might interfere */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  )
}
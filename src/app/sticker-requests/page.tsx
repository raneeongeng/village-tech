import ComingSoon from '@/components/common/ComingSoon'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sticker Requests - VillageManager',
  description: 'Vehicle sticker request management feature coming soon',
}

export default function StickerRequestsPage() {
  return (
    <ComingSoon
      featureName="Sticker Requests"
      description="Manage vehicle sticker requests and applications. Process new sticker requests, handle renewals, and track sticker inventory."
      icon="local_offer"
      estimatedDate="Q1 2025"
    />
  )
}
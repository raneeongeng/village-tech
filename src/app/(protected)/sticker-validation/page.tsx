import ComingSoon from '@/components/common/ComingSoon'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sticker Validation - VillageManager',
  description: 'Vehicle sticker validation feature coming soon',
}

export default function StickerValidationPage() {
  return (
    <ComingSoon
      featureName="Sticker Validation"
      description="Validate vehicle stickers and access permissions. Scan and verify vehicle stickers to ensure authorized access to the community."
      icon="verified_user"
      estimatedDate="Q1 2025"
    />
  )
}
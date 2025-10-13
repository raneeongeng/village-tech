import ComingSoon from '@/components/common/ComingSoon'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Guest Registration - VillageManager',
  description: 'Guest registration feature coming soon',
}

export default function GuestRegistrationPage() {
  return (
    <ComingSoon
      featureName="Guest Registration"
      description="Register guests and visitors at the security checkpoint. Process visitor information and generate temporary access credentials."
      icon="how_to_reg"
      estimatedDate="Q1 2025"
    />
  )
}
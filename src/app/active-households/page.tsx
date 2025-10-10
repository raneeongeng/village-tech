import ComingSoon from '@/components/common/ComingSoon'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Active Households - VillageManager',
  description: 'Active household management feature coming soon',
}

export default function ActiveHouseholdsPage() {
  return (
    <ComingSoon
      featureName="Active Households"
      description="Manage active household records and information. View, edit, and maintain comprehensive household data with member management capabilities."
      icon="home"
      estimatedDate="Q1 2025"
    />
  )
}
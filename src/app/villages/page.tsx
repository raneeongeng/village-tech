import ComingSoon from '@/components/common/ComingSoon'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Village List - VillageManager',
  description: 'Village List feature coming soon',
}

export default function VillageListPage() {
  return (
    <ComingSoon
      featureName="Village List"
      description="Manage villages and tenants across the platform. This comprehensive feature will allow you to create, edit, and oversee all villages in the system."
      icon="holiday_village"
      estimatedDate="Q2 2025"
    />
  )
}
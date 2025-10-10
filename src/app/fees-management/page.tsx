import ComingSoon from '@/components/common/ComingSoon'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fees Management - VillageManager',
  description: 'Fees management feature coming soon',
}

export default function FeesManagementPage() {
  return (
    <ComingSoon
      featureName="Fees Management"
      description="Configure and manage community fees and charges. Set fee structures, manage billing cycles, and handle payment collection workflows."
      icon="request_quote"
      estimatedDate="Q2 2025"
    />
  )
}
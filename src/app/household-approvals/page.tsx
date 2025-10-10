import ComingSoon from '@/components/common/ComingSoon'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Household Approvals - VillageManager',
  description: 'Household approval management feature coming soon',
}

export default function HouseholdApprovalsPage() {
  return (
    <ComingSoon
      featureName="Household Approvals"
      description="Review and approve household applications. Streamline the onboarding process for new residents with comprehensive application management tools."
      icon="approval"
      estimatedDate="Q1 2025"
    />
  )
}
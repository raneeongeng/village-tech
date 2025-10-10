import ComingSoon from '@/components/common/ComingSoon'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Members - VillageManager',
  description: 'Household member management feature coming soon',
}

export default function MembersPage() {
  return (
    <ComingSoon
      featureName="Members"
      description="Manage your household members and their information. Add, edit, and organize family member details and access permissions."
      icon="people"
      estimatedDate="Q1 2025"
    />
  )
}
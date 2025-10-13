import ComingSoon from '@/components/common/ComingSoon'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rules - VillageManager',
  description: 'Community rules management feature coming soon',
}

export default function RulesPage() {
  return (
    <ComingSoon
      featureName="Rules"
      description="Create and manage community rules and regulations. Define policies, set guidelines, and ensure residents stay informed of community standards."
      icon="rule"
      estimatedDate="Q1 2025"
    />
  )
}
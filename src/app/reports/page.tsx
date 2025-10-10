import ComingSoon from '@/components/common/ComingSoon'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reports - VillageManager',
  description: 'Analytics and reports feature coming soon',
}

export default function ReportsPage() {
  return (
    <ComingSoon
      featureName="Reports"
      description="Comprehensive analytics and reporting dashboard. Generate detailed insights, export data, and monitor key performance indicators across all villages."
      icon="assessment"
      estimatedDate="Q3 2025"
    />
  )
}
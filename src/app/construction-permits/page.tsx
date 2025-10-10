import ComingSoon from '@/components/common/ComingSoon'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Construction Permits - VillageManager',
  description: 'Construction permit management feature coming soon',
}

export default function ConstructionPermitsPage() {
  return (
    <ComingSoon
      featureName="Construction Permits"
      description="Manage construction permits and approvals. Handle permit applications, track construction activities, and ensure compliance with community guidelines."
      icon="engineering"
      estimatedDate="Q2 2025"
    />
  )
}
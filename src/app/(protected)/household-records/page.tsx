import ComingSoon from '@/components/common/ComingSoon'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Household Records - VillageManager',
  description: 'Household records management feature coming soon',
}

export default function HouseholdRecordsPage() {
  return (
    <ComingSoon
      featureName="Household Records"
      description="Comprehensive household record management system. Access, update, and maintain detailed household information and member data."
      icon="folder"
      estimatedDate="Q1 2025"
    />
  )
}
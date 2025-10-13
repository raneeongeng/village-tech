import ComingSoon from '@/components/common/ComingSoon'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Visitor Management - VillageManager',
  description: 'Visitor management feature coming soon',
}

export default function VisitorManagementPage() {
  return (
    <ComingSoon
      featureName="Visitor Management"
      description="Manage visitor access and guest registrations. Pre-register visitors, generate guest passes, and track visitor activities."
      icon="person_add"
      estimatedDate="Q1 2025"
    />
  )
}
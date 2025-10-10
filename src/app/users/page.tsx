import ComingSoon from '@/components/common/ComingSoon'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Users - VillageManager',
  description: 'User management feature coming soon',
}

export default function UsersPage() {
  return (
    <ComingSoon
      featureName="Users"
      description="Comprehensive user management system. Create, edit, and manage user accounts, roles, and permissions across all villages in the platform."
      icon="group"
      estimatedDate="Q1 2025"
    />
  )
}
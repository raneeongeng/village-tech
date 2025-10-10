import ComingSoon from '@/components/common/ComingSoon'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Announcements - VillageManager',
  description: 'Community announcements feature coming soon',
}

export default function AnnouncementsPage() {
  return (
    <ComingSoon
      featureName="Announcements"
      description="Create and manage community announcements. Keep residents informed with important updates, events, and community news."
      icon="campaign"
      estimatedDate="Q1 2025"
    />
  )
}
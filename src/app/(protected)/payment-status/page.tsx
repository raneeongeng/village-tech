import ComingSoon from '@/components/common/ComingSoon'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Payment Status - VillageManager',
  description: 'Payment status monitoring feature coming soon',
}

export default function PaymentStatusPage() {
  return (
    <ComingSoon
      featureName="Payment Status"
      description="Monitor payment statuses and track collections. View outstanding payments, generate payment reports, and manage collection activities."
      icon="payment"
      estimatedDate="Q2 2025"
    />
  )
}
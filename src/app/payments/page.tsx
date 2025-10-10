import ComingSoon from '@/components/common/ComingSoon'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Payments - VillageManager',
  description: 'Payment processing feature coming soon',
}

export default function PaymentsPage() {
  return (
    <ComingSoon
      featureName="Payments"
      description="Advanced payment processing and billing system. Handle all financial transactions, fees, and billing across villages with integrated reporting and analytics."
      icon="payment"
      estimatedDate="Q2 2025"
    />
  )
}
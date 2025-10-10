'use client'

import { useEffect } from 'react'
import { useContentView } from '@/hooks/useContentView'

export default function PaymentsPage() {
  const { setActiveView } = useContentView()

  useEffect(() => {
    setActiveView('superadmin-payments')
  }, [setActiveView])

  return null
}
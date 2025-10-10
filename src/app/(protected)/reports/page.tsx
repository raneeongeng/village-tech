'use client'

import { useEffect } from 'react'
import { useContentView } from '@/hooks/useContentView'

export default function ReportsPage() {
  const { setActiveView } = useContentView()

  useEffect(() => {
    setActiveView('reports')
  }, [setActiveView])

  return null
}
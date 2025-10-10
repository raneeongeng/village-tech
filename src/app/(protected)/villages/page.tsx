'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useContentView } from '@/hooks/useContentView'

export default function VillagesPage() {
  const router = useRouter()
  const { setActiveView } = useContentView()

  useEffect(() => {
    // Set the active view to villages for seamless experience
    setActiveView('villages')
  }, [setActiveView])

  // This page acts as a router - the actual content is rendered in dashboard
  // with the content view system. This gives us proper URLs with seamless navigation.
  return null
}
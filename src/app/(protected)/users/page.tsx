'use client'

import { useEffect } from 'react'
import { useContentView } from '@/hooks/useContentView'

export default function UsersPage() {
  const { setActiveView } = useContentView()

  useEffect(() => {
    setActiveView('users')
  }, [setActiveView])

  return null
}
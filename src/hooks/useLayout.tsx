'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface LayoutContextType {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  isMobile: boolean
  showMobileSidebar: boolean
  setShowMobileSidebar: (show: boolean) => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(false)
      setShowMobileSidebar(false)
    }
  }, [isMobile])

  const toggleSidebar = () => {
    if (isMobile) {
      setShowMobileSidebar(!showMobileSidebar)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  const value: LayoutContextType = {
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar,
    isMobile,
    showMobileSidebar,
    setShowMobileSidebar,
  }

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}
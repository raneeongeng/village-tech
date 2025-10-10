'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { getPageTitle, isComingSoonFeature } from '@/lib/navigation/featureNames'

interface ContentViewContextType {
  activeView: string
  setActiveView: (view: string) => void
  pageTitle: string
  isComingSoon: boolean
}

const ContentViewContext = createContext<ContentViewContextType | undefined>(undefined)

export function ContentViewProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveViewState] = useState('dashboard')

  const setActiveView = (view: string) => {
    setActiveViewState(view)
  }

  const pageTitle = getPageTitle(activeView)
  const isComingSoon = isComingSoonFeature(activeView)

  return (
    <ContentViewContext.Provider
      value={{
        activeView,
        setActiveView,
        pageTitle,
        isComingSoon
      }}
    >
      {children}
    </ContentViewContext.Provider>
  )
}

export function useContentView() {
  const context = useContext(ContentViewContext)
  if (context === undefined) {
    throw new Error('useContentView must be used within a ContentViewProvider')
  }
  return context
}
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutProvider, useLayout } from '@/hooks/useLayout'
import { ContentViewProvider } from '@/hooks/useContentView'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { ContentRenderer } from '@/components/layout/ContentRenderer'
import { useAuth } from '@/hooks/useAuth'

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, toggleSidebar, isMobile, showMobileSidebar, setShowMobileSidebar } = useLayout()
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className={`hidden lg:flex transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
          <Sidebar isCollapsed={sidebarCollapsed} />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobile && showMobileSidebar && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black bg-opacity-50"
              onClick={() => setShowMobileSidebar(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-64">
              <Sidebar isCollapsed={false} />
            </div>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <Header
            onMenuClick={toggleSidebar}
            showMenuButton={isMobile}
          />
          <div className="flex-1 overflow-auto">
            <div className="p-4 lg:p-8">
              <ContentRenderer />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LayoutProvider>
      <ContentViewProvider>
        <LayoutContent>{children}</LayoutContent>
      </ContentViewProvider>
    </LayoutProvider>
  )
}
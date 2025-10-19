'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { LayoutProvider, useLayout } from '@/hooks/useLayout'
import { ContentViewProvider, useContentView } from '@/hooks/useContentView'
import { TenantProvider } from '@/hooks/useTenant'
import { LookupProvider } from '@/contexts/LookupContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { ContentRenderer } from '@/components/layout/ContentRenderer'
import { useAuth } from '@/hooks/useAuth'
import { getNavigationForRole } from '@/lib/config/navigation'

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, toggleSidebar, isMobile, showMobileSidebar, setShowMobileSidebar } = useLayout()
  const { user, isLoading, isAuthenticated } = useAuth()
  const { activeView, setActiveView } = useContentView()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Sync activeView with current URL pathname
  useEffect(() => {
    if (!user) return

    const userRole = user.role?.code
    if (!userRole) return

    // Check if this is a specific route that should not sync activeView
    const isSpecificRouteForSync = (
      (pathname.startsWith('/villages/') && pathname !== '/villages') ||
      pathname === '/household-approvals' ||
      pathname === '/active-households' ||
      pathname.startsWith('/households/') ||
      pathname === '/members' ||
      pathname === '/sticker-requests' ||
      pathname === '/admin/stickers'
    )

    // Skip activeView sync for routes handled by specific page components
    if (isSpecificRouteForSync) {
      return
    }

    // Get navigation items for the user's role
    const navigationItems = getNavigationForRole(userRole as any)

    // Find the navigation item that matches the current pathname
    const matchingItem = navigationItems.find(item => item.href === pathname)

    if (matchingItem) {
      // Update activeView to match the current URL
      if (activeView !== matchingItem.id) {
        setActiveView(matchingItem.id)
      }
    } else if (pathname === '/dashboard') {
      // Default to dashboard view for /dashboard path
      if (activeView !== 'dashboard') {
        setActiveView('dashboard')
      }
    }
  }, [pathname, user, activeView, setActiveView])

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

  // Check if this is a specific page route that should render children directly
  const isSpecificRoute = (
    (pathname.startsWith('/villages/') && pathname !== '/villages') ||
    pathname === '/household-approvals' ||
    pathname === '/active-households' ||
    pathname.startsWith('/households/') ||
    pathname === '/members' ||
    pathname === '/sticker-requests' ||
    pathname === '/admin/stickers'
  )

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
              {isSpecificRoute ? children : <ContentRenderer />}
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
    <TenantProvider>
      <LookupProvider preloadCommon={true}>
        <LayoutProvider>
          <ContentViewProvider>
            <LayoutContent>{children}</LayoutContent>
          </ContentViewProvider>
        </LayoutProvider>
      </LookupProvider>
    </TenantProvider>
  )
}
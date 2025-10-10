'use client'

import { useMockAuth } from '@/hooks/useAuth'
import { useLayout } from '@/hooks/useLayout'
import { getRoleDisplayName } from '@/lib/config/roles'
import { Navigation } from '@/components/navigation'
import * as LucideIcons from 'lucide-react'

interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ isCollapsed = false }: SidebarProps) {
  const { user } = useMockAuth()
  const { isMobile, setShowMobileSidebar } = useLayout()

  if (!user) return null

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Logo/Brand */}
      <div className="flex items-center justify-between h-16 border-b border-gray-200 px-4">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-primary/10">
            <svg
              className="w-6 h-6 text-primary"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
            </svg>
          </div>
          {!isCollapsed && (
            <span className="ml-2 text-lg font-semibold text-gray-900 font-heading">
              Village Manager
            </span>
          )}
        </div>
        {/* Mobile Close Button */}
        {isMobile && (
          <button
            onClick={() => setShowMobileSidebar(false)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <LucideIcons.X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <Navigation
          variant="sidebar"
          collapsible={isCollapsed}
          onItemClick={(item) => {
            if (isMobile) {
              setShowMobileSidebar(false)
            }
          }}
          className={isCollapsed ? 'navigation--collapsed' : ''}
        />
      </div>

      {/* User Info */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user.email?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
          {!isCollapsed && (
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.email}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {getRoleDisplayName(user.role?.code)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
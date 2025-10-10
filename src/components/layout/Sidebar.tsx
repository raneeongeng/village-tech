'use client'

import { useAuth, useMockAuth } from '@/hooks/useAuth'
import { useLayout } from '@/hooks/useLayout'
import { getRoleDisplayName } from '@/lib/config/roles'
import { getNavigationForRole } from '@/lib/config/navigation'
import * as LucideIcons from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ isCollapsed = false }: SidebarProps) {
  const { user: realUser } = useAuth()
  const { user: mockUser } = useMockAuth()
  const { isMobile, setShowMobileSidebar } = useLayout()
  const pathname = usePathname()

  // Use real user if available, otherwise fall back to mock user for development
  const user = realUser || mockUser

  if (!user) return null

  const userRole = user.role?.code || 'household_head'
  const navigationItems = getNavigationForRole(userRole)

  // Development logging to verify role detection
  if (process.env.NODE_ENV === 'development') {
    console.log('Sidebar: User role detected as:', userRole, 'Navigation items count:', navigationItems.length)
  }

  return (
    <aside className="w-64 flex flex-col bg-white border-r border-gray-200 transition-all duration-300">
      {/* Branding Header */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary">VillageManager</h1>
        {/* Mobile Close Button */}
        {isMobile && (
          <button
            onClick={() => setShowMobileSidebar(false)}
            className="absolute top-4 right-4 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <LucideIcons.X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                item.badge ? 'justify-between' : ''
              } ${
                isActive
                  ? 'bg-secondary text-primary'
                  : 'text-text hover:bg-secondary/50'
              }`}
              onClick={() => {
                if (isMobile) {
                  setShowMobileSidebar(false)
                }
              }}
            >
              {item.badge ? (
                <>
                  <div className="flex items-center">
                    <span className="material-icons-outlined mr-3">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-accent rounded-full">
                    {item.badge}
                  </span>
                </>
              ) : (
                <>
                  <span className="material-icons-outlined mr-3">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center">
          <Image
            alt="user avatar"
            className="h-10 w-10 rounded-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAr8sWDFkQSgfV8UwhjtigPYRXG4P3ki_nSeVvDcjFr51cvnsNHNnOJWfAL3fBxepB1D2tgiXo8oyw9SDzLnsE5dMxbhMsDqaeVeoTZ8x3qVuEapAFPRTE0lEwDqCYM240PHut5DB1GwWhB2_jbkqdCWJ0KLvq8R7doRQt8we_U9PGc6juPXSp2MAx8758Lbavv-RjQXAbeRv6P6VwUX7in0_nlE_z6o0bb8qKcjXEUGodLolzzObs8toa4rdb3TuKpV0BHAoPmmY"
            width={40}
            height={40}
          />
          <div className="ml-3">
            <p className="text-sm font-medium text-text">{getRoleDisplayName(user.role?.code)}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
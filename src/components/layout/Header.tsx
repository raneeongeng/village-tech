'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, Bell, Search, Settings, User, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigation } from '@/hooks/useNavigation'

interface HeaderProps {
  onMenuClick?: () => void
  showMenuButton?: boolean
}

export function Header({ onMenuClick, showMenuButton = false }: HeaderProps) {
  const { user, logout } = useAuth()
  const { activeItem } = useNavigation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const pathname = usePathname()

  const getPageTitle = () => {
    if (activeItem) {
      return activeItem.label
    }

    // Fallback to pathname-based title
    const pathSegments = pathname.split('/').filter(Boolean)
    if (pathSegments.length === 0) return 'Dashboard'

    return pathSegments[pathSegments.length - 1]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center">
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}

      </div>

      <div className="flex items-center space-x-4">
        {/* Search */}
        <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md">
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center p-1 text-sm rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.first_name?.charAt(0) || user?.email?.charAt(0)}
              </span>
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
              {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.email}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.email}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email}
                </p>
                <p className="text-xs text-blue-600 font-medium">
                  {user?.role?.name}
                </p>
              </div>

              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <User className="w-4 h-4 mr-3" />
                Profile
              </button>

              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </button>

              <hr className="my-1" />

              <button
                onClick={logout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  )
}
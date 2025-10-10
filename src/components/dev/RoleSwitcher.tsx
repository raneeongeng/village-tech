'use client'

/**
 * Development-only role switcher for testing navigation
 * This component should only be used in development and removed in production
 */

import { useState } from 'react'
import type { UserRole } from '@/types/auth'

interface RoleSwitcherProps {
  currentRole: UserRole
  onRoleChange: (role: UserRole) => void
}

export function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const roles: { value: UserRole; label: string }[] = [
    { value: 'superadmin', label: 'Super Admin' },
    { value: 'admin_head', label: 'Head Admin' },
    { value: 'admin_officer', label: 'Admin Officer' },
    { value: 'household_head', label: 'Household Head' },
    { value: 'security_officer', label: 'Security Officer' },
  ]

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
      <div className="text-xs font-medium text-gray-600 mb-2">Dev: Switch Role</div>
      <select
        value={currentRole}
        onChange={(e) => onRoleChange(e.target.value as UserRole)}
        className="text-xs border border-gray-300 rounded px-2 py-1"
      >
        {roles.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>
      <div className="text-xs text-gray-500 mt-1">
        Current: {roles.find(r => r.value === currentRole)?.label}
      </div>
    </div>
  )
}
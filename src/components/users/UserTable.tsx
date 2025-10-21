'use client'

import { useState } from 'react'
import { UserStatusBadge } from './UserStatusBadge'
import type { UserWithRole } from '@/hooks/useUsers'

interface UserTableProps {
  users: UserWithRole[]
  isLoading: boolean
  onToggleStatus: (userId: string) => Promise<{ success: boolean; error?: string }>
  onDeleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>
}

export function UserTable({ users, isLoading, onToggleStatus, onDeleteUser }: UserTableProps) {
  const [processingUser, setProcessingUser] = useState<string | null>(null)

  const handleToggleStatus = async (userId: string) => {
    setProcessingUser(userId)
    try {
      const result = await onToggleStatus(userId)
      if (!result.success) {
        alert(result.error || 'Failed to update user status')
      }
    } catch (err) {
      console.error('Failed to toggle user status:', err)
      alert('Failed to update user status')
    } finally {
      setProcessingUser(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    const confirmed = confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`)
    if (!confirmed) return

    setProcessingUser(userId)
    try {
      const result = await onDeleteUser(userId)
      if (!result.success) {
        alert(result.error || 'Failed to delete user')
      }
    } catch (err) {
      console.error('Failed to delete user:', err)
      alert('Failed to delete user')
    } finally {
      setProcessingUser(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatName = (user: UserWithRole) => {
    const parts = [user.first_name]
    if (user.middle_name) parts.push(user.middle_name)
    parts.push(user.last_name)
    if (user.suffix) parts.push(user.suffix)
    return parts.join(' ')
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="p-8 text-center">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
          <p className="text-gray-600 dark:text-gray-400">There are no users matching your current filters.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatName(user)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {user.role_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <UserStatusBadge status={user.is_active} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user.last_login_at ? formatDate(user.last_login_at) : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {processingUser === user.id ? (
                      <span className="text-sm text-gray-500 dark:text-gray-400">Processing...</span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className="text-gray-500 dark:text-gray-400 hover:text-primary"
                          title={user.is_active ? 'Deactivate user' : 'Activate user'}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {user.is_active ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4V8a3 3 0 016 0v2M7 16v-2a3 3 0 013-3h4a3 3 0 013 3v2" />
                            )}
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-gray-500 dark:text-gray-400 hover:text-red-500"
                          title="Delete user"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
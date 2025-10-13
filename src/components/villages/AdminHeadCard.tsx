'use client'

import { VillageUser } from '@/hooks/useVillageDetails'

interface AdminHeadCardProps {
  adminHead: VillageUser | null
  villageName: string
  onRefresh: () => void
}

export function AdminHeadCard({ adminHead, villageName, onRefresh }: AdminHeadCardProps) {
  const getFullName = (user: VillageUser) => {
    const parts = [user.first_name]
    if (user.middle_name) parts.push(user.middle_name)
    parts.push(user.last_name)
    if (user.suffix) parts.push(user.suffix)
    return parts.join(' ')
  }

  const getContactPhone = (user: VillageUser) => {
    return user.settings?.contact_phone || 'Not provided'
  }

  const handleReassignAdminHead = () => {
    // TODO: Implement reassign admin head modal
    console.log('Reassign admin head for village:', villageName)
  }

  const handleAssignAdminHead = () => {
    // TODO: Implement assign admin head modal
    console.log('Assign admin head for village:', villageName)
  }

  if (!adminHead) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Admin Head Information</h3>
          <button
            onClick={handleAssignAdminHead}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90"
          >
            Assign Admin Head
          </button>
        </div>
        <div className="text-center py-8">
          <span className="material-icons-outlined text-4xl text-gray-400">person_off</span>
          <p className="mt-2 text-gray-600">No admin head assigned</p>
          <p className="mt-1 text-sm text-gray-500">
            This village needs an admin head to manage day-to-day operations.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Admin Head Information</h3>
        <button
          onClick={handleReassignAdminHead}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Reassign Admin Head
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
        <div>
          <p className="text-gray-500 mb-1">Full Name</p>
          <p className="font-medium text-gray-800">{getFullName(adminHead)}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-1">Email Address</p>
          <p className="font-medium text-gray-800">{adminHead.email}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-1">Contact Number</p>
          <p className="font-medium text-gray-800">{getContactPhone(adminHead)}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-1">Status</p>
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
            adminHead.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {adminHead.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div>
          <p className="text-gray-500 mb-1">Member Since</p>
          <p className="font-medium text-gray-800">
            {new Date(adminHead.created_at).toISOString().split('T')[0]}
          </p>
        </div>
      </div>
    </div>
  )
}
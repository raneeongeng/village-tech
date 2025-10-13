'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Village, PaginationData } from '@/types/village'
import { updateVillageStatus } from '@/hooks/useCreateVillage'
import { LookupValue } from '@/types/village'

interface VillageTableProps {
  villages: Village[] | null
  loading: boolean
  error: Error | null
  pagination: PaginationData
  villageStatuses: LookupValue[]
  onPageChange: (page: number) => void
  onRefresh: () => void
}

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  loading = false
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status?: LookupValue }) {
  if (!status) {
    return (
      <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
        Unknown
      </span>
    )
  }

  // Determine badge color based on status code
  let bgColor = 'bg-gray-100'
  let textColor = 'text-gray-800'

  if (status.code === 'active') {
    bgColor = 'bg-green-100'
    textColor = 'text-green-800'
  } else if (status.code === 'inactive') {
    bgColor = 'bg-red-100'
    textColor = 'text-red-800'
  } else if (status.code === 'pending') {
    bgColor = 'bg-yellow-100'
    textColor = 'text-yellow-800'
  }

  return (
    <span className={`px-2 py-1 text-xs font-semibold ${bgColor} ${textColor} rounded-full`}>
      {status.name}
    </span>
  )
}

function Pagination({ pagination, onPageChange }: {
  pagination: PaginationData
  onPageChange: (page: number) => void
}) {
  const { currentPage, totalPages, totalCount, itemsPerPage } = pagination

  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalCount)

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const startPage = Math.max(1, currentPage - 2)
      const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
      <div className="text-sm text-gray-700">
        Showing {startItem}-{endItem} of {totalCount} villages
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 text-sm border rounded-lg ${
              page === currentPage
                ? 'bg-primary text-white border-primary'
                : 'text-gray-500 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export function VillageTable({
  villages,
  loading,
  error,
  pagination,
  villageStatuses,
  onPageChange,
  onRefresh,
}: VillageTableProps) {
  const router = useRouter()
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    villageId: string
    villageName: string
    newStatusId: string
    action: 'activate' | 'deactivate'
  }>({
    isOpen: false,
    villageId: '',
    villageName: '',
    newStatusId: '',
    action: 'activate'
  })
  const [updating, setUpdating] = useState(false)

  const getActiveStatusId = () => {
    return villageStatuses.find(status => status.code === 'active')?.id || ''
  }

  const getInactiveStatusId = () => {
    return villageStatuses.find(status => status.code === 'inactive')?.id || ''
  }

  const handleStatusAction = (village: Village, action: 'activate' | 'deactivate') => {
    const newStatusId = action === 'activate' ? getActiveStatusId() : getInactiveStatusId()

    setConfirmModal({
      isOpen: true,
      villageId: village.id,
      villageName: village.name,
      newStatusId,
      action,
    })
  }

  const confirmStatusChange = async () => {
    if (!confirmModal.newStatusId) return

    setUpdating(true)
    try {
      const result = await updateVillageStatus(confirmModal.villageId, confirmModal.newStatusId)

      if (result.success) {
        onRefresh() // Refresh the table
        setConfirmModal({ isOpen: false, villageId: '', villageName: '', newStatusId: '', action: 'activate' })
      } else {
        console.error('Failed to update village status:', result.error)
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error('Error updating village status:', error)
    } finally {
      setUpdating(false)
    }
  }

  const cancelStatusChange = () => {
    setConfirmModal({ isOpen: false, villageId: '', villageName: '', newStatusId: '', action: 'activate' })
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-white overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Village Name</th>
              <th className="px-6 py-3">Village ID</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Created Date</th>
              <th className="px-6 py-3">Admin Head</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="bg-white border-b animate-pulse">
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <span className="material-icons-outlined text-red-500 text-6xl mb-4">error</span>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load villages</h3>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Empty state
  if (!villages || villages.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <span className="material-icons-outlined text-gray-400 text-6xl mb-4">location_city</span>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No villages found</h3>
        <p className="text-gray-600">
          {pagination.totalCount === 0
            ? "No villages have been created yet."
            : "No results match your current filters."
          }
        </p>
      </div>
    )
  }

  // Success state
  return (
    <>
      <div className="bg-white overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Village Name</th>
              <th className="px-6 py-3">Village ID</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Created Date</th>
              <th className="px-6 py-3">Admin Head</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {villages.map((village) => (
              <tr key={village.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {village.name}
                </td>
                <td className="px-6 py-4">
                  {village.id.substring(0, 8).toUpperCase()}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={village.status} />
                </td>
                <td className="px-6 py-4">
                  {new Date(village.created_at).toISOString().split('T')[0]}
                </td>
                <td className="px-6 py-4">
                  {village.admin_head
                    ? `${village.admin_head.first_name} ${village.admin_head.last_name}`
                    : 'Not Assigned'
                  }
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => router.push(`/villages/${village.id}`)}
                    className="text-primary hover:underline"
                  >
                    View
                  </button>
                  {village.status?.code === 'active' ? (
                    <button
                      onClick={() => handleStatusAction(village, 'deactivate')}
                      className="text-red-500 hover:underline"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusAction(village, 'activate')}
                      className="text-green-500 hover:underline"
                    >
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination pagination={pagination} onPageChange={onPageChange} />
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={`${confirmModal.action === 'activate' ? 'Activate' : 'Deactivate'} Village`}
        message={`Are you sure you want to ${confirmModal.action} "${confirmModal.villageName}"?`}
        confirmText={confirmModal.action === 'activate' ? 'Activate' : 'Deactivate'}
        cancelText="Cancel"
        onConfirm={confirmStatusChange}
        onCancel={cancelStatusChange}
        loading={updating}
      />
    </>
  )
}
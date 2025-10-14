'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { HouseholdTable } from '@/components/households'
import { usePendingHouseholds } from '@/hooks/useHouseholds'
import { useHouseholdActions } from '@/hooks/useHouseholdActions'

export default function HouseholdApprovalsPage() {
  const router = useRouter()
  const {
    data: pendingHouseholds,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    setPage,
    refetch,
  } = usePendingHouseholds()

  const householdActions = useHouseholdActions()

  // Search and filter state
  const [searchInput, setSearchInput] = useState(filters.search)

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters({ search: searchInput.trim() })
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  // Handle search clear
  const handleSearchClear = () => {
    setSearchInput('')
    setFilters({ search: '' })
  }

  // Handle view details
  const handleViewDetails = useCallback((householdId: string) => {
    // Navigate to household details page (to be implemented)
    router.push(`/households/${householdId}`)
  }, [router])

  // Handle approval
  const handleApprove = useCallback(async (householdId: string) => {
    // Refresh the data to remove approved household from pending list
    await refetch()
  }, [refetch])

  // Handle rejection
  const handleReject = useCallback(async (householdId: string) => {
    // Refresh the data to remove rejected household from pending list
    await refetch()
  }, [refetch])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pending Household Applications
          </h1>
          <p className="text-gray-600 mt-1">
            Review and process household applications awaiting approval.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={refetch}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <span className={`material-icons-outlined text-sm ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            Refresh
          </button>

          <button
            onClick={() => router.push('/active-households')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <span className="material-icons-outlined text-sm">
              home
            </span>
            View Active Households
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="material-icons-outlined text-yellow-500 text-2xl">
                pending_actions
              </span>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {pagination.totalCount}
              </div>
              <div className="text-sm text-gray-600">
                Pending Applications
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="material-icons-outlined text-blue-500 text-2xl">
                schedule
              </span>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {pendingHouseholds?.length || 0}
              </div>
              <div className="text-sm text-gray-600">
                On Current Page
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="material-icons-outlined text-purple-500 text-2xl">
                today
              </span>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {pendingHouseholds?.filter(h => {
                  const createdDate = new Date(h.created_at)
                  const today = new Date()
                  return createdDate.toDateString() === today.toDateString()
                }).length || 0}
              </div>
              <div className="text-sm text-gray-600">
                Applied Today
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="material-icons-outlined text-green-500 text-2xl">
                trending_up
              </span>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {pendingHouseholds?.filter(h => {
                  const createdDate = new Date(h.created_at)
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return createdDate >= weekAgo
                }).length || 0}
              </div>
              <div className="text-sm text-gray-600">
                This Week
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Search & Filter Applications
          </h3>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-icons-outlined text-gray-400 text-sm">
                    search
                  </span>
                </div>
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder="Search by address or applicant name..."
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleSearchClear}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <span className="material-icons-outlined text-gray-400 hover:text-gray-600 text-sm">
                      close
                    </span>
                  </button>
                )}
              </div>
            </form>

            {/* Search Button */}
            <button
              type="submit"
              form="search-form"
              onClick={handleSearchSubmit}
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              Search
            </button>
          </div>

          {/* Active Filters Display */}
          {(filters.search) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filters.search && (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                  <span>Search: &quot;{filters.search}&quot;</span>
                  <button
                    onClick={() => setFilters({ search: '' })}
                    className="hover:text-primary/80"
                  >
                    <span className="material-icons-outlined text-xs">close</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Processing Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="material-icons-outlined text-blue-500 text-sm mt-0.5 mr-3">
            info
          </span>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Application Processing Guidelines:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Review each application thoroughly before making a decision</li>
              <li>Approved applications will grant immediate access to village services</li>
              <li>Rejected applications will be permanently removed from the system</li>
              <li>All actions are logged for audit purposes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Pending Applications Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <HouseholdTable
          data={pendingHouseholds || []}
          loading={loading}
          error={error}
          type="pending"
          onViewDetails={handleViewDetails}
          onApprove={handleApprove}
          onReject={handleReject}
        />

        {/* Pagination */}
        {pendingHouseholds && pendingHouseholds.length > 0 && pagination.totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalCount)} of {pagination.totalCount} applications
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1 || loading}
                  className="px-3 py-1 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>

                <button
                  onClick={() => setPage(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages || loading}
                  className="px-3 py-1 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
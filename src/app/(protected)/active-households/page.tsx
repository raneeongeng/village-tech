'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { HouseholdTable, AddHouseholdModal } from '@/components/households'
import { useActiveHouseholds } from '@/hooks/useHouseholds'
import { useHouseholdActions } from '@/hooks/useHouseholdActions'
import { Household } from '@/types/household'

export default function ActiveHouseholdsPage() {
  const router = useRouter()
  const {
    data: households,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    setPage,
    refetch,
  } = useActiveHouseholds()

  const householdActions = useHouseholdActions()

  // Search and filter state
  const [searchInput, setSearchInput] = useState(filters.search)

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false)

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

  // Handle status toggle
  const handleToggleStatus = useCallback(async (householdId: string, currentStatus: string) => {
    try {
      const result = await householdActions.toggleHouseholdStatus(householdId, currentStatus)

      if (result.success) {
        // Refresh the data to show updated status
        await refetch()
      } else {
        console.error('Failed to toggle household status:', result.error)
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error('Error toggling household status:', error)
    }
  }, [householdActions, refetch])

  // Handle add household success
  const handleAddHouseholdSuccess = useCallback(async (household: Household) => {
    // Refresh the data to show the new household (it will be in pending status)
    await refetch()
    setShowAddModal(false)

    // Optionally navigate to pending households page to show the new application
    // router.push('/household-approvals')
  }, [refetch])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Active Households
          </h1>
          <p className="text-gray-600 mt-1">
            Manage approved households and their status within your village.
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
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <span className="material-icons-outlined text-sm">
              add
            </span>
            Add New Household
          </button>

          <button
            onClick={() => router.push('/household-approvals')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <span className="material-icons-outlined text-sm">
              pending_actions
            </span>
            View Pending Applications
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="material-icons-outlined text-green-500 text-2xl">
                home
              </span>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {pagination.totalCount}
              </div>
              <div className="text-sm text-gray-600">
                Active Households
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="material-icons-outlined text-blue-500 text-2xl">
                people
              </span>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {households?.reduce((sum, h) => sum + (h.member_count || 0), 0) || 0}
              </div>
              <div className="text-sm text-gray-600">
                Total Members
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="material-icons-outlined text-yellow-500 text-2xl">
                location_city
              </span>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {pagination.currentPage}
              </div>
              <div className="text-sm text-gray-600">
                Current Page
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="material-icons-outlined text-purple-500 text-2xl">
                trending_up
              </span>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {pagination.itemsPerPage}
              </div>
              <div className="text-sm text-gray-600">
                Per Page
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Search & Filter
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
                  placeholder="Search by address or household head name..."
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

      {/* Households Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <HouseholdTable
          data={households || []}
          loading={loading}
          error={error}
          type="active"
          onViewDetails={handleViewDetails}
          onToggleStatus={handleToggleStatus}
        />

        {/* Pagination */}
        {households && households.length > 0 && pagination.totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalCount)} of {pagination.totalCount} households
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

      {/* Add Household Modal */}
      <AddHouseholdModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddHouseholdSuccess}
      />
    </div>
  )
}
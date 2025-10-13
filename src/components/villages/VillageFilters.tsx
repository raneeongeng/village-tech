'use client'

import { useState, useEffect } from 'react'
import { VillageFilters as VillageFiltersType, REGIONS } from '@/types/village'
import { LookupValue } from '@/types/village'
import { useDebounce } from '@/hooks/useDebounce'

interface VillageFiltersProps {
  filters: VillageFiltersType
  onFiltersChange: (filters: VillageFiltersType) => void
  villageStatuses: LookupValue[]
  loading?: boolean
}

export function VillageFilters({
  filters,
  onFiltersChange,
  villageStatuses,
  loading = false
}: VillageFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search)
  const [statusFilter, setStatusFilter] = useState(filters.statusId || '')
  const [regionFilter, setRegionFilter] = useState(filters.region || '')

  // Debounce search input to prevent excessive filtering
  const debouncedSearch = useDebounce(searchInput, 300)

  // Update local state when external filters change
  useEffect(() => {
    setSearchInput(filters.search)
    setStatusFilter(filters.statusId || '')
    setRegionFilter(filters.region || '')
  }, [filters])

  // Apply filters when debounced search or other filters change
  useEffect(() => {
    const newFilters: VillageFiltersType = {
      search: debouncedSearch,
      statusId: statusFilter,
      region: regionFilter,
    }

    // Only call onFiltersChange if filters actually changed
    if (
      newFilters.search !== filters.search ||
      newFilters.statusId !== filters.statusId ||
      newFilters.region !== filters.region
    ) {
      onFiltersChange(newFilters)
    }
  }, [debouncedSearch, statusFilter, regionFilter, filters, onFiltersChange])

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
  }

  const handleRegionChange = (value: string) => {
    setRegionFilter(value)
  }

  const handleReset = () => {
    setSearchInput('')
    setStatusFilter('')
    setRegionFilter('')
    // The useEffect will handle calling onFiltersChange
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Search Input */}
        <div className="md:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-icons-outlined text-gray-400 text-xl">search</span>
            </div>
            <input
              type="text"
              id="search"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by village name or ID"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={loading}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={loading}
          >
            <option value="">All Statuses</option>
            {villageStatuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </div>

        {/* Region Filter */}
        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
            Region
          </label>
          <select
            id="region"
            value={regionFilter}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={loading}
          >
            <option value="">All Regions</option>
            {REGIONS.map((region) => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            disabled={loading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Reset Filters
          </button>
        </div>

        {/* Filter Summary */}
        <div className="text-sm text-gray-500">
          {(searchInput || statusFilter || regionFilter) && (
            <span>
              Active filters: {[
                searchInput && 'Search',
                statusFilter && 'Status',
                regionFilter && 'Region'
              ].filter(Boolean).join(', ')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
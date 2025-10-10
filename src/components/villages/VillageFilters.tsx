'use client'

import { useState, useEffect } from 'react'
import { VillageFilters as VillageFiltersType, REGIONS } from '@/types/village'
import { LookupValue } from '@/types/village'

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
  const [localFilters, setLocalFilters] = useState<VillageFiltersType>(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleInputChange = (field: keyof VillageFiltersType, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleApplyFilter = () => {
    onFiltersChange(localFilters)
  }

  const handleReset = () => {
    const resetFilters = {
      search: '',
      statusId: '',
      region: '',
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
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
              value={localFilters.search}
              onChange={(e) => handleInputChange('search', e.target.value)}
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
            value={localFilters.statusId || ''}
            onChange={(e) => handleInputChange('statusId', e.target.value)}
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
            value={localFilters.region || ''}
            onChange={(e) => handleInputChange('region', e.target.value)}
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
            onClick={handleApplyFilter}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Apply Filter
          </button>
          <button
            onClick={handleReset}
            disabled={loading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Filter Summary */}
        <div className="text-sm text-gray-500">
          {Object.values(localFilters).some(value => value && value !== '') && (
            <span>
              Active filters: {[
                localFilters.search && 'Search',
                localFilters.statusId && 'Status',
                localFilters.region && 'Region'
              ].filter(Boolean).join(', ')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
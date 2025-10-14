'use client'

import { Household } from '@/types/household'
import { HouseholdInfoSection } from './details/HouseholdInfoSection'
import { HouseholdMembersSection } from './details/HouseholdMembersSection'
import { HouseholdPermitsSection } from './details/HouseholdPermitsSection'
import { HouseholdFeesSection } from './details/HouseholdFeesSection'

interface HouseholdDetailsPageProps {
  household: Household
  onBack: () => void
  onRefresh: () => void
}

export function HouseholdDetailsPage({
  household,
  onBack,
  onRefresh,
}: HouseholdDetailsPageProps) {
  // Helper function to get full name
  const getHouseholdName = () => {
    const head = household.household_head
    const parts = [
      head.first_name,
      head.middle_name,
      head.last_name,
      head.suffix,
    ].filter(Boolean)
    return `The ${parts[parts.length - 1]} Family`
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-100 transition-colors"
          >
            <span className="material-icons-outlined text-gray-600">arrow_back</span>
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Household Profile</h2>
            <p className="text-gray-600">Manage household details, members, permits, and fees.</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        >
          <span className="material-icons-outlined mr-2 text-lg">refresh</span>
          Refresh
        </button>
      </div>

      {/* Content Sections */}
      <div className="space-y-8">
        {/* Basic Household Information */}
        <HouseholdInfoSection
          household={household}
          householdName={getHouseholdName()}
        />

        {/* Members Section */}
        <HouseholdMembersSection
          members={household.members || []}
          householdHead={household.household_head}
        />

        {/* Permits & Stickers Section */}
        <HouseholdPermitsSection
          permits={household.permits || []}
        />
      </div>
    </div>
  )
}
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={onBack}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <span className="material-icons-outlined text-gray-600">arrow_back</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Household Profile</h1>
          </div>
          <p className="text-gray-500 ml-14">
            Manage household details, members, permits, and fees.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <span className="material-icons-outlined text-sm">refresh</span>
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

        {/* Fees Section */}
        <HouseholdFeesSection
          fees={household.fees || []}
        />
      </div>
    </div>
  )
}
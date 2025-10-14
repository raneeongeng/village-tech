'use client'

import { Household } from '@/types/household'
import { HouseholdStatusBadge } from '../HouseholdStatusBadge'

interface HouseholdInfoSectionProps {
  household: Household
  householdName: string
}

export function HouseholdInfoSection({
  household,
  householdName,
}: HouseholdInfoSectionProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getFullName = (head: typeof household.household_head) => {
    const parts = [
      head.first_name,
      head.middle_name,
      head.last_name,
      head.suffix,
    ].filter(Boolean)
    return parts.join(' ')
  }

  return (
    <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-xl font-semibold mb-6 text-gray-900">
        Household Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Household Name */}
        <div>
          <p className="text-sm text-gray-600">Household Name</p>
          <p className="font-medium text-gray-900">{householdName}</p>
        </div>

        {/* Address */}
        <div>
          <p className="text-sm text-gray-600">Address</p>
          <p className="font-medium text-gray-900">{household.address}</p>
        </div>

        {/* Status */}
        <div>
          <p className="text-sm text-gray-600">Status</p>
          <div className="mt-1">
            <HouseholdStatusBadge status={household.status} />
          </div>
        </div>

        {/* Head of Household */}
        <div>
          <p className="text-sm text-gray-600">Head of Household</p>
          <p className="font-medium text-gray-900">{getFullName(household.household_head)}</p>
        </div>

        {/* Contact */}
        <div>
          <p className="text-sm text-gray-600">Contact</p>
          <p className="font-medium text-gray-900">{household.household_head.email}</p>
        </div>

        {/* Created Date */}
        <div>
          <p className="text-sm text-gray-600">Registered</p>
          <p className="font-medium text-gray-900">{formatDate(household.created_at)}</p>
        </div>

        {/* Member Count */}
        <div>
          <p className="text-sm text-gray-600">Total Members</p>
          <p className="font-medium text-gray-900">{household.member_count || 0}</p>
        </div>

        {/* Approved Date (if applicable) */}
        {household.approved_at && (
          <div>
            <p className="text-sm text-gray-600">Approved</p>
            <p className="font-medium text-gray-900">{formatDate(household.approved_at)}</p>
          </div>
        )}
      </div>
    </section>
  )
}
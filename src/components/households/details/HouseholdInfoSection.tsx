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
    <section className="bg-background border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">
        Household Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Household Name */}
        <div className="md:col-span-1">
          <p className="text-sm font-medium text-gray-500">Household Name</p>
          <p className="mt-1 text-gray-900">{householdName}</p>
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <p className="text-sm font-medium text-gray-500">Address</p>
          <p className="mt-1 text-gray-900">{household.address}</p>
        </div>

        {/* Head of Household */}
        <div className="md:col-span-1">
          <p className="text-sm font-medium text-gray-500">Head of Household</p>
          <p className="mt-1 text-gray-900">{getFullName(household.household_head)}</p>
        </div>

        {/* Contact */}
        <div className="md:col-span-1">
          <p className="text-sm font-medium text-gray-500">Contact</p>
          <p className="mt-1 text-gray-900">{household.household_head.email}</p>
        </div>

        {/* Status */}
        <div className="md:col-span-1">
          <p className="text-sm font-medium text-gray-500">Status</p>
          <div className="mt-1">
            <HouseholdStatusBadge status={household.status} />
          </div>
        </div>

        {/* Created Date */}
        <div className="md:col-span-1">
          <p className="text-sm font-medium text-gray-500">Registered</p>
          <p className="mt-1 text-gray-900">{formatDate(household.created_at)}</p>
        </div>

        {/* Member Count */}
        <div className="md:col-span-1">
          <p className="text-sm font-medium text-gray-500">Total Members</p>
          <p className="mt-1 text-gray-900">{household.member_count || 0}</p>
        </div>

        {/* Approved Date (if applicable) */}
        {household.approved_at && (
          <div className="md:col-span-1">
            <p className="text-sm font-medium text-gray-500">Approved</p>
            <p className="mt-1 text-gray-900">{formatDate(household.approved_at)}</p>
          </div>
        )}
      </div>
    </section>
  )
}
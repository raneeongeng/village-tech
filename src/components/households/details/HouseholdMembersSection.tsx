'use client'

import { HouseholdMember, HouseholdHead } from '@/types/household'

interface HouseholdMembersSectionProps {
  members: HouseholdMember[]
  householdHead: HouseholdHead
}

export function HouseholdMembersSection({
  members,
  householdHead,
}: HouseholdMembersSectionProps) {
  // Combine household head with other members for display
  const allMembers = [
    {
      id: householdHead.id,
      name: [
        householdHead.first_name,
        householdHead.middle_name,
        householdHead.last_name,
        householdHead.suffix,
      ].filter(Boolean).join(' '),
      role: 'Head of Household',
      contact: householdHead.email,
      isHead: true,
    },
    ...members
      .filter(member => !member.is_primary) // Exclude head if already included
      .map(member => ({
        id: member.id,
        name: member.name,
        role: member.relationship?.name || 'Member',
        contact: member.contact_info?.email || member.contact_info?.phone || 'No contact',
        isHead: false,
      })),
  ]

  return (
    <section>
      <h3 className="text-lg font-semibold mb-4">Members</h3>

      <div className="overflow-x-auto bg-background border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-900" scope="col">
                Name
              </th>
              <th className="px-6 py-3 font-medium text-gray-900" scope="col">
                Role
              </th>
              <th className="px-6 py-3 font-medium text-gray-900" scope="col">
                Contact
              </th>
            </tr>
          </thead>
          <tbody>
            {allMembers.map((member, index) => (
              <tr
                key={member.id}
                className={`${
                  index < allMembers.length - 1 ? 'border-b border-gray-200' : ''
                } hover:bg-primary/5 transition-colors`}
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {member.name}
                  {member.isHead && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                      Primary
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {member.role}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {member.contact}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {allMembers.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No members found for this household.
          </div>
        )}
      </div>
    </section>
  )
}
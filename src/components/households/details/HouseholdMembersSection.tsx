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
    <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">Members</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200">
            <tr className="text-sm text-gray-600">
              <th className="py-3 px-4 font-medium">Name</th>
              <th className="py-3 px-4 font-medium">Role</th>
              <th className="py-3 px-4 font-medium">Contact</th>
            </tr>
          </thead>
          <tbody>
            {allMembers.map((member, index) => (
              <tr
                key={member.id}
                className={`${
                  index < allMembers.length - 1 ? 'border-b border-gray-200' : ''
                } hover:bg-gray-50`}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{member.name}</span>
                    {member.isHead && (
                      <span className="px-2 py-0.5 text-xs font-semibold text-primary bg-primary/10 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-600">
                  {member.role}
                </td>
                <td className="py-4 px-4 text-gray-600">
                  {member.contact}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {allMembers.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No members found for this household.
          </div>
        )}
      </div>
    </section>
  )
}
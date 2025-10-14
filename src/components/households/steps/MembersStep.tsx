'use client'

import { UseCreateHouseholdResult } from '@/types/household'
import { useHouseholdLookupData } from '@/hooks/useHouseholdLookupData'
import { HouseholdMemberSchema, defaultMemberValues } from '@/lib/validations/household'
import { useState } from 'react'

interface MembersStepProps {
  hookData: UseCreateHouseholdResult
}

export function MembersStep({ hookData }: MembersStepProps) {
  const { formData, updateMembersInfo } = hookData
  const { relationshipTypes, loading: lookupLoading } = useHouseholdLookupData()
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({})

  const members = formData.members || []

  const addMember = () => {
    const newMember = {
      ...defaultMemberValues,
      relationshipId: '',
      relationshipName: '',
    }
    updateMembersInfo([...members, newMember])
  }

  const removeMember = (index: number) => {
    const updatedMembers = members.filter((_, i) => i !== index)
    updateMembersInfo(updatedMembers)

    // Clear errors for removed member
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[index]
      return newErrors
    })
  }

  const updateMember = (index: number, field: string, value: string) => {
    const updatedMembers = [...members]
    updatedMembers[index] = {
      ...updatedMembers[index],
      [field]: value,
    }

    // Special handling for relationship selection
    if (field === 'relationshipId') {
      const selectedRelationship = relationshipTypes.find(r => r.id === value)
      updatedMembers[index].relationshipName = selectedRelationship?.name || ''
    }

    updateMembersInfo(updatedMembers)

    // Clear field error when user starts typing
    if (errors[index]?.[field]) {
      setErrors(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          [field]: '',
        },
      }))
    }
  }

  const handleBlur = (index: number, field: string) => {
    try {
      HouseholdMemberSchema.parse(members[index])
      setErrors(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          [field]: '',
        },
      }))
    } catch (error: any) {
      const fieldError = error.errors?.find((err: any) => err.path[0] === field)
      if (fieldError) {
        setErrors(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            [field]: fieldError.message,
          },
        }))
      }
    }
  }

  // Filter out 'head' relationship since that's for household head only
  const memberRelationshipTypes = relationshipTypes.filter(r => r.code !== 'head')

  return (
    <div className="space-y-6">
      {/* Step Description */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Additional Household Members
        </h3>
        <p className="text-sm text-gray-600">
          Add other family members or residents living in this household. This step is optional
          but helps us maintain accurate records of all household occupants.
        </p>
      </div>

      {/* Members List */}
      {members.length > 0 && (
        <div className="space-y-4">
          {members.map((member, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              {/* Member Header */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900">
                  Member {index + 1}
                </h4>
                <button
                  onClick={() => removeMember(index)}
                  className="text-red-500 hover:text-red-700"
                  title="Remove member"
                >
                  <span className="material-icons-outlined text-sm">delete</span>
                </button>
              </div>

              {/* Member Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={member.firstName}
                    onChange={(e) => updateMember(index, 'firstName', e.target.value)}
                    onBlur={() => handleBlur(index, 'firstName')}
                    placeholder="First name"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
                      errors[index]?.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors[index]?.firstName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <span className="material-icons-outlined text-xs">error</span>
                      {errors[index].firstName}
                    </p>
                  )}
                </div>

                {/* Middle Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={member.middleName || ''}
                    onChange={(e) => updateMember(index, 'middleName', e.target.value)}
                    onBlur={() => handleBlur(index, 'middleName')}
                    placeholder="Middle name (optional)"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
                      errors[index]?.middleName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={member.lastName}
                    onChange={(e) => updateMember(index, 'lastName', e.target.value)}
                    onBlur={() => handleBlur(index, 'lastName')}
                    placeholder="Last name"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
                      errors[index]?.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors[index]?.lastName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <span className="material-icons-outlined text-xs">error</span>
                      {errors[index].lastName}
                    </p>
                  )}
                </div>

                {/* Suffix */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Suffix
                  </label>
                  <select
                    value={member.suffix || ''}
                    onChange={(e) => updateMember(index, 'suffix', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select (Optional)</option>
                    <option value="Jr.">Jr.</option>
                    <option value="Sr.">Sr.</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                  </select>
                </div>

                {/* Relationship */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship to Household Head <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={member.relationshipId}
                    onChange={(e) => updateMember(index, 'relationshipId', e.target.value)}
                    onBlur={() => handleBlur(index, 'relationshipId')}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
                      errors[index]?.relationshipId ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={lookupLoading}
                  >
                    <option value="">Select relationship</option>
                    {memberRelationshipTypes.map((relationship) => (
                      <option key={relationship.id} value={relationship.id}>
                        {relationship.name}
                      </option>
                    ))}
                  </select>
                  {errors[index]?.relationshipId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <span className="material-icons-outlined text-xs">error</span>
                      {errors[index].relationshipId}
                    </p>
                  )}
                </div>

                {/* Phone (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={member.phone || ''}
                    onChange={(e) => updateMember(index, 'phone', e.target.value)}
                    onBlur={() => handleBlur(index, 'phone')}
                    placeholder="09123456789 (optional)"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
                      errors[index]?.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors[index]?.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <span className="material-icons-outlined text-xs">error</span>
                      {errors[index].phone}
                    </p>
                  )}
                </div>

                {/* Email (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={member.email || ''}
                    onChange={(e) => updateMember(index, 'email', e.target.value)}
                    onBlur={() => handleBlur(index, 'email')}
                    placeholder="email@example.com (optional)"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
                      errors[index]?.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors[index]?.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <span className="material-icons-outlined text-xs">error</span>
                      {errors[index].email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Member Button */}
      {members.length < 10 && (
        <div className="text-center">
          <button
            onClick={addMember}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary transition-colors"
          >
            <span className="material-icons-outlined">add</span>
            Add Household Member
          </button>
          {members.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {members.length}/10 members added
            </p>
          )}
        </div>
      )}

      {/* No Members State */}
      {members.length === 0 && (
        <div className="text-center py-8">
          <span className="material-icons-outlined text-gray-400 text-4xl mb-4 block">
            group_add
          </span>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No additional members yet
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            You can add other household members now or skip this step and add them later.
          </p>
          <button
            onClick={addMember}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <span className="material-icons-outlined">add</span>
            Add First Member
          </button>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="material-icons-outlined text-blue-500 text-sm mt-0.5 mr-3">
            info
          </span>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">About Household Members:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Add all family members and residents living in your household</li>
              <li>Contact information is optional but helpful for emergencies</li>
              <li>You can add up to 10 additional members (excluding the household head)</li>
              <li>Members can be added or updated later through your household profile</li>
              <li>This step is completely optional - you can skip it if no other members</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { useHouseholdMembers, type AddMemberData } from '@/hooks/useHouseholdMembers'

export default function MembersPage() {
  const {
    members,
    loading,
    error,
    relationshipTypes,
    addMember,
    removeMember,
    refetch
  } = useHouseholdMembers()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    relationshipId: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword
  const showPasswordMismatch = formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)
    setSubmitError(null)

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setSubmitError('Passwords do not match')
        setSubmitLoading(false)
        return
      }

      const memberData: AddMemberData = {
        firstName: formData.firstName,
        middleName: formData.middleName || undefined,
        lastName: formData.lastName,
        suffix: formData.suffix || undefined,
        relationshipId: formData.relationshipId,
        phone: formData.phone || undefined,
        email: formData.email,
        password: formData.password
      }

      const result = await addMember(memberData)

      if (result.success) {
        setIsAddModalOpen(false)
        setFormData({
          firstName: '',
          middleName: '',
          lastName: '',
          suffix: '',
          relationshipId: '',
          phone: '',
          email: '',
          password: '',
          confirmPassword: ''
        })
        setSubmitError(null)
      } else {
        setSubmitError(result.error?.message || 'Failed to add member')
      }
    } catch (err) {
      setSubmitError('An unexpected error occurred')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the household?`)) {
      return
    }

    const result = await removeMember(memberId)
    if (!result.success) {
      alert(`Failed to remove member: ${result.error?.message}`)
    }
  }

  const formatContactInfo = (contactInfo: any) => {
    if (!contactInfo) return ''
    const phone = contactInfo.phone || ''
    const email = contactInfo.email || ''
    return [phone, email].filter(Boolean).join(' • ') || 'No contact info'
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Household Members</h2>
          <p className="mt-1 text-base text-gray-500">Manage your household&apos;s member information.</p>
        </div>
        <button
          onClick={() => {
            setIsAddModalOpen(true)
            setSubmitError(null)
          }}
          className="mt-4 md:mt-0 flex items-center justify-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <span className="material-icons-outlined mr-2 text-sm">add</span>
          Add Member
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading members...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 mb-4">Error: {error.message}</p>
            <button
              onClick={refetch}
              className="text-primary hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No household members found</p>
            <button
              onClick={() => {
                setIsAddModalOpen(true)
                setSubmitError(null)
              }}
              className="text-primary hover:underline"
            >
              Add your first member
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Relationship
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Information
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {member.photo_url ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={member.photo_url}
                              alt={member.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.name}
                          </div>
                          {member.is_primary && (
                            <div className="text-xs text-primary font-medium">
                              Primary Contact
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.relationship?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatContactInfo(member.contact_info)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <button className="text-primary hover:text-primary/80">Edit</button>
                      <button
                        onClick={() => handleRemoveMember(member.id, member.name)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-lg border border-primary/20">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Add New Member</h1>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="material-icons-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{submitError}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      className="w-full px-4 py-3 bg-background border border-primary/30 rounded-lg focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-400"
                      required
                      disabled={submitLoading}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      className="w-full px-4 py-3 bg-background border border-primary/30 rounded-lg focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-400"
                      required
                      disabled={submitLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-2">
                      Middle Name <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="middleName"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleInputChange}
                      placeholder="Middle name"
                      className="w-full px-4 py-3 bg-background border border-primary/30 rounded-lg focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-400"
                      disabled={submitLoading}
                    />
                  </div>
                  <div>
                    <label htmlFor="suffix" className="block text-sm font-medium text-gray-700 mb-2">
                      Suffix <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="suffix"
                      name="suffix"
                      value={formData.suffix}
                      onChange={handleInputChange}
                      placeholder="Jr., Sr., III"
                      className="w-full px-4 py-3 bg-background border border-primary/30 rounded-lg focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-400"
                      disabled={submitLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="relationshipId" className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship to Head
                  </label>
                  <select
                    id="relationshipId"
                    name="relationshipId"
                    value={formData.relationshipId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-background border border-primary/30 rounded-lg focus:ring-primary focus:border-primary text-gray-900 appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2322574A' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                    required
                    disabled={submitLoading}
                  >
                    <option value="">Select relationship</option>
                    {relationshipTypes.map((relationship) => (
                      <option key={relationship.id} value={relationship.id}>
                        {relationship.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-3 bg-background border border-primary/30 rounded-lg focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-400"
                    disabled={submitLoading}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    className="w-full px-4 py-3 bg-background border border-primary/30 rounded-lg focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-400"
                    required
                    disabled={submitLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter password"
                        className="w-full px-4 py-3 pr-12 bg-background border border-primary/30 rounded-lg focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-400"
                        required
                        disabled={submitLoading}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        disabled={submitLoading}
                      >
                        <span className="material-icons-outlined text-sm">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm password"
                        className={`w-full px-4 py-3 pr-12 bg-background border rounded-lg focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-400 ${
                          showPasswordMismatch
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : passwordsMatch
                              ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                              : 'border-primary/30'
                        }`}
                        required
                        disabled={submitLoading}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        disabled={submitLoading}
                      >
                        <span className="material-icons-outlined text-sm">
                          {showConfirmPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                    {/* Password match indicator */}
                    {formData.confirmPassword && (
                      <div className="mt-1 flex items-center gap-1">
                        {passwordsMatch ? (
                          <>
                            <span className="material-icons-outlined text-green-600 text-sm">check_circle</span>
                            <span className="text-xs text-green-600">Passwords match</span>
                          </>
                        ) : (
                          <>
                            <span className="material-icons-outlined text-red-600 text-sm">error</span>
                            <span className="text-xs text-red-600">Passwords do not match</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end items-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false)
                      setSubmitError(null)
                    }}
                    className="px-6 py-3 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700"
                    disabled={submitLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={submitLoading}
                  >
                    {submitLoading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {submitLoading ? 'Adding...' : 'Save Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
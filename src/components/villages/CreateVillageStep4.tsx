'use client'

import { CreateVillageFormData } from '@/types/village'

interface CreateVillageStep4Props {
  formData: CreateVillageFormData
  onUpdate: (updates: Partial<CreateVillageFormData>) => void
  validationErrors: { [key: string]: string }
  loading?: boolean
}

export function CreateVillageStep4({
  formData,
  onUpdate,
  validationErrors,
  loading = false
}: CreateVillageStep4Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Head Registration</h3>
        <p className="text-gray-600 mb-6">
          Register the primary administrator who will manage this village community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div>
          <label htmlFor="adminFirstName" className="block text-sm font-medium text-gray-700 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="adminFirstName"
            value={formData.adminFirstName}
            onChange={(e) => onUpdate({ adminFirstName: e.target.value })}
            placeholder="Enter first name"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              validationErrors.adminFirstName ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {validationErrors.adminFirstName && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.adminFirstName}</p>
          )}
        </div>

        {/* Middle Name */}
        <div>
          <label htmlFor="adminMiddleName" className="block text-sm font-medium text-gray-700 mb-2">
            Middle Name
          </label>
          <input
            type="text"
            id="adminMiddleName"
            value={formData.adminMiddleName || ''}
            onChange={(e) => onUpdate({ adminMiddleName: e.target.value })}
            placeholder="Enter middle name (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">Optional field</p>
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="adminLastName" className="block text-sm font-medium text-gray-700 mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="adminLastName"
            value={formData.adminLastName}
            onChange={(e) => onUpdate({ adminLastName: e.target.value })}
            placeholder="Enter last name"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              validationErrors.adminLastName ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {validationErrors.adminLastName && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.adminLastName}</p>
          )}
        </div>

        {/* Suffix */}
        <div>
          <label htmlFor="adminSuffix" className="block text-sm font-medium text-gray-700 mb-2">
            Suffix
          </label>
          <input
            type="text"
            id="adminSuffix"
            value={formData.adminSuffix || ''}
            onChange={(e) => onUpdate({ adminSuffix: e.target.value })}
            placeholder="Jr., Sr., III (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">Optional field</p>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="adminEmail"
            value={formData.adminEmail}
            onChange={(e) => onUpdate({ adminEmail: e.target.value })}
            placeholder="admin@example.com"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              validationErrors.adminEmail ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {validationErrors.adminEmail && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.adminEmail}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            This email will be used for login and system notifications
          </p>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="adminPassword"
            value={formData.adminPassword || ''}
            onChange={(e) => onUpdate({ adminPassword: e.target.value })}
            placeholder="Enter secure password"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              validationErrors.adminPassword ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {validationErrors.adminPassword && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.adminPassword}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Minimum 8 characters
          </p>
        </div>

        {/* Role Information (Read-only) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center">
              <span className="material-icons-outlined text-primary mr-2">admin_panel_settings</span>
              <div>
                <p className="text-sm font-medium text-gray-900">Admin Head</p>
                <p className="text-xs text-gray-600">Full administrative access to this village</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Preview */}
      {(formData.adminFirstName || formData.adminLastName) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Admin Head Preview</h4>
          <div className="text-sm text-blue-700">
            <p><span className="font-medium">Name:</span> {[
              formData.adminFirstName,
              formData.adminMiddleName,
              formData.adminLastName,
              formData.adminSuffix
            ].filter(Boolean).join(' ')}</p>
            {formData.adminEmail && (
              <p><span className="font-medium">Email:</span> {formData.adminEmail}</p>
            )}
            <p><span className="font-medium">Role:</span> Admin Head</p>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="material-icons-outlined text-purple-500 mr-3 mt-0.5">people</span>
          <div>
            <h4 className="text-sm font-semibold text-purple-800 mb-1">Admin Head Responsibilities</h4>
            <p className="text-sm text-purple-700 mb-2">
              The Admin Head will have full administrative privileges including:
            </p>
            <ul className="text-sm text-purple-700 list-disc list-inside space-y-1">
              <li>Managing household registrations and members</li>
              <li>Approving guest passes and construction permits</li>
              <li>Setting village rules and fee structures</li>
              <li>Overseeing security operations and incident reports</li>
              <li>Adding additional admin officers as needed</li>
            </ul>
            <p className="text-sm text-purple-700 mt-2">
              <strong>Note:</strong> The admin head will be able to log in immediately after village creation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
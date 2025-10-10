'use client'

import { CreateVillageFormData, REGIONS } from '@/types/village'

interface CreateVillageStep2Props {
  formData: CreateVillageFormData
  onUpdate: (updates: Partial<CreateVillageFormData>) => void
  validationErrors: { [key: string]: string }
  loading?: boolean
}

export function CreateVillageStep2({
  formData,
  onUpdate,
  validationErrors,
  loading = false
}: CreateVillageStep2Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Village Details</h3>
        <p className="text-gray-600 mb-6">
          Provide location and contact information for the village.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Address */}
        <div className="md:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Full Address
          </label>
          <textarea
            id="address"
            rows={3}
            value={formData.address || ''}
            onChange={(e) => onUpdate({ address: e.target.value })}
            placeholder="Complete address of the village"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">Include street, city, state/province, and postal code</p>
        </div>

        {/* Contact Phone */}
        <div>
          <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
            Contact Phone
          </label>
          <input
            type="tel"
            id="contactPhone"
            value={formData.contactPhone || ''}
            onChange={(e) => onUpdate({ contactPhone: e.target.value })}
            placeholder="+1 (555) 000-0000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">Main contact number for the village</p>
        </div>

        {/* Contact Email */}
        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
            Contact Email
          </label>
          <input
            type="email"
            id="contactEmail"
            value={formData.contactEmail || ''}
            onChange={(e) => onUpdate({ contactEmail: e.target.value })}
            placeholder="contact@village.com"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              validationErrors.contactEmail ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {validationErrors.contactEmail && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.contactEmail}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">General inquiry email address</p>
        </div>

        {/* Region */}
        <div className="md:col-span-2">
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
            Region
          </label>
          <select
            id="region"
            value={formData.region || ''}
            onChange={(e) => onUpdate({ region: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={loading}
          >
            <option value="">Select region (optional)</option>
            {REGIONS.map((region) => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">Geographic region for organizational purposes</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="material-icons-outlined text-amber-500 mr-3 mt-0.5">location_on</span>
          <div>
            <h4 className="text-sm font-semibold text-amber-800 mb-1">Contact Information</h4>
            <p className="text-sm text-amber-700">
              This information will be used for official correspondence and can be displayed
              to residents. All fields are optional but recommended for better communication.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
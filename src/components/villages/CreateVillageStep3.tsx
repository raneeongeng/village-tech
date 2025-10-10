'use client'

import { CreateVillageFormData, TIMEZONES, CURRENCIES, DATE_FORMATS } from '@/types/village'

interface CreateVillageStep3Props {
  formData: CreateVillageFormData
  onUpdate: (updates: Partial<CreateVillageFormData>) => void
  validationErrors: { [key: string]: string }
  loading?: boolean
}

export function CreateVillageStep3({
  formData,
  onUpdate,
  validationErrors,
  loading = false
}: CreateVillageStep3Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Village Settings</h3>
        <p className="text-gray-600 mb-6">
          Configure system preferences and operational settings for the village.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timezone */}
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            id="timezone"
            value={formData.timezone || 'America/New_York'}
            onChange={(e) => onUpdate({ timezone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={loading}
          >
            {TIMEZONES.map((timezone) => (
              <option key={timezone.value} value={timezone.value}>
                {timezone.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">Default timezone for all village operations</p>
        </div>

        {/* Currency */}
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            id="currency"
            value={formData.currency || 'USD'}
            onChange={(e) => onUpdate({ currency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={loading}
          >
            {CURRENCIES.map((currency) => (
              <option key={currency.value} value={currency.value}>
                {currency.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">Currency used for fees and financial transactions</p>
        </div>

        {/* Date Format */}
        <div>
          <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 mb-2">
            Date Format
          </label>
          <select
            id="dateFormat"
            value={formData.dateFormat || 'MM/DD/YYYY'}
            onChange={(e) => onUpdate({ dateFormat: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={loading}
          >
            {DATE_FORMATS.map((format) => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">How dates will be displayed throughout the system</p>
        </div>

        {/* Enable Notifications */}
        <div className="flex items-center">
          <div className="flex items-center h-5">
            <input
              id="notificationsEnabled"
              type="checkbox"
              checked={formData.notificationsEnabled !== false}
              onChange={(e) => onUpdate({ notificationsEnabled: e.target.checked })}
              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
              disabled={loading}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="notificationsEnabled" className="font-medium text-gray-700">
              Enable Notifications
            </label>
            <p className="text-gray-500">Allow the system to send email and in-app notifications</p>
          </div>
        </div>
      </div>

      {/* Settings Preview */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Settings Preview</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Timezone:</span>
            <span className="ml-2 text-gray-800">
              {TIMEZONES.find(tz => tz.value === formData.timezone)?.label || 'Eastern Time (ET)'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Currency:</span>
            <span className="ml-2 text-gray-800">
              {CURRENCIES.find(curr => curr.value === formData.currency)?.label || 'US Dollar ($)'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Date Format:</span>
            <span className="ml-2 text-gray-800">
              {formData.dateFormat || 'MM/DD/YYYY'} (Today: {new Date().toLocaleDateString()})
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Notifications:</span>
            <span className="ml-2 text-gray-800">
              {formData.notificationsEnabled !== false ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="material-icons-outlined text-green-500 mr-3 mt-0.5">settings</span>
          <div>
            <h4 className="text-sm font-semibold text-green-800 mb-1">System Configuration</h4>
            <p className="text-sm text-green-700">
              These settings will be applied system-wide for all village operations. You can
              modify these settings later from the village administration panel.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
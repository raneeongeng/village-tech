'use client'

import { CreateVillageFormData, LookupValue, TIMEZONES, CURRENCIES, DATE_FORMATS, REGIONS } from '@/types/village'

interface CreateVillageStep5Props {
  formData: CreateVillageFormData
  validationErrors: { [key: string]: string }
  villageStatuses: LookupValue[]
  loading?: boolean
}

export function CreateVillageStep5({
  formData,
  validationErrors,
  villageStatuses,
  loading = false
}: CreateVillageStep5Props) {
  const getStatusName = (statusId: string) => {
    return villageStatuses.find(status => status.id === statusId)?.name || 'Unknown'
  }

  const getTimezoneLabel = (timezone: string) => {
    return TIMEZONES.find(tz => tz.value === timezone)?.label || timezone
  }

  const getCurrencyLabel = (currency: string) => {
    return CURRENCIES.find(curr => curr.value === currency)?.label || currency
  }

  const getRegionLabel = (region: string) => {
    return REGIONS.find(reg => reg.value === region)?.label || region
  }

  const formatAdminName = () => {
    return [
      formData.adminFirstName,
      formData.adminMiddleName,
      formData.adminLastName,
      formData.adminSuffix
    ].filter(Boolean).join(' ')
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Village Creation</h3>
        <p className="text-gray-600 mb-6">
          Please review all the information below before creating the village. You can go back to make any changes.
        </p>
      </div>

      {/* Village Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
          <span className="material-icons-outlined text-primary mr-2">location_city</span>
          Village Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-600">Village Name:</span>
            <p className="text-sm text-gray-900 mt-1">{formData.name}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Status:</span>
            <p className="text-sm text-gray-900 mt-1">{getStatusName(formData.statusId)}</p>
          </div>
          {formData.description && (
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">Description:</span>
              <p className="text-sm text-gray-900 mt-1">{formData.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
          <span className="material-icons-outlined text-primary mr-2">place</span>
          Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.address && (
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">Address:</span>
              <p className="text-sm text-gray-900 mt-1">{formData.address}</p>
            </div>
          )}
          {formData.contactPhone && (
            <div>
              <span className="text-sm font-medium text-gray-600">Contact Phone:</span>
              <p className="text-sm text-gray-900 mt-1">{formData.contactPhone}</p>
            </div>
          )}
          {formData.contactEmail && (
            <div>
              <span className="text-sm font-medium text-gray-600">Contact Email:</span>
              <p className="text-sm text-gray-900 mt-1">{formData.contactEmail}</p>
            </div>
          )}
          {formData.region && (
            <div>
              <span className="text-sm font-medium text-gray-600">Region:</span>
              <p className="text-sm text-gray-900 mt-1">{getRegionLabel(formData.region)}</p>
            </div>
          )}
        </div>
        {!formData.address && !formData.contactPhone && !formData.contactEmail && !formData.region && (
          <p className="text-sm text-gray-500 italic">No additional details provided</p>
        )}
      </div>

      {/* Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
          <span className="material-icons-outlined text-primary mr-2">settings</span>
          Settings
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-600">Timezone:</span>
            <p className="text-sm text-gray-900 mt-1">{getTimezoneLabel(formData.timezone || '')}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Currency:</span>
            <p className="text-sm text-gray-900 mt-1">{getCurrencyLabel(formData.currency || '')}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Date Format:</span>
            <p className="text-sm text-gray-900 mt-1">{formData.dateFormat}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Notifications:</span>
            <p className="text-sm text-gray-900 mt-1">
              {formData.notificationsEnabled !== false ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>
      </div>

      {/* Admin Head */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
          <span className="material-icons-outlined text-primary mr-2">admin_panel_settings</span>
          Admin Head
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-600">Name:</span>
            <p className="text-sm text-gray-900 mt-1">{formatAdminName()}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Email:</span>
            <p className="text-sm text-gray-900 mt-1">{formData.adminEmail}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Role:</span>
            <p className="text-sm text-gray-900 mt-1">Admin Head</p>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="material-icons-outlined text-amber-500 mr-3 mt-0.5">info</span>
          <div>
            <h4 className="text-sm font-semibold text-amber-800 mb-2">Important Notes</h4>
            <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
              <li>The village and admin head account will be created simultaneously</li>
              <li>A password setup email will be sent to the admin head&apos;s email address</li>
              <li>The admin head will have full administrative access to this village</li>
              <li>All settings can be modified later from the village administration panel</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Final Validation Error */}
      {validationErrors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="material-icons-outlined text-red-500 mr-2">error</span>
            <span className="text-red-800">{validationErrors.submit}</span>
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import { CreateVillageFormData, LookupValue } from '@/types/village'

interface CreateVillageStep1Props {
  formData: CreateVillageFormData
  onUpdate: (updates: Partial<CreateVillageFormData>) => void
  validationErrors: { [key: string]: string }
  villageStatuses: LookupValue[]
  loading?: boolean
}

export function CreateVillageStep1({
  formData,
  onUpdate,
  validationErrors,
  villageStatuses,
  loading = false
}: CreateVillageStep1Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <p className="text-gray-600 mb-6">
          Enter the fundamental details for your new village community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Village Name */}
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Village Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Enter village name"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              validationErrors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {validationErrors.name && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">2-100 characters</p>
        </div>

        {/* Village Status */}
        <div>
          <label htmlFor="statusId" className="block text-sm font-medium text-gray-700 mb-2">
            Village Status <span className="text-red-500">*</span>
          </label>
          <select
            id="statusId"
            value={formData.statusId}
            onChange={(e) => onUpdate({ statusId: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              validationErrors.statusId ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading}
          >
            <option value="">Select village status</option>
            {villageStatuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
          {validationErrors.statusId && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.statusId}</p>
          )}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Brief description of the village community"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">Optional field</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="material-icons-outlined text-blue-500 mr-3 mt-0.5">info</span>
          <div>
            <h4 className="text-sm font-semibold text-blue-800 mb-1">Getting Started</h4>
            <p className="text-sm text-blue-700">
              Choose a unique and descriptive name for your village. The status determines whether the village
              is immediately active or pending approval. You can always change these details later.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
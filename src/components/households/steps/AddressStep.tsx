'use client'

import { UseCreateHouseholdResult } from '@/types/household'
import { AddressInfoSchema } from '@/lib/validations/household'
import { useState } from 'react'

interface AddressStepProps {
  hookData: UseCreateHouseholdResult
}

export function AddressStep({ hookData }: AddressStepProps) {
  const { formData, updateAddressInfo } = hookData
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof typeof formData.address, value: string) => {
    const updatedAddress = {
      ...formData.address,
      [field]: value,
    }

    updateAddressInfo(updatedAddress)

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  const handleBlur = (field: keyof typeof formData.address) => {
    try {
      AddressInfoSchema.parse(formData.address)
      setErrors(prev => ({ ...prev, [field]: '' }))
    } catch (error: any) {
      const fieldError = error.errors?.find((err: any) => err.path[0] === field)
      if (fieldError) {
        setErrors(prev => ({
          ...prev,
          [field]: fieldError.message,
        }))
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Step Description */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Where is your household located?
        </h3>
        <p className="text-sm text-gray-600">
          Please provide the address information for your household. This will help us
          identify your location within the village.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Lot Number */}
        <div>
          <label htmlFor="lotNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Lot Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lotNumber"
            value={formData.address.lotNumber}
            onChange={(e) => handleInputChange('lotNumber', e.target.value)}
            onBlur={() => handleBlur('lotNumber')}
            placeholder="e.g., 123, A-15, Block 2 Lot 5"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
              errors.lotNumber ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.lotNumber && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span className="material-icons-outlined text-xs">error</span>
              {errors.lotNumber}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Enter your lot number as it appears on your property documents
          </p>
        </div>

        {/* Street Name */}
        <div>
          <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
            Street Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="street"
            value={formData.address.street}
            onChange={(e) => handleInputChange('street', e.target.value)}
            onBlur={() => handleBlur('street')}
            placeholder="e.g., Mango Street, Acacia Avenue, Main Road"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
              errors.street ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.street && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span className="material-icons-outlined text-xs">error</span>
              {errors.street}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Enter the street name where your household is located
          </p>
        </div>

        {/* Full Address Preview */}
        {(formData.address.lotNumber || formData.address.street) && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Address Preview:</p>
            <p className="text-sm text-gray-900">
              {formData.address.lotNumber} {formData.address.street}
            </p>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="material-icons-outlined text-blue-500 text-sm mt-0.5 mr-3">
            info
          </span>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Address Guidelines:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Use the lot number exactly as it appears on your property documents</li>
              <li>Include any block or phase information in the lot number if applicable</li>
              <li>Use the official street name recognized by the village administration</li>
              <li>Contact the village office if you&apos;re unsure about your exact address</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
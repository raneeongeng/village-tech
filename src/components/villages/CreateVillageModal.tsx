'use client'

import { useState } from 'react'
import { CreateVillageFormData, CreateVillageStep, LookupValue } from '@/types/village'
import { useCreateVillage } from '@/hooks/useCreateVillage'
import { useLookupValues } from '@/hooks/useLookupValues'
import { CreateVillageStep1 } from './CreateVillageStep1'
import { CreateVillageStep2 } from './CreateVillageStep2'
import { CreateVillageStep3 } from './CreateVillageStep3'
import { CreateVillageStep4 } from './CreateVillageStep4'
import { CreateVillageStep5 } from './CreateVillageStep5'

interface CreateVillageModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const STEP_NAMES = {
  1: 'Basic Information',
  2: 'Details',
  3: 'Settings',
  4: 'Members',
  5: 'Confirm',
} as const

const initialFormData: CreateVillageFormData = {
  // Step 1
  name: '',
  statusId: '',
  description: '',
  // Step 2
  address: '',
  contactPhone: '',
  contactEmail: '',
  region: '',
  // Step 3
  timezone: 'America/New_York',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  notificationsEnabled: true,
  // Step 4
  adminFirstName: '',
  adminMiddleName: '',
  adminLastName: '',
  adminSuffix: '',
  adminEmail: '',
  adminPassword: '',
  adminRoleId: '',
}

export function CreateVillageModal({ isOpen, onClose, onSuccess }: CreateVillageModalProps) {
  const [currentStep, setCurrentStep] = useState<CreateVillageStep>(1)
  const [formData, setFormData] = useState<CreateVillageFormData>(initialFormData)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})

  const { creating, createVillage } = useCreateVillage()
  const { villageStatuses, loading: lookupLoading, getAdminHeadRoleId } = useLookupValues()

  if (!isOpen) return null

  const updateFormData = (updates: Partial<CreateVillageFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    // Clear validation errors for updated fields
    const updatedFields = Object.keys(updates)
    setValidationErrors(prev => {
      const newErrors = { ...prev }
      updatedFields.forEach(field => {
        delete newErrors[field]
      })
      return newErrors
    })
  }

  const validateCurrentStep = (): boolean => {
    const errors: { [key: string]: string } = {}

    switch (currentStep) {
      case 1:
        if (!formData.name.trim()) {
          errors.name = 'Village name is required'
        } else if (formData.name.length < 2 || formData.name.length > 100) {
          errors.name = 'Village name must be 2-100 characters'
        }
        if (!formData.statusId) {
          errors.statusId = 'Village status is required'
        }
        break

      case 2:
        // All fields in step 2 are optional, but validate format if provided
        if (formData.contactEmail && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.contactEmail)) {
          errors.contactEmail = 'Please enter a valid email address'
        }
        break

      case 3:
        // All fields in step 3 have defaults, so no validation needed
        break

      case 4:
        if (!formData.adminFirstName.trim()) {
          errors.adminFirstName = 'First name is required'
        }
        if (!formData.adminLastName.trim()) {
          errors.adminLastName = 'Last name is required'
        }
        if (!formData.adminEmail.trim()) {
          errors.adminEmail = 'Email is required'
        } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.adminEmail)) {
          errors.adminEmail = 'Please enter a valid email address'
        }
        if (!formData.adminPassword.trim()) {
          errors.adminPassword = 'Password is required'
        } else if (formData.adminPassword.length < 8) {
          errors.adminPassword = 'Password must be at least 8 characters long'
        }
        break

      case 5:
        // Final validation before submission
        break
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 5) {
        setCurrentStep((prev) => (prev + 1) as CreateVillageStep)
      } else {
        handleSubmit()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as CreateVillageStep)
    }
  }

  const handleSubmit = async () => {
    console.log('[CreateVillageModal] handleSubmit called', { formData, lookupLoading })

    // Check if lookup data is still loading
    if (lookupLoading) {
      console.log('[CreateVillageModal] Lookup data still loading')
      setValidationErrors({ submit: 'System data is still loading. Please wait a moment and try again.' })
      return
    }

    // Set admin role ID if not set
    const adminRoleId = formData.adminRoleId || await getAdminHeadRoleId()
    console.log('[CreateVillageModal] Admin role ID:', adminRoleId)

    if (!adminRoleId) {
      console.log('[CreateVillageModal] No admin role ID found')
      setValidationErrors({ adminRoleId: 'Admin head role not found. Please check system configuration.' })
      return
    }

    const submitData = { ...formData, adminRoleId }
    console.log('[CreateVillageModal] Calling createVillage with data:', submitData)
    const result = await createVillage(submitData)

    if (result.success) {
      // Reset form and close modal
      setFormData(initialFormData)
      setCurrentStep(1)
      setValidationErrors({})
      onSuccess()
      onClose()
    } else {
      // Handle error - show in validation errors
      setValidationErrors({ submit: result.error?.message || 'Failed to create village' })
    }
  }

  const handleClose = () => {
    if (!creating) {
      setFormData(initialFormData)
      setCurrentStep(1)
      setValidationErrors({})
      onClose()
    }
  }

  const renderStepContent = () => {
    const commonProps = {
      formData,
      onUpdate: updateFormData,
      validationErrors,
      villageStatuses,
      loading: lookupLoading || creating,
    }

    switch (currentStep) {
      case 1:
        return <CreateVillageStep1 {...commonProps} />
      case 2:
        return <CreateVillageStep2 {...commonProps} />
      case 3:
        return <CreateVillageStep3 {...commonProps} />
      case 4:
        return <CreateVillageStep4 {...commonProps} />
      case 5:
        return <CreateVillageStep5 {...commonProps} />
      default:
        return null
    }
  }

  const getStepClasses = (step: number) => {
    if (step < currentStep) {
      return 'bg-primary text-white' // Completed
    } else if (step === currentStep) {
      return 'bg-primary text-white' // Active
    } else {
      return 'bg-gray-200 text-gray-600' // Pending
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Village</h2>
            <p className="text-gray-600 mt-1">Set up a new village community with guided configuration</p>
          </div>
          <button
            onClick={handleClose}
            disabled={creating}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <span className="material-icons-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getStepClasses(step)}`}>
                  {step}
                </div>
                {index < 4 && (
                  <div className={`h-0.5 w-16 mx-2 ${step < currentStep ? 'bg-primary' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderStepContent()}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Step {currentStep} of 5: {STEP_NAMES[currentStep]}
          </div>

          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                disabled={creating}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={creating || lookupLoading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {creating ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin material-icons-outlined text-sm">refresh</span>
                  Creating...
                </span>
              ) : lookupLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin material-icons-outlined text-sm">refresh</span>
                  Loading...
                </span>
              ) : currentStep === 5 ? (
                'Create Village'
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </div>

        {/* Global Error Display */}
        {validationErrors.submit && (
          <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="material-icons-outlined text-red-500 mr-2">error</span>
              <span className="text-red-800">{validationErrors.submit}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
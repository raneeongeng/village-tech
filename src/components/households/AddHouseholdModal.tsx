'use client'

import { useEffect } from 'react'
import { useCreateHousehold } from '@/hooks/useCreateHousehold'
import { AddHouseholdModalProps } from '@/types/household'
import { AddressStep } from './steps/AddressStep'
import { HouseholdHeadStep } from './steps/HouseholdHeadStep'
// MembersStep removed - members will be managed separately

export function AddHouseholdModal({
  isOpen,
  onClose,
  onSuccess,
}: AddHouseholdModalProps) {
  const createHouseholdHook = useCreateHousehold()

  const {
    currentStep,
    totalSteps,
    progress,
    loading,
    error,
    canGoBack,
    canProceedToNext,
    isLastStep,
    goToNextStep,
    goToPrevStep,
    createHousehold,
    reset,
    validateCurrentStep,
  } = createHouseholdHook

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset()
    }
  }, [isOpen, reset])

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      reset()
      onClose()
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (loading) {
      return
    }

    try {
      const result = await createHousehold()

      if (result.success) {
        // Mock household object for onSuccess callback
        const mockHousehold = {
          id: result.data?.household_id || '',
          tenant_id: '',
          household_head_id: result.data?.user_id || '',
          household_head: {
            id: result.data?.user_id || '',
            email: createHouseholdHook.formData.householdHead.email,
            first_name: createHouseholdHook.formData.householdHead.firstName,
            middle_name: createHouseholdHook.formData.householdHead.middleName,
            last_name: createHouseholdHook.formData.householdHead.lastName,
            is_active: true,
          },
          address: `${createHouseholdHook.formData.address.lotNumber} ${createHouseholdHook.formData.address.street}`,
          status_id: '',
          status: {
            id: '',
            code: 'pending_approval' as const,
            name: 'Pending Approval',
            color_code: '#FFA500',
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        onSuccess(mockHousehold)
        handleClose()
      }
    } catch (error) {
      console.error('Error submitting household application:', error)
    }
  }

  // Handle next step
  const handleNext = () => {
    if (isLastStep) {
      handleSubmit()
    } else {
      goToNextStep()
    }
  }

  // Get step title
  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Address Information'
      case 2:
        return 'Household Head Details'
      default:
        return 'Household Application'
    }
  }

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <AddressStep hookData={createHouseholdHook} />
      case 2:
        return <HouseholdHeadStep hookData={createHouseholdHook} />
      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              New Household Application
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {currentStep} of {totalSteps}: {getStepTitle()}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <span className="material-icons-outlined">close</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600">Progress</span>
            <span className="text-xs text-gray-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }, (_, index) => {
              const stepNumber = index + 1
              const isActive = stepNumber === currentStep
              const isCompleted = stepNumber < currentStep
              const isAvailable = stepNumber <= currentStep

              return (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-primary text-white'
                        : isAvailable
                        ? 'bg-gray-200 text-gray-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <span className="material-icons-outlined text-sm">check</span>
                    ) : (
                      stepNumber
                    )}
                  </div>
                  {stepNumber < totalSteps && (
                    <div
                      className={`w-16 h-0.5 ml-2 ${
                        stepNumber < currentStep ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[50vh]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <span className="material-icons-outlined text-red-500 text-sm mt-0.5 mr-2">
                  error
                </span>
                <div>
                  <p className="text-sm font-medium text-red-800">{error.message}</p>
                  {error.details && (
                    <p className="text-sm text-red-600 mt-1">
                      {error.details}
                    </p>
                  )}
                  {error.message === 'No tenant selected' && (
                    <p className="text-sm text-red-600 mt-1">
                      Please refresh the page or contact your administrator.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPrevStep}
              disabled={!canGoBack || loading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleNext}
                disabled={!validateCurrentStep() || loading}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title={
                  loading
                    ? 'Processing...'
                    : validateCurrentStep()
                    ? 'Ready to submit'
                    : 'Please ensure all required fields are filled correctly and meet validation requirements'
                }
              >
                {loading && (
                  <span className="animate-spin material-icons-outlined text-sm">
                    refresh
                  </span>
                )}
                {loading
                  ? 'Processing...'
                  : isLastStep
                  ? 'Submit Application'
                  : 'Next'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
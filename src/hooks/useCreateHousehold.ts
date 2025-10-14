'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useHouseholdLookupData, useHouseholdLookupUtils } from '@/hooks/useHouseholdLookupData'
import {
  NewHouseholdFormData,
  transformFormDataToAPI,
  defaultFormValues,
  AddressInfoSchema,
  HouseholdHeadInfoSchema,
} from '@/lib/validations/household'
import {
  UseCreateHouseholdResult,
  ApiResponse,
  CreateHouseholdResponse,
} from '@/types/household'

/**
 * Hook for creating new household applications with multi-step form management
 */
export function useCreateHousehold(): UseCreateHouseholdResult {
  const { user, session } = useAuth()
  const lookupData = useHouseholdLookupData()
  const lookupUtils = useHouseholdLookupUtils(lookupData)

  // Get tenant from authenticated user (same as HeadAdminDashboard)
  const tenantId = (user as any)?.tenant?.id || session?.tenant?.id

  // Debug: log tenant state
  useEffect(() => {
    console.log('🏘️ Tenant info in useCreateHousehold:', {
      tenantId,
      user,
      tenant: (user as any)?.tenant,
      session,
    })
  }, [tenantId, user, session])

  // Form state
  const [formData, setFormData] = useState<NewHouseholdFormData>(defaultFormValues)
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<Error | null>(null)

  // Step management (simplified to 2 steps: address + household head)
  const totalSteps = 2
  const canGoBack = currentStep > 1
  const canGoForward = currentStep < totalSteps
  const isLastStep = currentStep === totalSteps

  // Update progress based on current step
  const updateProgress = useCallback((step: number) => {
    const stepProgress = ((step - 1) / (totalSteps - 1)) * 100
    setProgress(stepProgress)
  }, [totalSteps])

  // Navigation helpers
  const goToNextStep = useCallback(() => {
    if (canGoForward) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      updateProgress(nextStep)
    }
  }, [currentStep, canGoForward, updateProgress])

  const goToPrevStep = useCallback(() => {
    if (canGoBack) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      updateProgress(prevStep)
    }
  }, [currentStep, canGoBack, updateProgress])

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step)
      updateProgress(step)
    }
  }, [totalSteps, updateProgress])

  // Form data updates
  const updateFormData = useCallback((updates: Partial<NewHouseholdFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates,
    }))
  }, [])

  const updateAddressInfo = useCallback((addressData: NewHouseholdFormData['address']) => {
    setFormData(prev => ({
      ...prev,
      address: addressData,
    }))
  }, [])

  const updateHouseholdHeadInfo = useCallback((headData: NewHouseholdFormData['householdHead']) => {
    setFormData(prev => ({
      ...prev,
      householdHead: headData,
    }))
  }, [])

  // Member management removed from creation flow

  // Email availability check
  const checkEmailAvailability = useCallback(async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('check_email_availability', {
          email_address: email,
        })

      if (error) {
        console.error('Error checking email availability:', error)
        throw new Error(`Database function error: ${error.message}`)
      }

      return data?.available || false
    } catch (err) {
      console.error('Error in checkEmailAvailability:', err)
      throw err
    }
  }, [])

  // Main household creation function
  const createHousehold = useCallback(async (
    submissionData?: NewHouseholdFormData
  ): Promise<ApiResponse<CreateHouseholdResponse>> => {
    console.log('🚀 Starting createHousehold...')
    const dataToSubmit = submissionData || formData

    if (!tenantId) {
      console.error('❌ No tenant ID found in user session')
      const error = new Error('No tenant selected')
      setError(error)
      setLoading(false)
      return {
        success: false,
        error: {
          message: 'No tenant selected',
          details: 'Please log in again or contact your administrator',
        },
      }
    }

    console.log('✓ Tenant ID:', tenantId)

    // Get pending status ID
    const pendingStatusId = lookupUtils.getPendingStatusId()
    if (!pendingStatusId) {
      console.error('❌ Pending status ID not found')
      return {
        success: false,
        error: {
          message: 'System configuration error',
          details: 'Pending status not found in system configuration',
        },
      }
    }

    console.log('✓ Pending status ID:', pendingStatusId)

    setLoading(true)
    setError(null)
    setProgress(0)

    try {
      // Step 1: Check email availability (20% progress)
      console.log('📧 Checking email availability...')
      setProgress(20)
      const emailAvailable = await checkEmailAvailability(dataToSubmit.householdHead.email)

      if (!emailAvailable) {
        console.error('❌ Email already exists')
        return {
          success: false,
          error: {
            message: 'Email already exists',
            details: 'This email address is already registered in the system',
          },
        }
      }

      console.log('✓ Email available')

      // Step 2: Create auth user account (40% progress)
      console.log('🔐 Creating auth user account...')
      setProgress(40)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dataToSubmit.householdHead.email,
        password: dataToSubmit.householdHead.password,
        options: {
          emailRedirectTo: undefined, // No email confirmation - auto-confirm like head admin
          data: {
            skip_auto_insert: 'true', // Skip auto-insert, we'll create user record via database function
            first_name: dataToSubmit.householdHead.firstName,
            last_name: dataToSubmit.householdHead.lastName,
            phone: dataToSubmit.householdHead.phone,
          },
        },
      })

      if (authError) {
        console.error('❌ Auth error:', authError)
        throw new Error(`Authentication error: ${authError.message}`)
      }

      if (!authData.user) {
        console.error('❌ No user data returned')
        throw new Error('Failed to create user account')
      }

      console.log('✓ Auth user created:', authData.user.id)

      // Step 3: Transform form data to API format (60% progress)
      console.log('📝 Transforming form data...')
      setProgress(60)
      const { householdData, headUserData, memberData } = transformFormDataToAPI(
        dataToSubmit,
        tenantId,
        pendingStatusId
      )

      // Add auth user ID and role ID to head user data
      const householdHeadRoleId = lookupUtils.getHouseholdHeadRoleId()

      if (!householdHeadRoleId) {
        throw new Error('Household head role not found in system configuration')
      }

      const completeHeadUserData = {
        ...headUserData,
        auth_user_id: authData.user.id,
        role_id: householdHeadRoleId, // User role ID for household_head
      }

      console.log('📦 Data prepared:', { householdData, completeHeadUserData, memberData })

      // Step 4: Create household with members using database function (80% progress)
      console.log('🏠 Creating household in database...')
      setProgress(80)
      const { data: householdResult, error: householdError } = await supabase
        .rpc('create_household_with_members', {
          household_data: householdData,
          head_user_data: completeHeadUserData,
          member_data: memberData,
        })

      console.log('Database result:', { householdResult, householdError })

      if (householdError) {
        console.error('❌ Database error:', householdError)
        throw new Error(`Database error: ${householdError.message}`)
      }

      if (!householdResult || !householdResult.success) {
        console.error('❌ Household creation failed:', householdResult)
        throw new Error(householdResult?.error || 'Failed to create household')
      }

      // Step 5: Complete (100% progress)
      console.log('✅ Household created successfully!')
      setProgress(100)

      return {
        success: true,
        data: {
          household_id: householdResult.household_id,
          user_id: householdResult.user_id,
          success: true,
        },
      }

    } catch (err) {
      console.error('Error creating household:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'

      setError(err as Error)

      return {
        success: false,
        error: {
          message: 'Failed to create household',
          details: errorMessage,
        },
      }
    } finally {
      setLoading(false)
    }
  }, [formData, tenantId, lookupUtils, checkEmailAvailability])

  // Reset form to initial state
  const reset = useCallback(() => {
    setFormData(defaultFormValues)
    setCurrentStep(1)
    setProgress(0)
    setError(null)
    setLoading(false)
  }, [])

  // Step validation helpers (only 2 steps now)
  const validateCurrentStep = useCallback((): boolean => {
    try {
      switch (currentStep) {
        case 1:
          AddressInfoSchema.parse(formData.address)
          return true
        case 2:
          console.log('Validating step 2 with data:', {
            password: formData.householdHead.password,
            confirmPassword: formData.householdHead.confirmPassword,
            passwordLength: formData.householdHead.password.length,
            confirmPasswordLength: formData.householdHead.confirmPassword.length,
            match: formData.householdHead.password === formData.householdHead.confirmPassword,
          })
          HouseholdHeadInfoSchema.parse(formData.householdHead)
          return true
        default:
          return false
      }
    } catch (error) {
      // Validation failed
      console.log('Validation error:', error)
      return false
    }
  }, [currentStep, formData])

  const canProceedToNext = validateCurrentStep() && canGoForward

  return {
    // Form data
    formData,
    currentStep,
    totalSteps,

    // Progress and state
    progress,
    loading,
    error,

    // Navigation
    canGoBack,
    canGoForward,
    canProceedToNext,
    isLastStep,
    goToNextStep,
    goToPrevStep,
    goToStep,

    // Form updates
    updateFormData,
    updateAddressInfo,
    updateHouseholdHeadInfo,

    // Validation
    validateCurrentStep,
    checkEmailAvailability,

    // Actions
    createHousehold,
    reset,
  }
}
'use client'

import { UseCreateHouseholdResult } from '@/types/household'
import { HouseholdHeadInfoSchema } from '@/lib/validations/household'
import { useState, useCallback } from 'react'

interface HouseholdHeadStepProps {
  hookData: UseCreateHouseholdResult
}

export function HouseholdHeadStep({ hookData }: HouseholdHeadStepProps) {
  const { formData, updateHouseholdHeadInfo, checkEmailAvailability } = hookData
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Password strength validation
  const passwordChecks = {
    minLength: formData.householdHead.password.length >= 8,
    hasLowercase: /[a-z]/.test(formData.householdHead.password),
    hasUppercase: /[A-Z]/.test(formData.householdHead.password),
    hasNumber: /\d/.test(formData.householdHead.password),
  }

  // Password match validation
  const passwordsMatch = formData.householdHead.password &&
    formData.householdHead.confirmPassword &&
    formData.householdHead.password === formData.householdHead.confirmPassword

  const handleInputChange = (field: keyof typeof formData.householdHead, value: string) => {
    const updatedHead = {
      ...formData.householdHead,
      [field]: value,
    }

    updateHouseholdHeadInfo(updatedHead)

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  const handleEmailCheck = useCallback(async (email: string) => {
    if (!email || errors.email) return

    setCheckingEmail(true)
    try {
      const isAvailable = await checkEmailAvailability(email)

      if (!isAvailable) {
        setErrors(prev => ({
          ...prev,
          email: 'This email address is already registered',
        }))
      }
    } catch (error) {
      console.error('Error checking email:', error)
    } finally {
      setCheckingEmail(false)
    }
  }, [checkEmailAvailability, errors.email])

  const handleBlur = (field: keyof typeof formData.householdHead) => {
    try {
      // For email, also check availability
      if (field === 'email' && formData.householdHead.email) {
        handleEmailCheck(formData.householdHead.email)
      }

      HouseholdHeadInfoSchema.parse(formData.householdHead)
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
          Household Head Information
        </h3>
        <p className="text-sm text-gray-600">
          Please provide the personal details of the household head. This person will be
          the primary contact and will have access to manage the household account.
        </p>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            value={formData.householdHead.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            placeholder="Juan"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span className="material-icons-outlined text-xs">error</span>
              {errors.firstName}
            </p>
          )}
        </div>

        {/* Middle Name */}
        <div>
          <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">
            Middle Name
          </label>
          <input
            type="text"
            id="middleName"
            value={formData.householdHead.middleName || ''}
            onChange={(e) => handleInputChange('middleName', e.target.value)}
            onBlur={() => handleBlur('middleName')}
            placeholder="Carlos"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
              errors.middleName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.middleName && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span className="material-icons-outlined text-xs">error</span>
              {errors.middleName}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            value={formData.householdHead.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            placeholder="Dela Cruz"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span className="material-icons-outlined text-xs">error</span>
              {errors.lastName}
            </p>
          )}
        </div>

        {/* Suffix */}
        <div>
          <label htmlFor="suffix" className="block text-sm font-medium text-gray-700 mb-1">
            Suffix
          </label>
          <select
            id="suffix"
            value={formData.householdHead.suffix || ''}
            onChange={(e) => handleInputChange('suffix', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
              errors.suffix ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select (Optional)</option>
            <option value="Jr.">Jr.</option>
            <option value="Sr.">Sr.</option>
            <option value="II">II</option>
            <option value="III">III</option>
            <option value="IV">IV</option>
          </select>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.householdHead.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            placeholder="09123456789"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span className="material-icons-outlined text-xs">error</span>
              {errors.phone}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              value={formData.householdHead.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="juan.delacruz@email.com"
              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-primary focus:border-primary ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {checkingEmail && (
              <div className="absolute right-3 top-2.5">
                <span className="animate-spin material-icons-outlined text-gray-400 text-sm">
                  refresh
                </span>
              </div>
            )}
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span className="material-icons-outlined text-xs">error</span>
              {errors.email}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            This email will be used for login and notifications
          </p>
        </div>
      </div>

      {/* Password Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={formData.householdHead.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="Enter password"
              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-primary focus:border-primary ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <span className="material-icons-outlined text-sm">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span className="material-icons-outlined text-xs">error</span>
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={formData.householdHead.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="Confirm password"
              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-primary focus:border-primary ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <span className="material-icons-outlined text-sm">
                {showConfirmPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span className="material-icons-outlined text-xs">error</span>
              {errors.confirmPassword}
            </p>
          )}
          {formData.householdHead.confirmPassword && !errors.confirmPassword && (
            <p className={`mt-1 text-xs flex items-center gap-1 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
              <span className="material-icons-outlined text-xs">
                {passwordsMatch ? 'check_circle' : 'cancel'}
              </span>
              {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
            </p>
          )}
        </div>
      </div>

      {/* Password Requirements */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
        <ul className="space-y-1 text-xs">
          <li className={`flex items-center gap-2 ${passwordChecks.minLength ? 'text-green-600' : 'text-gray-600'}`}>
            <span className="material-icons-outlined text-sm">
              {passwordChecks.minLength ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            At least 8 characters long
          </li>
          <li className={`flex items-center gap-2 ${passwordChecks.hasLowercase ? 'text-green-600' : 'text-gray-600'}`}>
            <span className="material-icons-outlined text-sm">
              {passwordChecks.hasLowercase ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            Contains at least one lowercase letter
          </li>
          <li className={`flex items-center gap-2 ${passwordChecks.hasUppercase ? 'text-green-600' : 'text-gray-600'}`}>
            <span className="material-icons-outlined text-sm">
              {passwordChecks.hasUppercase ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            Contains at least one uppercase letter
          </li>
          <li className={`flex items-center gap-2 ${passwordChecks.hasNumber ? 'text-green-600' : 'text-gray-600'}`}>
            <span className="material-icons-outlined text-sm">
              {passwordChecks.hasNumber ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            Contains at least one number
          </li>
        </ul>
      </div>
    </div>
  )
}
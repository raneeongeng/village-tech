'use client'

import { useState } from 'react'
import { StickerList } from '@/components/stickers/StickerList'
import { OnboardingRequestList } from '@/components/onboarding/OnboardingRequestList'

export default function StickerRequestsPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleRequestSuccess = () => {
    setSuccessMessage('Your sticker request has been submitted successfully! You will receive an email confirmation shortly.')
    setErrorMessage(null)

    // Clear success message after 10 seconds
    setTimeout(() => {
      setSuccessMessage(null)
    }, 10000)
  }

  const handleRequestError = (error: string) => {
    setErrorMessage(error)
    setSuccessMessage(null)
  }

  const clearMessages = () => {
    setSuccessMessage(null)
    setErrorMessage(null)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow p-6 sm:p-8 md:p-12">
        {/* Success Message */}
        {successMessage && (
          <div className="max-w-7xl mx-auto mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-primary">Request Submitted Successfully</h3>
                <p className="mt-1 text-sm text-gray-700">{successMessage}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={clearMessages}
                  className="inline-flex rounded-md bg-primary/10 p-1.5 text-primary hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="max-w-7xl mx-auto mb-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-accent">Submission Failed</h3>
                <p className="mt-1 text-sm text-gray-700">{errorMessage}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={clearMessages}
                  className="inline-flex rounded-md bg-accent/10 p-1.5 text-accent hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Sticker List */}
        <StickerList
          onRequestSuccess={handleRequestSuccess}
          onRequestError={handleRequestError}
        />

        {/* Onboarding Requests Section */}
        <div className="mt-12">
          <OnboardingRequestList />
        </div>
      </main>
    </div>
  )
}
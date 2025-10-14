'use client'

import { useRouter, useParams } from 'next/navigation'
import { useHouseholdDetails } from '@/hooks/useHouseholds'
import { HouseholdDetailsPage } from '@/components/households/HouseholdDetailsPage'

export default function HouseholdDetailPage() {
  const router = useRouter()
  const params = useParams()
  const householdId = params?.id as string

  const {
    household,
    loading,
    error,
    refetch,
  } = useHouseholdDetails(householdId)

  const handleBack = () => {
    router.push('/active-households')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading household details...</p>
        </div>
      </div>
    )
  }

  if (error || !household) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">
            <span className="material-icons-outlined text-6xl">error</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Household Not Found</h1>
          <p className="text-gray-600 mb-4">
            {error?.message || 'The household you are looking for does not exist or you do not have permission to view it.'}
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-3 bg-gray-100 rounded-lg text-left">
              <p className="text-xs text-gray-700 mb-2"><strong>Debug Info:</strong></p>
              <p className="text-xs text-gray-600">Household ID: {householdId}</p>
              <p className="text-xs text-gray-600">Error: {error?.message || 'No household data returned'}</p>
            </div>
          )}
          <div className="space-x-3">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Back to Active Households
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <HouseholdDetailsPage
      household={household}
      onBack={handleBack}
      onRefresh={refetch}
    />
  )
}
'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useVillageDetails } from '@/hooks/useVillageDetails'
import { VillageDetailsHeader } from '@/components/villages/VillageDetailsHeader'
import { BasicInfoCard } from '@/components/villages/BasicInfoCard'
import { AdminHeadCard } from '@/components/villages/AdminHeadCard'
import { DangerZoneCard } from '@/components/villages/DangerZoneCard'
import { RecentActivityTable } from '@/components/villages/RecentActivityTable'
import { MetadataSummary } from '@/components/villages/MetadataSummary'

interface VillageDetailsPageProps {
  params: {
    id: string
  }
}

export default function VillageDetailsPage({ params }: VillageDetailsPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { village, adminHead, metadata, loading, error, refetch } = useVillageDetails(params.id)

  // Check if user has access (superadmin only)
  if (user && user.role?.code !== 'superadmin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <span className="material-icons-outlined text-6xl text-red-400">block</span>
          <h2 className="mt-4 text-xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You don&apos;t have permission to view village details.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-4 mb-8 animate-pulse">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded w-64"></div>
        </div>

        {/* Village name header skeleton */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
        </div>

        {/* Content grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 rounded-lg bg-gray-50">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !village) {
    return (
      <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
        <span className="material-icons-outlined text-6xl text-gray-400">error_outline</span>
        <h2 className="mt-4 text-xl font-bold text-gray-900">Village Not Found</h2>
        <p className="mt-2 text-gray-600">
          {error?.message || "The village you&apos;re looking for doesn&apos;t exist or has been deleted."}
        </p>
        <div className="flex gap-4 justify-center mt-6">
          <button
            onClick={() => router.push('/villages')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Back to Village List
          </button>
          <button
            onClick={refetch}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <VillageDetailsHeader
        villageName={village.name}
        onBack={() => router.push('/villages')}
      />

      {/* Village Name Header */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{village.name}</h2>
            <p className="text-sm text-gray-500">
              Tenant ID: {village.id.substring(0, 8).toUpperCase()}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              village.lookup_values?.name === 'Active'
                ? 'bg-green-100 text-green-800'
                : village.lookup_values?.name === 'Inactive'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {village.lookup_values?.name || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side (2 columns on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <BasicInfoCard village={village} />

          {/* Admin Head Information */}
          <AdminHeadCard
            adminHead={adminHead}
            villageName={village.name}
            onRefresh={refetch}
          />

          {/* Danger Zone */}
          <DangerZoneCard
            village={village}
            onRefresh={refetch}
          />

          {/* Recent Activity */}
          <RecentActivityTable villageId={village.id} />
        </div>

        {/* Right Sidebar (1 column) */}
        <div className="space-y-6">
          <MetadataSummary
            metadata={metadata}
            village={village}
          />
        </div>
      </div>
    </div>
  )
}
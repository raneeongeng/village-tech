'use client'

import { useAuth } from '@/hooks/useAuth'
import { useHeadAdminDashboard } from '@/hooks/useHeadAdminDashboard'
import { StatCard } from './StatCard'
import { FeeCollectionChart } from './FeeCollectionChart'
import { HouseholdGrowthChart } from './HouseholdGrowthChart'
import { QuickActions } from './QuickActions'
import { Announcements } from './Announcements'
import { RecentActivity } from './RecentActivity'

export function HeadAdminDashboard() {
  const { user } = useAuth()

  // Get village ID from user's tenant (for head admin, they belong to a village)
  const villageId = (user as any)?.tenant?.id || ''

  // Debug logging
  console.log('🔍 HeadAdminDashboard - User:', user)
  console.log('🔍 HeadAdminDashboard - villageId:', villageId)
  console.log('🔍 HeadAdminDashboard - tenant object:', (user as any)?.tenant)

  // Check if user has a village assigned
  if (!villageId) {
    return (
      <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
        <span className="material-symbols-outlined text-6xl text-yellow-500">warning</span>
        <h2 className="mt-4 text-xl font-bold text-gray-900">No Village Assigned</h2>
        <p className="mt-2 text-gray-600">
          Your account is not assigned to a village yet. Please contact the system administrator.
        </p>
        <div className="mt-4 p-4 bg-gray-50 rounded text-left text-sm">
          <p className="font-mono text-gray-700">User ID: {user?.id}</p>
          <p className="font-mono text-gray-700">Role: {(user as any)?.role?.code}</p>
          <p className="font-mono text-gray-700">Tenant ID: {villageId || 'Not assigned'}</p>
        </div>
      </div>
    )
  }

  const { stats, charts, announcements, activities, loading, error, refetch } = useHeadAdminDashboard(
    villageId
  )

  console.log('🔍 HeadAdminDashboard - loading:', loading, 'error:', error)

  if (error) {
    return (
      <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
        <span className="material-symbols-outlined text-6xl text-red-400">error</span>
        <h2 className="mt-4 text-xl font-bold text-gray-900">Failed to Load Dashboard</h2>
        <p className="mt-2 text-gray-600">{error.message}</p>
        <button
          onClick={refetch}
          className="mt-6 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-screen-xl mx-auto">
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <span className="material-symbols-outlined">holiday_village</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Village Dashboard</h1>
        </div>
        <p className="text-gray-600">
          Welcome back, {user?.first_name}! Here&apos;s your village overview.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Main Content (2 columns on large) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Statistics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <StatCard
              icon="pending_actions"
              label="Pending Applications"
              value={stats.pendingApps}
              iconColor="primary"
              loading={loading}
            />
            <StatCard
              icon="payments"
              label="Fee Collection"
              value={stats.feeCollectionRate}
              iconColor="green"
              loading={loading}
            />
            <StatCard
              icon="gavel"
              label="Active Rules"
              value={stats.activeRules}
              iconColor="yellow"
              loading={loading}
            />
            <StatCard
              icon="campaign"
              label="Active Announcements"
              value={stats.activeAnnouncements}
              iconColor="purple"
              loading={loading}
            />
            <StatCard
              icon="groups"
              label="Total Households"
              value={stats.totalHouseholds}
              iconColor="primary"
              loading={loading}
            />
            <StatCard
              icon="local_police"
              label="Security Incidents"
              value={stats.securityIncidents}
              iconColor="red"
              loading={loading}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeeCollectionChart
              data={charts.feeHistory}
              loading={loading}
              error={error}
            />
            <HouseholdGrowthChart
              data={charts.householdGrowth}
              loading={loading}
              error={error}
            />
          </div>

          {/* Quick Actions */}
          <QuickActions loading={loading} />
        </div>

        {/* Right Sidebar (1 column) */}
        <div className="lg:col-span-1 space-y-8">
          <Announcements
            announcements={announcements}
            loading={loading}
            error={error}
          />
          <RecentActivity
            activities={activities}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  )
}
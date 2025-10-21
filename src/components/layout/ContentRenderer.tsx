'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useContentView } from '@/hooks/useContentView'
import { usePathname } from 'next/navigation'
import { getNavigationForRole } from '@/lib/config/navigation'
import { InlineComingSoonResponsive } from '@/components/common/InlineComingSoon'
import { getFeatureConfig } from '@/lib/navigation/featureNames'
import { StatCard as DashboardStatCard } from '@/components/dashboard/StatCard'
import { VillageTable } from '@/components/dashboard/VillageTable'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useRecentVillages } from '@/hooks/useRecentVillages'
// Village List components
import { useVillages } from '@/hooks/useVillages'
import { useLookupValues } from '@/hooks/useLookupValues'
import { VillageFilters } from '@/components/villages/VillageFilters'
import { VillageTable as VillageListTable } from '@/components/villages/VillageTable'
import { CreateVillageModal } from '@/components/villages/CreateVillageModal'
import { VillageFilters as VillageFiltersType } from '@/types/village'
import {
  Users,
  Home,
  DollarSign,
  Shield,
  FileText,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { HeadAdminDashboard as HeadAdminDashboardComponent } from '@/components/dashboard/head-admin/HeadAdminDashboard'
// Superadmin dashboard charts
import { FinancialOverviewChart } from '@/components/dashboard/superadmin/FinancialOverviewChart'
import { VillageStatusChart } from '@/components/dashboard/superadmin/VillageStatusChart'

// Dashboard widgets based on user role
function SuperAdminDashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { totalVillages, activeVillages, inactiveVillages, refetchAll } = useDashboardStats()
  const { data: recentVillages, loading: villagesLoading, error: villagesError, refetch: refetchVillages } = useRecentVillages(4)

  const handleCreateSuccess = () => {
    refetchAll()
    refetchVillages()
  }

  // Mock financial data - replace with real data from API later
  const financialData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    expectedIncome: [150000, 160000, 155000, 170000, 165000, 175000],
    currentIncome: [145000, 158000, 150000, 168000, 162000, 170000]
  }

  // Calculate totals
  const totalExpected = financialData.expectedIncome.reduce((a, b) => a + b, 0)
  const totalCurrent = financialData.currentIncome.reduce((a, b) => a + b, 0)
  const collectionRate = totalExpected > 0 ? ((totalCurrent / totalExpected) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      {/* Header with Create New Village Button */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h3 className="text-2xl font-bold text-gray-900">Dashboard Overview</h3>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-bold text-white hover:bg-primary/90 shadow-sm w-full md:w-auto justify-center"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Create New Village
        </button>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        {/* Total Villages Card */}
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-600">Total Villages</p>
            <p className="text-2xl md:text-4xl font-bold text-gray-900">
              {totalVillages.loading ? '...' : totalVillages.data ?? 0}
            </p>
          </div>
          <div className="bg-primary/10 p-3 rounded-full">
            <span className="material-symbols-outlined text-primary text-xl md:text-2xl">holiday_village</span>
          </div>
        </div>

        {/* Active Villages Card */}
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-600">Active Villages</p>
            <p className="text-2xl md:text-4xl font-bold text-gray-900">
              {activeVillages.loading ? '...' : activeVillages.data ?? 0}
            </p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <span className="material-symbols-outlined text-green-500 text-xl md:text-2xl">check_circle</span>
          </div>
        </div>

        {/* Inactive Villages Card */}
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-600">Inactive Villages</p>
            <p className="text-2xl md:text-4xl font-bold text-gray-900">
              {inactiveVillages.loading ? '...' : inactiveVillages.data ?? 0}
            </p>
          </div>
          <div className="bg-red-100 p-3 rounded-full">
            <span className="material-symbols-outlined text-red-500 text-xl md:text-2xl">cancel</span>
          </div>
        </div>

        {/* Total Users Card - Mock data for now */}
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-2xl md:text-4xl font-bold text-gray-900">--</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <span className="material-symbols-outlined text-blue-500 text-xl md:text-2xl">group</span>
          </div>
        </div>
      </div>

      {/* Village Financial Overview */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Village Financial Overview</h3>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <select className="text-sm rounded-lg border-gray-300 bg-white text-gray-600 focus:ring-primary focus:border-primary">
              <option>Last 6 Months</option>
              <option>Last 12 Months</option>
              <option>All Time</option>
            </select>
          </div>
        </div>

        {/* Financial Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-primary/10 p-4 rounded-lg flex items-start gap-4">
            <div className="bg-primary/20 p-2 rounded-full">
              <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Expected Income</p>
              <p className="text-2xl font-bold text-gray-900">
                ₱{totalExpected.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-green-100/70 p-4 rounded-lg flex items-start gap-4">
            <div className="bg-green-200 p-2 rounded-full">
              <span className="material-symbols-outlined text-green-700">paid</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Income</p>
              <p className="text-2xl font-bold text-gray-900">
                ₱{totalCurrent.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-blue-100/70 p-4 rounded-lg flex items-start gap-4">
            <div className="bg-blue-200 p-2 rounded-full">
              <span className="material-symbols-outlined text-blue-700">receipt_long</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Collection Rate</p>
              <p className="text-2xl font-bold text-gray-900">{collectionRate}%</p>
            </div>
          </div>
        </div>

        {/* Financial Charts - Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Financial Overview Bar Chart - Spans 2 columns */}
          <div className="lg:col-span-2 bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Income Comparison</h4>
            <FinancialOverviewChart
              expectedIncome={financialData.expectedIncome}
              currentIncome={financialData.currentIncome}
              labels={financialData.labels}
              loading={false}
            />
          </div>

          {/* Village Status Doughnut Chart - Spans 1 column */}
          <div className="lg:col-span-1 bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Village Status</h4>
            <VillageStatusChart
              active={activeVillages.data ?? 0}
              inactive={inactiveVillages.data ?? 0}
              suspended={0}
              loading={activeVillages.loading || inactiveVillages.loading}
            />
          </div>
        </div>
      </div>

      {/* Recently Created Villages */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Recently Created Villages</h3>
        <VillageTable
          villages={recentVillages}
          loading={villagesLoading}
          error={villagesError}
          onRetry={refetchVillages}
        />
      </div>

      {/* Create Village Modal */}
      <CreateVillageModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}

function AdminHeadDashboard() {
  // Use the new HeadAdminDashboard component with real data
  return <HeadAdminDashboardComponent />
}

function AdminOfficerDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Administrative Tasks</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Households to Process"
          value="12"
          change="New applications"
          icon={<Home className="w-6 h-6 text-blue-600" />}
          color="blue"
        />
        <StatCard
          title="Fee Collections"
          value="₱125,000"
          change="This month"
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          color="green"
        />
        <StatCard
          title="Deliveries Today"
          value="23"
          change="8 pending pickup"
          icon={<FileText className="w-6 h-6 text-orange-600" />}
          color="orange"
        />
      </div>

      <QuickActionsCard
        title="Daily Tasks"
        actions={[
          { label: "Process Household Applications", count: 12, href: "/households" },
          { label: "Update Fee Records", count: 8, href: "/fees" },
          { label: "Manage Delivery Logs", count: 23, href: "/deliveries" },
        ]}
      />
    </div>
  )
}

function HouseholdHeadDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Household Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Outstanding Fees"
          value="₱2,500"
          change="Due Nov 15"
          icon={<DollarSign className="w-6 h-6 text-red-600" />}
          color="red"
        />
        <StatCard
          title="Active Guest Passes"
          value="2"
          change="Valid until tomorrow"
          icon={<Users className="w-6 h-6 text-green-600" />}
          color="green"
        />
        <StatCard
          title="Family Members"
          value="4"
          change="Registered"
          icon={<Home className="w-6 h-6 text-blue-600" />}
          color="blue"
        />
      </div>

      <QuickActionsCard
        title="Quick Actions"
        actions={[
          { label: "Request Guest Pass", count: 0, href: "/guest-passes/new" },
          { label: "Pay Monthly Fees", count: 1, href: "/fees/payment" },
          { label: "Submit Maintenance Request", count: 0, href: "/requests/new" },
          { label: "View Village Rules", count: 0, href: "/rules" },
        ]}
      />
    </div>
  )
}

function SecurityOfficerDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Security Operations</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Entries Today"
          value="147"
          change="+23 from yesterday"
          icon={<Shield className="w-6 h-6 text-green-600" />}
          color="green"
        />
        <StatCard
          title="Active Incidents"
          value="2"
          change="1 high priority"
          icon={<AlertCircle className="w-6 h-6 text-red-600" />}
          color="red"
        />
        <StatCard
          title="Guest Passes"
          value="28"
          change="Valid today"
          icon={<Users className="w-6 h-6 text-blue-600" />}
          color="blue"
        />
        <StatCard
          title="Vehicle Stickers"
          value="12"
          change="Expiring this week"
          icon={<Activity className="w-6 h-6 text-orange-600" />}
          color="orange"
        />
      </div>

      <QuickActionsCard
        title="Security Tasks"
        actions={[
          { label: "Log Visitor Entry", count: 0, href: "/security/entry" },
          { label: "Review Incidents", count: 2, href: "/incidents" },
          { label: "Validate Guest Passes", count: 28, href: "/guest-passes" },
        ]}
      />
    </div>
  )
}

// Supporting components
function StatCard({ title, value, change, icon, color }: {
  title: string
  value: string
  change: string
  icon: React.ReactNode
  color: 'green' | 'blue' | 'red' | 'orange' | 'purple'
}) {
  const colorClasses = {
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    red: 'bg-red-50 border-red-200',
    orange: 'bg-orange-50 border-orange-200',
    purple: 'bg-purple-50 border-purple-200',
  }

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{change}</p>
        </div>
        <div className="ml-4">
          {icon}
        </div>
      </div>
    </div>
  )
}

function QuickActionsCard({ title, actions }: {
  title: string
  actions: Array<{ label: string; count: number; href: string }>
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <span className="text-sm font-medium text-gray-900">
              {action.label}
            </span>
            {action.count > 0 && (
              <span className="px-2 py-1 text-xs font-semibold text-white bg-primary rounded-full">
                {action.count}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function RecentActivityCard({ activities }: { activities: string[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
            <span className="text-sm text-gray-600">{activity}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Village List component
function VillageListContent() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [clientFilters, setClientFilters] = useState({
    search: '',
    statusId: '',
    region: '',
  })

  // Load all villages without filters (server-side data loading)
  const {
    villages: allVillages,
    loading,
    error,
    refetch,
  } = useVillages()

  const {
    villageStatuses,
    loading: lookupLoading,
    error: lookupError,
  } = useLookupValues()

  // Client-side filtering logic
  const filteredVillages = useMemo(() => {
    if (!allVillages) return null

    return allVillages.filter(village => {
      // Search filter (name or ID)
      if (clientFilters.search) {
        const searchTerm = clientFilters.search.toLowerCase()
        const nameMatch = village.name.toLowerCase().includes(searchTerm)
        const idMatch = village.id.toLowerCase().includes(searchTerm)
        if (!nameMatch && !idMatch) return false
      }

      // Status filter
      if (clientFilters.statusId && village.status_id !== clientFilters.statusId) {
        return false
      }

      // Region filter
      if (clientFilters.region && village.settings?.region !== clientFilters.region) {
        return false
      }

      return true
    })
  }, [allVillages, clientFilters])

  // Client-side pagination
  const itemsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)

  const paginatedVillages = useMemo(() => {
    if (!filteredVillages) return null

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredVillages.slice(startIndex, endIndex)
  }, [filteredVillages, currentPage])

  const paginationData = useMemo(() => {
    const totalCount = filteredVillages?.length || 0
    return {
      currentPage,
      totalPages: Math.ceil(totalCount / itemsPerPage),
      totalCount,
      itemsPerPage,
    }
  }, [filteredVillages, currentPage])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [clientFilters])

  const handleCreateSuccess = () => {
    refetch()
  }

  const handleFiltersChange = (newFilters: VillageFiltersType) => {
    setClientFilters({
      search: newFilters.search,
      statusId: newFilters.statusId || '',
      region: newFilters.region || '',
    })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const isLoading = loading || lookupLoading

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">Village List</h1>
            <p className="text-gray-600 mt-1">
              Manage all village tenants and their details.
            </p>
          </div>

          {/* Create New Village Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={isLoading}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-icons-outlined text-xl">add</span>
            Create New Village
          </button>
        </div>
      </div>

      {/* Lookup Error Display */}
      {lookupError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="material-icons-outlined text-red-500 mr-2">error</span>
            <div>
              <h3 className="text-sm font-medium text-red-800">Configuration Error</h3>
              <p className="text-sm text-red-700 mt-1">
                Failed to load system configuration: {lookupError.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <VillageFilters
        filters={clientFilters}
        onFiltersChange={handleFiltersChange}
        villageStatuses={villageStatuses}
        loading={isLoading}
      />

      {/* Village Table */}
      <VillageListTable
        villages={paginatedVillages}
        loading={loading}
        error={error}
        pagination={paginationData}
        villageStatuses={villageStatuses}
        onPageChange={handlePageChange}
        onRefresh={refetch}
      />

      {/* Create Village Modal */}
      <CreateVillageModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}

export function ContentRenderer() {
  const { user } = useAuth()
  const { activeView, setActiveView, isComingSoon } = useContentView()
  const pathname = usePathname()

  // URL sync logic moved to protected layout for all pages

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading user data...</p>
          <p className="text-sm text-gray-500 mt-2">If this persists, check the browser console (F12) for errors</p>
        </div>
      </div>
    )
  }

  const roleCode = user.role.code

  // Render dashboard based on user role
  const renderDashboard = () => {
    switch (roleCode) {
      case 'superadmin':
        return <SuperAdminDashboard />
      case 'admin_head':
        return <AdminHeadDashboard />
      case 'admin_officer':
        return <AdminOfficerDashboard />
      case 'household_head':
        return <HouseholdHeadDashboard />
      case 'security_officer':
        return <SecurityOfficerDashboard />
      default:
        return (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">
              Dashboard not configured for role: {user.role.name}
            </p>
          </div>
        )
    }
  }

  // Render coming soon content if activeView is a coming soon feature
  const renderComingSoon = () => {
    const featureConfig = getFeatureConfig(activeView)
    if (!featureConfig) {
      return (
        <InlineComingSoonResponsive
          featureName="Feature"
          icon="construction"
          description="This feature is currently under development. Check back soon!"
        />
      )
    }

    return (
      <InlineComingSoonResponsive
        featureName={featureConfig.name}
        icon={featureConfig.icon}
        description={featureConfig.description}
      />
    )
  }

  // Main content renderer
  const renderContent = () => {
    // Handle villages view - only for superadmin
    if (activeView === 'villages') {
      if (user.role.code === 'superadmin') {
        return <VillageListContent />
      } else {
        return (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">
              Access denied: Insufficient permissions
            </p>
          </div>
        )
      }
    }


    if (isComingSoon) {
      return renderComingSoon()
    }

    // Show dashboard content if activeView is 'dashboard'
    if (activeView === 'dashboard') {
      // Superadmin and admin_head have their own headers in their dashboard components
      if (user.role.code === 'superadmin' || user.role.code === 'admin_head') {
        return renderDashboard()
      }

      return (
        <>
          {/* Welcome Header - for other roles */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-heading">
              Welcome back, {user.first_name}!
            </h1>
            <p className="text-gray-600 mt-2">
              Logged in as <span className="font-medium" style={{ color: user.role.color_code }}>
                {user.role.name}
              </span>
            </p>
          </div>

          {/* Role-based Dashboard Content */}
          {renderDashboard()}
        </>
      )
    }

    // Fallback for unknown views
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">
          Content not found for view: {activeView}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto min-h-[600px]">
      {renderContent()}
    </div>
  )
}
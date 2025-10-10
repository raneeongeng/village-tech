'use client'

import { useAuth } from '@/hooks/useAuth'
import { useContentView } from '@/hooks/useContentView'
import { hasPermission } from '@/lib/auth'
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
import { InlineComingSoonResponsive } from '@/components/common/InlineComingSoon'
import { getFeatureConfig } from '@/lib/navigation/featureNames'

// Dashboard widgets based on user role
function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Villages"
          value="12"
          change="+2 this month"
          icon={<Home className="w-6 h-6 text-green-600" />}
          color="green"
        />
        <StatCard
          title="Total Users"
          value="1,248"
          change="+89 this week"
          icon={<Users className="w-6 h-6 text-blue-600" />}
          color="blue"
        />
        <StatCard
          title="System Health"
          value="98.9%"
          change="Uptime"
          icon={<Activity className="w-6 h-6 text-purple-600" />}
          color="purple"
        />
        <StatCard
          title="Support Tickets"
          value="23"
          change="5 pending"
          icon={<AlertCircle className="w-6 h-6 text-orange-600" />}
          color="orange"
        />
      </div>
    </div>
  )
}

function AdminHeadDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Village Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Households"
          value="156"
          change="+3 this month"
          icon={<Home className="w-6 h-6 text-green-600" />}
          color="green"
        />
        <StatCard
          title="Monthly Revenue"
          value="₱245,000"
          change="+12.5%"
          icon={<DollarSign className="w-6 h-6 text-blue-600" />}
          color="blue"
        />
        <StatCard
          title="Security Alerts"
          value="3"
          change="2 resolved today"
          icon={<Shield className="w-6 h-6 text-red-600" />}
          color="red"
        />
        <StatCard
          title="Pending Approvals"
          value="8"
          change="Guest passes & permits"
          icon={<Clock className="w-6 h-6 text-orange-600" />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActionsCard
          title="Management Actions"
          actions={[
            { label: "Approve Guest Passes", count: 5, href: "/guest-passes" },
            { label: "Review Fee Payments", count: 12, href: "/fees" },
            { label: "Security Incidents", count: 2, href: "/security" },
            { label: "Village Rules Updates", count: 1, href: "/rules" },
          ]}
        />
        <RecentActivityCard
          activities={[
            "New household registration approved",
            "Monthly fee payment received from Lot 245",
            "Security incident reported at Gate 2",
            "Construction permit submitted for Lot 123",
          ]}
        />
      </div>
    </div>
  )
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

export default function DashboardPage() {
  const { user } = useAuth()
  const { activeView, isComingSoon } = useContentView()

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading user data...</p>
        </div>
      </div>
    )
  }

  const roleCode = user.role.code

  // Render different dashboard based on user role
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
    if (isComingSoon) {
      return renderComingSoon()
    }

    // Only show dashboard content if activeView is 'dashboard'
    if (activeView === 'dashboard') {
      return (
        <>
          {/* Welcome Header */}
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


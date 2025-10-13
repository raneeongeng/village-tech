'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface DashboardStats {
  pendingApps: number
  feeCollectionRate: number
  activeRules: number
  activeAnnouncements: number
  totalHouseholds: number
  securityIncidents: number
}

export interface ChartData {
  labels: string[]
  values: number[]
}

export interface DashboardCharts {
  feeHistory: ChartData
  householdGrowth: ChartData
}

export interface Announcement {
  id: string
  title: string
  content: string
  created_at: string
}

export interface Activity {
  id: string
  type: 'payment' | 'application' | 'announcement' | 'security'
  message: string
  timestamp: string
  icon: string
  color: string
}

export interface HeadAdminDashboardData {
  stats: DashboardStats
  charts: DashboardCharts
  announcements: Announcement[]
  activities: Activity[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

// Helper functions for date calculations
const getCurrentMonthStart = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

const getLast30Days = () => {
  const date = new Date()
  date.setDate(date.getDate() - 30)
  return date.toISOString()
}

const getLast6MonthsStart = () => {
  const date = new Date()
  date.setMonth(date.getMonth() - 6)
  return date.toISOString()
}

const getMonthLabels = () => {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(date.toLocaleDateString('en-US', { month: 'short' }))
  }
  return months
}

// Process fee history for chart
const processFeeHistory = () => {
  const monthLabels = getMonthLabels()
  // Mock data for fee collection percentages since fee structure isn't fully implemented
  const mockData = [85, 88, 90, 89, 93, 92]

  return {
    labels: monthLabels,
    values: mockData
  }
}

// Process household growth for chart
const processHouseholdGrowth = (householdData: any[]) => {
  const monthLabels = getMonthLabels()
  const monthlyData = new Array(6).fill(0)

  // Count households by month
  householdData.forEach(household => {
    const createdDate = new Date(household.created_at)
    const monthIndex = monthLabels.length - 1 - (
      (new Date().getFullYear() - createdDate.getFullYear()) * 12 +
      (new Date().getMonth() - createdDate.getMonth())
    )
    if (monthIndex >= 0 && monthIndex < 6) {
      monthlyData[monthIndex]++
    }
  })

  return {
    labels: monthLabels,
    values: monthlyData
  }
}

// Fetch recent activities (mock implementation)
const fetchRecentActivities = async (villageId: string): Promise<Activity[]> => {
  // Mock activity data for now
  const mockActivities: Activity[] = [
    {
      id: '1',
      type: 'payment',
      message: 'Household #245 paid monthly dues',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      icon: 'check',
      color: 'text-green-500'
    },
    {
      id: '2',
      type: 'application',
      message: 'New household application from John Smith',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      icon: 'person_add',
      color: 'text-primary'
    },
    {
      id: '3',
      type: 'announcement',
      message: 'New announcement posted: Monthly Community Meeting',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      icon: 'campaign',
      color: 'text-secondary'
    },
    {
      id: '4',
      type: 'security',
      message: 'Security report filed for Gate Area',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      icon: 'report',
      color: 'text-accent'
    }
  ]
  return mockActivities
}

export function useHeadAdminDashboard(villageId: string): HeadAdminDashboardData {
  const [stats, setStats] = useState<DashboardStats>({
    pendingApps: 0,
    feeCollectionRate: 0,
    activeRules: 0,
    activeAnnouncements: 0,
    totalHouseholds: 0,
    securityIncidents: 0,
  })
  const [charts, setCharts] = useState<DashboardCharts>({
    feeHistory: { labels: [], values: [] },
    householdGrowth: { labels: [], values: [] },
  })
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchDashboardData = useCallback(async () => {
    if (!villageId) return

    setLoading(true)
    setError(null)

    try {
      console.log('🔍 useHeadAdminDashboard - Starting data fetch for villageId:', villageId)

      // Get current month start and date ranges
      const currentMonthStart = getCurrentMonthStart()
      const last30Days = getLast30Days()
      const last6MonthsStart = getLast6MonthsStart()

      // Get lookup values for status IDs
      const { data: statusCategoryData, error: categoryError } = await supabase
        .from('lookup_categories')
        .select('id')
        .eq('code', 'household_statuses')
        .maybeSingle()

      if (categoryError) {
        console.warn('⚠️ Could not fetch household_statuses category:', categoryError)
      }

      let pendingStatusId = ''
      if (statusCategoryData && !categoryError) {
        const { data: pendingStatusData, error: statusError } = await supabase
          .from('lookup_values')
          .select('id')
          .eq('code', 'pending')
          .eq('category_id', statusCategoryData.id)
          .maybeSingle()

        if (statusError) {
          console.warn('⚠️ Could not fetch pending status:', statusError)
        }

        if (pendingStatusData && !statusError) {
          pendingStatusId = pendingStatusData.id
          console.log('✅ Found pending status ID:', pendingStatusId)
        } else {
          console.warn('⚠️ No pending status found, will show 0 pending applications')
        }
      }

      // Fetch all dashboard data in parallel
      const fetchPromises: Promise<any>[] = []

      // Pending applications count - only if we have a pending status ID
      if (pendingStatusId) {
        fetchPromises.push(
          supabase
            .from('households')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', villageId)
            .eq('status_id', pendingStatusId)
        )
      } else {
        fetchPromises.push(Promise.resolve({ count: 0 }))
      }

      // Total households count
      fetchPromises.push(
        supabase
          .from('households')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', villageId)
      )

      // Household growth history
      fetchPromises.push(
        supabase
          .from('households')
          .select('created_at')
          .eq('tenant_id', villageId)
          .gte('created_at', last6MonthsStart)
      )

      // Security incidents count (last 30 days)
      fetchPromises.push(
        supabase
          .from('incident_reports')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', villageId)
          .gte('occurred_at', last30Days)
      )

      const [
        { count: pendingApps },
        { count: totalHouseholds },
        { data: householdHistory },
        { count: securityIncidents }
      ] = await Promise.all(fetchPromises)

      console.log('✅ Fetched counts:', {
        pendingApps,
        totalHouseholds,
        householdHistoryCount: householdHistory?.length,
        securityIncidents
      })

      // Get active rules count
      const { count: activeRules } = await supabase
        .from('village_rules')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', villageId)
        .eq('is_active', true)

      console.log('✅ Fetched active rules count:', activeRules)

      // Calculate fee collection rate (mock for now)
      const feeCollectionRate = 92

      // Set statistics
      const statsData = {
        pendingApps: pendingApps || 0,
        feeCollectionRate,
        activeRules: activeRules || 0,
        activeAnnouncements: 3, // Mock data
        totalHouseholds: totalHouseholds || 0,
        securityIncidents: securityIncidents || 0,
      }

      console.log('✅ Setting stats:', statsData)
      setStats(statsData)

      // Process and set chart data
      setCharts({
        feeHistory: processFeeHistory(),
        householdGrowth: processHouseholdGrowth(householdHistory || [])
      })

      // Mock announcements data
      const mockAnnouncements: Announcement[] = [
        {
          id: '1',
          title: 'Monthly Community Meeting',
          content: 'Join us for our monthly community meeting this Saturday at 2 PM in the clubhouse.',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          title: 'Pool Maintenance Schedule',
          content: 'The community pool will be closed for maintenance from Monday to Wednesday next week.',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          title: 'Holiday Decoration Guidelines',
          content: 'Please review the updated guidelines for holiday decorations on common areas.',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      setAnnouncements(mockAnnouncements)

      // Fetch and set activities
      const recentActivities = await fetchRecentActivities(villageId)
      setActivities(recentActivities)

      console.log('✅ Dashboard data loaded successfully')
      setLoading(false)
    } catch (err) {
      console.error('Error in fetchDashboardData:', err)
      setError(err as Error)
      setLoading(false)
    }
  }, [villageId])

  const refetch = useCallback(async () => {
    await fetchDashboardData()
  }, [fetchDashboardData])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return {
    stats,
    charts,
    announcements,
    activities,
    loading,
    error,
    refetch,
  }
}
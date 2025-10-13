'use client'

import { useEffect, useState } from 'react'
import { ChartData } from '@/hooks/useHeadAdminDashboard'

// Define types for Chart.js
type ChartJSType = any
type BarType = React.ComponentType<any>

interface HouseholdGrowthChartProps {
  data: ChartData
  loading?: boolean
  error?: Error | null
}

export function HouseholdGrowthChart({ data, loading = false, error }: HouseholdGrowthChartProps) {
  const [chartComponents, setChartComponents] = useState<{
    Chart: ChartJSType | null
    Bar: BarType | null
  }>({
    Chart: null,
    Bar: null
  })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Dynamically import Chart.js only on client side
    const loadChart = async () => {
      try {
        const chartModule = await import('chart.js')
        const reactChartModule = await import('react-chartjs-2')

        const {
          Chart: ChartJS,
          CategoryScale,
          LinearScale,
          BarElement,
          Title,
          Tooltip,
          Legend,
        } = chartModule

        // Register Chart.js components
        ChartJS.register(
          CategoryScale,
          LinearScale,
          BarElement,
          Title,
          Tooltip,
          Legend
        )

        setChartComponents({
          Chart: ChartJS,
          Bar: reactChartModule.Bar
        })
      } catch (error) {
        console.error('Failed to load Chart.js:', error)
      }
    }

    loadChart()
  }, [])

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Household Growth</h3>
        <div className="h-60 flex items-center justify-center text-center">
          <div>
            <span className="material-symbols-outlined text-4xl text-red-400 mb-2">error</span>
            <p className="text-gray-600">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading || !isClient || !chartComponents.Bar) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-36 mb-4"></div>
          <div className="h-60 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Check for empty data
  if (!data.values || data.values.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Household Growth</h3>
        <div className="h-60 flex items-center justify-center text-center">
          <div>
            <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">trending_up</span>
            <p className="text-gray-600">No household data available yet</p>
            <p className="text-sm text-gray-500 mt-1">Data will appear as households are registered</p>
          </div>
        </div>
      </div>
    )
  }

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'New Households',
        data: data.values,
        backgroundColor: '#D96E49', // Accent (Terracotta Orange)
        borderColor: '#D96E49',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(217, 110, 73, 0.8)',
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#22574A',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#22574A',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `New Households: ${context.parsed.y}`
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 2,
          color: '#6B7280',
        },
        grid: {
          color: '#F3F4F6',
        },
      },
      x: {
        ticks: {
          color: '#6B7280',
        },
        grid: {
          display: false,
        },
      },
    },
  }

  const BarComponent = chartComponents.Bar

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Household Growth</h3>
      <div className="h-60">
        <BarComponent data={chartData} options={options} />
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { ChartData } from '@/hooks/useHeadAdminDashboard'

// Define types for Chart.js
type ChartJSType = any
type LineType = React.ComponentType<any>

interface FeeCollectionChartProps {
  data: ChartData
  loading?: boolean
  error?: Error | null
}

export function FeeCollectionChart({ data, loading = false, error }: FeeCollectionChartProps) {
  const [chartComponents, setChartComponents] = useState<{
    Chart: ChartJSType | null
    Line: LineType | null
  }>({
    Chart: null,
    Line: null
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
          PointElement,
          LineElement,
          Title,
          Tooltip,
          Legend,
          Filler,
        } = chartModule

        // Register Chart.js components
        ChartJS.register(
          CategoryScale,
          LinearScale,
          PointElement,
          LineElement,
          Title,
          Tooltip,
          Legend,
          Filler
        )

        setChartComponents({
          Chart: ChartJS,
          Line: reactChartModule.Line
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
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Fee Collection Performance</h3>
        <div className="h-60 flex items-center justify-center text-center">
          <div>
            <span className="material-symbols-outlined text-4xl text-red-400 mb-2">error</span>
            <p className="text-gray-600">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading || !isClient || !chartComponents.Line) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-60 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Check for empty data
  if (!data.values || data.values.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Fee Collection Performance</h3>
        <div className="h-60 flex items-center justify-center text-center">
          <div>
            <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">trending_up</span>
            <p className="text-gray-600">No fee collection data available yet</p>
            <p className="text-sm text-gray-500 mt-1">Data will appear as payments are processed</p>
          </div>
        </div>
      </div>
    )
  }

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Collection Rate',
        data: data.values,
        backgroundColor: 'rgba(34, 87, 74, 0.1)', // Primary with alpha
        borderColor: '#22574A', // Primary
        borderWidth: 2,
        pointBackgroundColor: '#22574A',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        tension: 0.4,
        fill: true,
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
            return `Collection Rate: ${context.parsed.y}%`
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%'
          },
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
    elements: {
      point: {
        hoverRadius: 8,
      }
    }
  }

  const LineComponent = chartComponents.Line

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Fee Collection Performance</h3>
      <div className="h-60">
        <LineComponent data={chartData} options={options} />
      </div>
    </div>
  )
}
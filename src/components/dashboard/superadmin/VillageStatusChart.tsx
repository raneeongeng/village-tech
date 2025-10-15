'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

interface VillageStatusChartProps {
  active: number
  inactive: number
  suspended?: number
  loading?: boolean
}

export function VillageStatusChart({
  active,
  inactive,
  suspended = 0,
  loading = false
}: VillageStatusChartProps) {
  const chartRef = useRef(null)

  if (loading) {
    return (
      <div className="bg-gray-50 p-8 rounded-lg text-center">
        <div className="animate-pulse">
          <div className="h-48 w-48 mx-auto bg-gray-200 rounded-full"></div>
        </div>
      </div>
    )
  }

  const total = active + inactive + suspended

  const data = {
    labels: ['Active', 'Inactive', ...(suspended > 0 ? ['Suspended'] : [])],
    datasets: [
      {
        label: 'Villages',
        data: suspended > 0 ? [active, inactive, suspended] : [active, inactive],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // Green for active
          'rgba(239, 68, 68, 0.8)', // Red for inactive
          ...(suspended > 0 ? ['rgba(234, 179, 8, 0.8)'] : []) // Yellow for suspended
        ],
        borderColor: [
          '#22c55e', // Green
          '#ef4444', // Red
          ...(suspended > 0 ? ['#eab308'] : []) // Yellow
        ],
        borderWidth: 2,
      }
    ]
  }

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 12,
            family: 'Inter, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 13,
          family: 'Inter, sans-serif'
        },
        bodyFont: {
          size: 12,
          family: 'Inter, sans-serif'
        },
        callbacks: {
          label: function(context) {
            const label = context.label || ''
            const value = context.parsed
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
            return `${label}: ${value} (${percentage}%)`
          }
        }
      }
    }
  }

  return (
    <div className="relative">
      <div className="h-48 md:h-64">
        <Doughnut ref={chartRef} data={data} options={options} />
      </div>
      {/* Center text showing total */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-3xl md:text-4xl font-bold text-gray-900">{total}</p>
          <p className="text-xs md:text-sm text-gray-600">Total</p>
        </div>
      </div>
    </div>
  )
}

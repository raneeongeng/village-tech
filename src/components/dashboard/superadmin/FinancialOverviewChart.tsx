'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface FinancialOverviewChartProps {
  expectedIncome: number[]
  currentIncome: number[]
  labels: string[]
  loading?: boolean
}

export function FinancialOverviewChart({
  expectedIncome,
  currentIncome,
  labels,
  loading = false
}: FinancialOverviewChartProps) {
  const chartRef = useRef(null)

  if (loading) {
    return (
      <div className="bg-gray-50 p-8 rounded-lg text-center">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const data = {
    labels,
    datasets: [
      {
        label: 'Expected Income',
        data: expectedIncome,
        backgroundColor: 'rgba(34, 87, 74, 0.7)', // Primary color with opacity
        borderColor: '#22574A', // Primary color
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Current Income',
        data: currentIncome,
        backgroundColor: 'rgba(34, 197, 94, 0.7)', // Green with opacity
        borderColor: '#22c55e', // Green
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
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
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            if (context.parsed.y !== null) {
              label += '₱' + context.parsed.y.toLocaleString()
            }
            return label
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11,
            family: 'Inter, sans-serif'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11,
            family: 'Inter, sans-serif'
          },
          callback: function(value) {
            return '₱' + (value as number).toLocaleString()
          }
        }
      }
    }
  }

  return (
    <div className="h-64 md:h-80">
      <Bar ref={chartRef} data={data} options={options} />
    </div>
  )
}

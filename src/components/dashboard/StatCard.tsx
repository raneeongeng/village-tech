'use client'

import { StatCardProps } from '@/types/dashboard'

interface StatCardComponentProps extends StatCardProps {
  onRetry?: () => void
}

export function StatCard({
  title,
  value,
  loading = false,
  error = null,
  onRetry,
  className = ''
}: StatCardComponentProps) {
  const baseClasses = "rounded-lg border border-primary/20 bg-white p-6"
  const classes = className ? `${baseClasses} ${className}` : baseClasses

  if (loading) {
    return (
      <div className={classes}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-12"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={classes}>
        <p className="text-base font-medium text-gray-500">{title}</p>
        <div className="mt-2">
          <p className="text-sm text-red-600 mb-2">Error loading data</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs text-primary hover:text-primary/80 underline"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  // Display the value (including 0)
  const displayValue = typeof value === 'number' ? value.toString() : value

  return (
    <div className={classes}>
      <p className="text-base font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{displayValue}</p>
    </div>
  )
}
'use client'

interface StatCardProps {
  icon: string
  label: string
  value: number | string
  iconColor: 'primary' | 'accent' | 'blue' | 'green' | 'yellow' | 'purple' | 'red'
  loading?: boolean
}

const ICON_COLOR_CLASSES = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/10 text-accent',
  blue: 'bg-blue-100 text-blue-500',
  green: 'bg-green-100 text-green-500',
  yellow: 'bg-yellow-100 text-yellow-500',
  purple: 'bg-purple-100 text-purple-500',
  red: 'bg-red-100 text-red-500',
}

export function StatCard({
  icon,
  label,
  value,
  iconColor,
  loading = false
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    )
  }

  // Format value for display
  const formatValue = (val: number | string) => {
    if (typeof val === 'number') {
      if (label.toLowerCase().includes('collection')) {
        return `${val}%`
      }
      return val.toLocaleString()
    }
    return val
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${ICON_COLOR_CLASSES[iconColor]}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatValue(value)}
          </p>
        </div>
      </div>
    </div>
  )
}
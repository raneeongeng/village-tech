interface UserStatusBadgeProps {
  status: boolean
  className?: string
}

export function UserStatusBadge({ status, className = '' }: UserStatusBadgeProps) {
  if (status) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 ${className}`}>
        Active
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 ${className}`}>
      Inactive
    </span>
  )
}
'use client'

interface QuickActionsProps {
  loading?: boolean
}

interface QuickAction {
  icon: string
  iconColor: string
  label: string
  href: string
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: 'person_add',
    iconColor: 'text-primary',
    label: 'Approve Household',
    href: '/households/pending'
  },
  {
    icon: 'post_add',
    iconColor: 'text-primary',
    label: 'Post Announcement',
    href: '/announcements/create'
  },
  {
    icon: 'receipt_long',
    iconColor: 'text-primary',
    label: 'View Fee Records',
    href: '/fees'
  },
  {
    icon: 'security',
    iconColor: 'text-accent',
    label: 'Monitor Security',
    href: '/security'
  },
  {
    icon: 'edit_document',
    iconColor: 'text-accent',
    label: 'Manage Rules',
    href: '/rules'
  }
]

export function QuickActions({ loading = false }: QuickActionsProps) {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="p-4 bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-gray-200 rounded mb-3 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-gray-700 mb-6">Quick Actions</h3>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {QUICK_ACTIONS.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              // For now, just log the action since these pages may not exist yet
              console.log(`Navigate to: ${action.href}`)
            }}
            className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
          >
            <div className="text-center">
              <span className={`material-symbols-outlined text-2xl ${action.iconColor} group-hover:scale-110 transition-transform duration-200 mb-3 block`}>
                {action.icon}
              </span>
              <p className="text-sm font-medium text-gray-700 group-hover:text-primary">
                {action.label}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
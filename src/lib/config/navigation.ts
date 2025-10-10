import type { UserRole } from '@/types/auth'
import { getRoleNavigation } from './roles'

// Navigation item interface
export interface NavigationItem {
  id: string
  label: string
  href: string
  icon: string
  description?: string
  badge?: string | number
  children?: NavigationItem[]
}

// All available navigation items
const ALL_NAVIGATION_ITEMS: Record<string, NavigationItem> = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    description: 'Overview and quick actions',
  },

  // Superadmin specific
  villages: {
    id: 'villages',
    label: 'Villages',
    href: '/villages',
    icon: 'Building',
    description: 'Manage villages and tenants',
  },
  users: {
    id: 'users',
    label: 'Users',
    href: '/users',
    icon: 'Users',
    description: 'Manage system users',
  },
  payments: {
    id: 'payments',
    label: 'Payments',
    href: '/payments',
    icon: 'CreditCard',
    description: 'Payment processing and billing',
  },
  notifications: {
    id: 'notifications',
    label: 'Notifications',
    href: '/notifications',
    icon: 'Bell',
    description: 'System notifications',
  },

  // Admin specific
  households: {
    id: 'households',
    label: 'Households',
    href: '/households',
    icon: 'Home',
    description: 'Manage households and residents',
  },
  fees: {
    id: 'fees',
    label: 'Fees',
    href: '/fees',
    icon: 'DollarSign',
    description: 'Fee management and collection',
  },
  security: {
    id: 'security',
    label: 'Security',
    href: '/security',
    icon: 'Shield',
    description: 'Security management',
  },
  rules: {
    id: 'rules',
    label: 'Rules',
    href: '/rules',
    icon: 'FileText',
    description: 'Community rules and regulations',
  },
  announcements: {
    id: 'announcements',
    label: 'Announcements',
    href: '/announcements',
    icon: 'Megaphone',
    description: 'Community announcements',
  },
  deliveries: {
    id: 'deliveries',
    label: 'Deliveries',
    href: '/deliveries',
    icon: 'Package',
    description: 'Package and delivery management',
  },

  // Household specific
  'my-household': {
    id: 'my-household',
    label: 'My Household',
    href: '/my-household',
    icon: 'Home',
    description: 'Manage your household',
  },
  requests: {
    id: 'requests',
    label: 'Requests',
    href: '/requests',
    icon: 'FileText',
    description: 'Submit and track requests',
  },
  'my-access': {
    id: 'my-access',
    label: 'My Access',
    href: '/my-access',
    icon: 'Key',
    description: 'Your access permissions',
  },

  // Security specific
  guards: {
    id: 'guards',
    label: 'Guards',
    href: '/guards',
    icon: 'UserCheck',
    description: 'Manage security personnel',
  },
  incidents: {
    id: 'incidents',
    label: 'Incidents',
    href: '/incidents',
    icon: 'AlertTriangle',
    description: 'Incident reports and management',
  },
  'gate-logs': {
    id: 'gate-logs',
    label: 'Gate Logs',
    href: '/gate-logs',
    icon: 'ClipboardList',
    description: 'Entry and exit logs',
  },
  visitors: {
    id: 'visitors',
    label: 'Visitors',
    href: '/visitors',
    icon: 'UserPlus',
    description: 'Visitor management',
  },

  // Common
  reports: {
    id: 'reports',
    label: 'Reports',
    href: '/reports',
    icon: 'BarChart3',
    description: 'Analytics and reports',
  },
  settings: {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: 'Settings',
    description: 'Application settings',
  },
}

/**
 * Get navigation items for a specific role
 */
export function getNavigationForRole(role: UserRole): NavigationItem[] {
  const allowedNavIds = getRoleNavigation(role)

  return allowedNavIds
    .map(navId => ALL_NAVIGATION_ITEMS[navId])
    .filter(Boolean) // Remove any undefined items
}

/**
 * Get navigation item by ID
 */
export function getNavigationItem(id: string): NavigationItem | undefined {
  return ALL_NAVIGATION_ITEMS[id]
}

/**
 * Get all navigation items
 */
export function getAllNavigationItems(): Record<string, NavigationItem> {
  return ALL_NAVIGATION_ITEMS
}

/**
 * Check if navigation item exists
 */
export function hasNavigationItem(id: string): boolean {
  return id in ALL_NAVIGATION_ITEMS
}

/**
 * Get navigation item by href
 */
export function getNavigationByHref(href: string): NavigationItem | undefined {
  return Object.values(ALL_NAVIGATION_ITEMS).find(item => item.href === href)
}

/**
 * Group navigation items by category
 */
export function getGroupedNavigation(role: UserRole): Record<string, NavigationItem[]> {
  const navigation = getNavigationForRole(role)

  const groups: Record<string, NavigationItem[]> = {
    main: [],
    management: [],
    personal: [],
    security: [],
    system: [],
  }

  navigation.forEach(item => {
    switch (item.id) {
      case 'dashboard':
        groups.main.push(item)
        break
      case 'villages':
      case 'users':
      case 'households':
      case 'fees':
      case 'rules':
      case 'announcements':
        groups.management.push(item)
        break
      case 'my-household':
      case 'requests':
      case 'deliveries':
      case 'my-access':
        groups.personal.push(item)
        break
      case 'security':
      case 'guards':
      case 'incidents':
      case 'gate-logs':
      case 'visitors':
        groups.security.push(item)
        break
      case 'payments':
      case 'notifications':
      case 'reports':
      case 'settings':
        groups.system.push(item)
        break
      default:
        groups.main.push(item)
    }
  })

  // Remove empty groups
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) {
      delete groups[key]
    }
  })

  return groups
}
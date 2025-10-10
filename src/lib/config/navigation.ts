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
  // Common - Dashboard for all roles
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    description: 'Overview and quick actions',
  },

  // Superadmin specific
  villages: {
    id: 'villages',
    label: 'Village List',
    href: '/villages',
    icon: 'holiday_village',
    description: 'Manage villages and tenants',
  },
  users: {
    id: 'users',
    label: 'Users',
    href: '/users',
    icon: 'group',
    description: 'Manage system users',
  },
  'superadmin-payments': {
    id: 'superadmin-payments',
    label: 'Payments',
    href: '/payments',
    icon: 'payment',
    badge: '3',
    description: 'Payment processing and billing',
  },
  reports: {
    id: 'reports',
    label: 'Reports',
    href: '/reports',
    icon: 'assessment',
    description: 'Analytics and reports',
  },

  // Admin Head specific
  'household-approvals': {
    id: 'household-approvals',
    label: 'Household Approvals',
    href: '/household-approvals',
    icon: 'approval',
    description: 'Review and approve household applications',
  },
  'active-households': {
    id: 'active-households',
    label: 'Active Households',
    href: '/active-households',
    icon: 'home',
    description: 'Manage active household records',
  },
  'fees-management': {
    id: 'fees-management',
    label: 'Fees Management',
    href: '/fees-management',
    icon: 'request_quote',
    description: 'Configure and manage fees',
  },
  'payment-status': {
    id: 'payment-status',
    label: 'Payment Status',
    href: '/payment-status',
    icon: 'payment',
    description: 'Monitor payment statuses',
  },
  rules: {
    id: 'rules',
    label: 'Rules',
    href: '/rules',
    icon: 'rule',
    description: 'Community rules and regulations',
  },
  announcements: {
    id: 'announcements',
    label: 'Announcements',
    href: '/announcements',
    icon: 'campaign',
    description: 'Community announcements',
  },
  'construction-permits': {
    id: 'construction-permits',
    label: 'Construction Permits',
    href: '/construction-permits',
    icon: 'engineering',
    description: 'Construction permit management',
  },

  // Admin Officer specific
  'household-records': {
    id: 'household-records',
    label: 'Household Records',
    href: '/household-records',
    icon: 'folder',
    description: 'Household record management',
  },
  'sticker-requests': {
    id: 'sticker-requests',
    label: 'Sticker Requests',
    href: '/sticker-requests',
    icon: 'local_offer',
    description: 'Process sticker requests',
  },
  'active-stickers': {
    id: 'active-stickers',
    label: 'Active Stickers',
    href: '/active-stickers',
    icon: 'verified',
    description: 'Manage active stickers',
  },
  'officer-construction-permits': {
    id: 'officer-construction-permits',
    label: 'Construction Permits',
    href: '/construction-permits',
    icon: 'engineering',
    description: 'Construction permit processing',
  },
  'manual-payments': {
    id: 'manual-payments',
    label: 'Manual Payments',
    href: '/manual-payments',
    icon: 'payments',
    description: 'Process manual payments',
  },
  'resident-inquiries': {
    id: 'resident-inquiries',
    label: 'Resident Inquiries',
    href: '/resident-inquiries',
    icon: 'help',
    description: 'Handle resident inquiries',
  },

  // Household Head specific
  members: {
    id: 'members',
    label: 'Members',
    href: '/members',
    icon: 'people',
    description: 'Manage household members',
  },
  'visitor-management': {
    id: 'visitor-management',
    label: 'Visitor Management',
    href: '/visitor-management',
    icon: 'person_add',
    description: 'Manage visitor access',
  },
  'active-guest-passes': {
    id: 'active-guest-passes',
    label: 'Active Guest Passes',
    href: '/active-guest-passes',
    icon: 'badge',
    description: 'View active guest passes',
  },
  'household-sticker-requests': {
    id: 'household-sticker-requests',
    label: 'Sticker Requests',
    href: '/sticker-requests',
    icon: 'local_offer',
    description: 'Submit sticker requests',
  },
  'service-requests': {
    id: 'service-requests',
    label: 'Service Requests',
    href: '/service-requests',
    icon: 'build',
    description: 'Submit and track service requests',
  },
  'announcements-rules': {
    id: 'announcements-rules',
    label: 'Announcements & Rules',
    href: '/announcements-rules',
    icon: 'info',
    description: 'View announcements and rules',
  },
  'fee-status': {
    id: 'fee-status',
    label: 'Fee Status',
    href: '/fee-status',
    icon: 'receipt',
    description: 'View fee status and payments',
  },

  // Security Officer specific
  'sticker-validation': {
    id: 'sticker-validation',
    label: 'Sticker Validation',
    href: '/sticker-validation',
    icon: 'verified_user',
    description: 'Validate vehicle stickers',
  },
  'guest-registration': {
    id: 'guest-registration',
    label: 'Guest Registration',
    href: '/guest-registration',
    icon: 'how_to_reg',
    description: 'Register guests',
  },
  'guest-approval-status': {
    id: 'guest-approval-status',
    label: 'Guest Approval Status',
    href: '/guest-approval-status',
    icon: 'pending_actions',
    description: 'Check guest approval status',
  },
  'guest-pass-scan': {
    id: 'guest-pass-scan',
    label: 'Guest Pass Scan / Entry Log',
    href: '/guest-pass-scan',
    icon: 'qr_code_scanner',
    description: 'Scan guest passes and log entries',
  },
  'delivery-logging': {
    id: 'delivery-logging',
    label: 'Delivery Logging',
    href: '/delivery-logging',
    icon: 'local_shipping',
    description: 'Log deliveries and packages',
  },
  'construction-worker-entry': {
    id: 'construction-worker-entry',
    label: 'Construction Worker Entry',
    href: '/construction-worker-entry',
    icon: 'construction',
    description: 'Log construction worker entries',
  },
  'incident-report': {
    id: 'incident-report',
    label: 'Incident Report',
    href: '/incident-report',
    icon: 'report',
    description: 'Report incidents',
  },
  'shift-history': {
    id: 'shift-history',
    label: 'Shift History / Logs',
    href: '/shift-history',
    icon: 'history',
    description: 'View shift history and logs',
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
import type { UserRole, RolePermissions } from '@/types/auth'

// Role hierarchy and permissions configuration
export const USER_ROLES: Record<UserRole, RolePermissions> = {
  superadmin: {
    role: 'superadmin',
    permissions: [
      '*', // All permissions
    ],
    navigation: [
      'dashboard',
      'villages',
      'users',
      'superadmin-payments',
      'reports',
    ],
    restricted_routes: [],
  },

  admin_head: {
    role: 'admin_head',
    permissions: [
      'manage_households',
      'manage_users',
      'manage_fees',
      'manage_security',
      'manage_rules',
      'manage_announcements',
      'view_reports',
      'manage_settings',
    ],
    navigation: [
      'dashboard',
      'household-approvals',
      'active-households',
      'users',
      'fees-management',
      'payment-status',
      'rules',
      'announcements',
      'construction-permits',
      'sticker-approvals',
    ],
    restricted_routes: ['villages'],
  },

  admin_officer: {
    role: 'admin_officer',
    permissions: [
      'manage_households',
      'manage_fees',
      'manage_deliveries',
      'view_rules',
      'basic_settings',
    ],
    navigation: [
      'dashboard',
      'household-records',
      'sticker-requests',
      'sticker-approvals',
      'active-stickers',
      'officer-construction-permits',
      'manual-payments',
      'resident-inquiries',
    ],
    restricted_routes: [
      'villages',
      'users',
      'security',
      'announcements',
      'reports',
    ],
  },

  household_head: {
    role: 'household_head',
    permissions: [
      'manage_household',
      'submit_requests',
      'view_deliveries',
      'view_rules',
    ],
    navigation: [
      'dashboard',
      'members',
      'visitor-management',
      'active-guest-passes',
      'household-sticker-requests',
      'service-requests',
      'announcements-rules',
      'fee-status',
    ],
    restricted_routes: [
      'villages',
      'users',
      'households',
      'fees',
      'security',
      'announcements',
      'settings',
      'reports',
    ],
  },

  security_officer: {
    role: 'security_officer',
    permissions: ['manage_gate_logs', 'manage_visitors', 'view_incidents'],
    navigation: [
      'dashboard',
      'sticker-validation',
      'guest-registration',
      'guest-approval-status',
      'guest-pass-scan',
      'delivery-logging',
      'construction-worker-entry',
      'incident-report',
      'shift-history',
    ],
    restricted_routes: [
      'villages',
      'users',
      'households',
      'fees',
      'security',
      'rules',
      'announcements',
      'settings',
      'reports',
      'guards',
    ],
  },
}

/**
 * Get role configuration by role name
 */
export function getRoleConfig(role: UserRole): RolePermissions {
  return USER_ROLES[role]
}

/**
 * Check if role has specific permission
 */
export function roleHasPermission(role: UserRole, permission: string): boolean {
  const config = getRoleConfig(role)
  return config.permissions.includes('*') || config.permissions.includes(permission)
}

/**
 * Get navigation items for role
 */
export function getRoleNavigation(role: UserRole): string[] {
  return getRoleConfig(role).navigation
}

/**
 * Check if role can access route
 */
export function canAccessRoute(role: UserRole, route: string): boolean {
  const config = getRoleConfig(role)
  return !config.restricted_routes.includes(route)
}

/**
 * Get all available roles
 */
export function getAllRoles(): UserRole[] {
  return Object.keys(USER_ROLES) as UserRole[]
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    superadmin: 'super admin',
    admin_head: 'Head Admin',
    admin_officer: 'Admin Officer',
    household_head: 'Household Head',
    security_officer: 'Security Officer',
  }

  return displayNames[role] || role
}

/**
 * Get role hierarchy level (higher number = more permissions)
 */
export function getRoleLevel(role: UserRole): number {
  const levels: Record<UserRole, number> = {
    superadmin: 100,
    admin_head: 80,
    admin_officer: 60,
    security_officer: 50,
    household_head: 40,
  }

  return levels[role] || 0
}
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
      'payments',
      'reports',
      'notifications',
      'settings',
    ],
    restricted_routes: [],
  },

  admin_head: {
    role: 'admin_head',
    permissions: [
      'manage_households',
      'manage_fees',
      'manage_security',
      'manage_rules',
      'manage_announcements',
      'view_reports',
      'manage_settings',
    ],
    navigation: [
      'dashboard',
      'households',
      'fees',
      'security',
      'rules',
      'announcements',
      'settings',
    ],
    restricted_routes: ['villages', 'users'],
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
    navigation: ['dashboard', 'households', 'fees', 'deliveries', 'rules', 'settings'],
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
    navigation: ['dashboard', 'my-household', 'requests', 'deliveries', 'rules'],
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
    navigation: ['dashboard', 'gate-logs', 'visitors', 'incidents'],
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
    superadmin: 'Super Administrator',
    admin_head: 'Administrative Head',
    admin_officer: 'Administrative Officer',
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
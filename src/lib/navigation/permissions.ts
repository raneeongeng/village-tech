/**
 * Navigation Permission Validation for Village Management Platform
 * Provides runtime permission checking and navigation access validation
 */

import type { NavigationItem, UserRole } from '@/types/navigation';
import { NAVIGATION_CONFIG } from './config';

/**
 * Permission validation result
 */
export interface PermissionValidationResult {
  allowed: boolean;
  reason?: string;
  requiredPermission?: string;
  userRole?: UserRole;
}

/**
 * User context for permission validation
 */
export interface UserPermissionContext {
  role: UserRole;
  permissions: string[];
  userId?: string;
  tenantId?: string;
}

/**
 * Check if a user can access a specific navigation item
 */
export function canAccessItem(
  item: NavigationItem,
  context: UserPermissionContext
): PermissionValidationResult {
  // If no permission required, allow access
  if (!item.permission) {
    return {
      allowed: true,
      reason: 'No permission required'
    };
  }

  // Superadmin wildcard permission
  if (context.permissions.includes('*')) {
    return {
      allowed: true,
      reason: 'Superadmin access',
      userRole: context.role
    };
  }

  // Check specific permission
  if (context.permissions.includes(item.permission)) {
    return {
      allowed: true,
      reason: 'User has required permission',
      requiredPermission: item.permission,
      userRole: context.role
    };
  }

  // Access denied
  return {
    allowed: false,
    reason: 'Insufficient permissions',
    requiredPermission: item.permission,
    userRole: context.role
  };
}

/**
 * Validate user permissions against their role configuration
 */
export function validateUserPermissions(
  userRole: UserRole,
  userPermissions: string[]
): PermissionValidationResult {
  const roleConfig = NAVIGATION_CONFIG[userRole];

  if (!roleConfig) {
    return {
      allowed: false,
      reason: 'Invalid user role',
      userRole
    };
  }

  // Check if user has all required permissions for their role
  const missingPermissions = roleConfig.permissions.filter(
    permission => permission !== '*' && !userPermissions.includes(permission)
  );

  if (missingPermissions.length > 0) {
    return {
      allowed: false,
      reason: `Missing required permissions: ${missingPermissions.join(', ')}`,
      userRole
    };
  }

  return {
    allowed: true,
    reason: 'All role permissions verified',
    userRole
  };
}

/**
 * Get all navigation items that a user can access
 */
export function getAccessibleNavigationItems(
  userRole: UserRole,
  context: UserPermissionContext
): NavigationItem[] {
  const roleConfig = NAVIGATION_CONFIG[userRole];

  if (!roleConfig) {
    return [];
  }

  return roleConfig.items.filter(item => {
    const result = canAccessItem(item, context);
    return result.allowed;
  });
}

/**
 * Check if a user can access a specific route path
 */
export function canAccessRoute(
  path: string,
  context: UserPermissionContext
): PermissionValidationResult {
  const roleConfig = NAVIGATION_CONFIG[context.role];

  if (!roleConfig) {
    return {
      allowed: false,
      reason: 'Invalid user role',
      userRole: context.role
    };
  }

  // Find navigation item by path
  const navigationItem = findNavigationItemByPath(roleConfig.items, path);

  if (!navigationItem) {
    return {
      allowed: false,
      reason: 'Route not found in navigation configuration',
      userRole: context.role
    };
  }

  return canAccessItem(navigationItem, context);
}

/**
 * Helper function to find navigation item by path (including nested items)
 */
function findNavigationItemByPath(
  items: NavigationItem[],
  path: string
): NavigationItem | null {
  for (const item of items) {
    // Exact match
    if (item.href === path) {
      return item;
    }

    // Check if path starts with item href (for nested routes)
    if (path.startsWith(item.href) && item.href !== '/') {
      return item;
    }

    // Check children recursively
    if (item.children) {
      const found = findNavigationItemByPath(item.children, path);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Create permission context from user data
 */
export function createPermissionContext(
  role: UserRole,
  permissions?: string[],
  userId?: string,
  tenantId?: string
): UserPermissionContext {
  const roleConfig = NAVIGATION_CONFIG[role];

  return {
    role,
    permissions: permissions || roleConfig?.permissions || [],
    userId,
    tenantId
  };
}

/**
 * Validate navigation access with detailed error information
 */
export function validateNavigationAccess(
  item: NavigationItem,
  context: UserPermissionContext,
  options?: {
    strictMode?: boolean;
    logAccess?: boolean;
  }
): PermissionValidationResult & {
  navigationItem: NavigationItem;
  context: UserPermissionContext;
  timestamp: Date;
} {
  const result = canAccessItem(item, context);

  // Log access attempt if requested
  if (options?.logAccess) {
    console.log('Navigation access attempt:', {
      item: item.id,
      user: context.userId,
      role: context.role,
      allowed: result.allowed,
      reason: result.reason,
      timestamp: new Date()
    });
  }

  return {
    ...result,
    navigationItem: item,
    context,
    timestamp: new Date()
  };
}

/**
 * Bulk validate multiple navigation items
 */
export function validateMultipleItems(
  items: NavigationItem[],
  context: UserPermissionContext
): Array<{
  item: NavigationItem;
  result: PermissionValidationResult;
}> {
  return items.map(item => ({
    item,
    result: canAccessItem(item, context)
  }));
}

/**
 * Get permission requirements for a specific role
 */
export function getRolePermissionRequirements(
  role: UserRole
): string[] {
  const roleConfig = NAVIGATION_CONFIG[role];
  return roleConfig?.permissions || [];
}

/**
 * Check if a role has sufficient permissions for another role's navigation
 */
export function canAccessRoleNavigation(
  userRole: UserRole,
  targetRole: UserRole,
  userPermissions: string[]
): PermissionValidationResult {
  // Users can always access their own role's navigation
  if (userRole === targetRole) {
    return {
      allowed: true,
      reason: 'User accessing own role navigation'
    };
  }

  // Superadmin can access any role's navigation
  if (userPermissions.includes('*')) {
    return {
      allowed: true,
      reason: 'Superadmin can access all role navigation'
    };
  }

  // For security, don't allow cross-role access unless explicitly granted
  // This prevents privilege escalation through navigation access
  return {
    allowed: false,
    reason: `Cross-role navigation access denied: ${userRole} cannot access ${targetRole} navigation`,
    userRole
  };
}

/**
 * Security audit log entry
 */
export interface SecurityAuditEntry {
  timestamp: Date;
  userId?: string;
  userRole: UserRole;
  action: 'access_granted' | 'access_denied' | 'permission_check';
  resource: string;
  resourceType: 'navigation_item' | 'route' | 'role_navigation';
  reason: string;
  metadata?: Record<string, any>;
}

/**
 * Create security audit entry for navigation access
 */
export function createSecurityAuditEntry(
  result: PermissionValidationResult,
  context: UserPermissionContext,
  resource: string,
  resourceType: SecurityAuditEntry['resourceType'] = 'navigation_item'
): SecurityAuditEntry {
  return {
    timestamp: new Date(),
    userId: context.userId,
    userRole: context.role,
    action: result.allowed ? 'access_granted' : 'access_denied',
    resource,
    resourceType,
    reason: result.reason || 'Unknown',
    metadata: {
      requiredPermission: result.requiredPermission,
      userPermissions: context.permissions
    }
  };
}
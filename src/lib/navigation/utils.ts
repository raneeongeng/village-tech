/**
 * Navigation Utility Functions for Village Management Platform
 * Provides core navigation logic and helper functions for role-based navigation
 */

import type { NavigationItem, NavigationGroup, UserRole, RoleNavigationMap } from '@/types/navigation';
import { NAVIGATION_CONFIG } from './config';

/**
 * Get navigation configuration for a specific role
 */
export function getNavigationForRole(role: UserRole): RoleNavigationMap {
  return NAVIGATION_CONFIG[role];
}

/**
 * Get navigation items for a specific role
 */
export function getNavigationItemsForRole(role: UserRole): NavigationItem[] {
  return NAVIGATION_CONFIG[role]?.items || [];
}

/**
 * Get navigation groups for a specific role
 */
export function getNavigationGroupsForRole(role: UserRole): NavigationGroup[] {
  return NAVIGATION_CONFIG[role]?.groups || [];
}

/**
 * Filter navigation items based on user permissions
 */
export function filterNavigationByPermissions(
  items: NavigationItem[],
  userPermissions: string[]
): NavigationItem[] {
  return items.filter(item => {
    // If no permission required, item is accessible to all
    if (!item.permission) return true;

    // Superadmin wildcard permission
    if (userPermissions.includes('*')) return true;

    // Check if user has the specific permission
    return userPermissions.includes(item.permission);
  });
}

/**
 * Find active navigation item based on current path
 */
export function findActiveNavigationItem(
  items: NavigationItem[],
  currentPath: string
): NavigationItem | null {
  for (const item of items) {
    // Check children recursively first to prioritize exact matches in children
    if (item.children) {
      const found = findActiveNavigationItem(item.children, currentPath);
      if (found) return found;
    }

    // Exact match
    if (item.href === currentPath) {
      return item;
    }

    // Check if current path starts with item href (for nested routes)
    if (currentPath.startsWith(item.href) && item.href !== '/') {
      return item;
    }
  }

  return null;
}

/**
 * Group navigation items by their group property with enhanced organization
 */
export function groupNavigationItems(
  items: NavigationItem[]
): Record<string, NavigationItem[]> {
  return items.reduce((groups, item) => {
    const groupId = item.group || 'default';

    if (!groups[groupId]) {
      groups[groupId] = [];
    }

    groups[groupId].push(item);
    return groups;
  }, {} as Record<string, NavigationItem[]>);
}

/**
 * Advanced grouping that includes group metadata
 */
export function groupNavigationItemsWithMetadata(
  items: NavigationItem[],
  groups: NavigationGroup[]
): Array<{
  group: NavigationGroup;
  items: NavigationItem[];
}> {
  const groupedItems = groupNavigationItems(items);

  return sortNavigationGroups(groups)
    .map(group => ({
      group,
      items: sortNavigationItems(groupedItems[group.id] || [])
    }))
    .filter(groupData => groupData.items.length > 0);
}

/**
 * Sort navigation items by their order property
 */
export function sortNavigationItems(items: NavigationItem[]): NavigationItem[] {
  return [...items].sort((a, b) => a.order - b.order);
}

/**
 * Sort navigation groups by their order property
 */
export function sortNavigationGroups(groups: NavigationGroup[]): NavigationGroup[] {
  return [...groups].sort((a, b) => a.order - b.order);
}

/**
 * Get navigation items for a specific group
 */
export function getItemsByGroup(
  items: NavigationItem[],
  groupId: string
): NavigationItem[] {
  return items.filter(item => item.group === groupId);
}

/**
 * Check if a navigation item can be accessed by user with given permissions
 */
export function canAccessItem(
  item: NavigationItem,
  userPermissions: string[]
): boolean {
  if (!item.permission) return true;
  if (userPermissions.includes('*')) return true;
  return userPermissions.includes(item.permission);
}

/**
 * Get breadcrumb trail for a given path
 */
export function getBreadcrumbTrail(
  items: NavigationItem[],
  currentPath: string
): NavigationItem[] {
  const trail: NavigationItem[] = [];

  function findTrail(navItems: NavigationItem[], path: string): boolean {
    for (const item of navItems) {
      trail.push(item);

      if (item.href === path) {
        return true;
      }

      if (item.children && findTrail(item.children, path)) {
        return true;
      }

      trail.pop();
    }

    return false;
  }

  findTrail(items, currentPath);
  return trail;
}

/**
 * Validate navigation configuration structure
 */
export function validateNavigationConfig(config: Record<UserRole, RoleNavigationMap>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check all required roles are present
  const requiredRoles: UserRole[] = ['superadmin', 'admin_head', 'admin_officer', 'household_head', 'security_officer'];

  for (const role of requiredRoles) {
    if (!config[role]) {
      errors.push(`Missing configuration for role: ${role}`);
      continue;
    }

    const roleConfig = config[role];

    // Validate role configuration structure
    if (!roleConfig.items || !Array.isArray(roleConfig.items)) {
      errors.push(`Invalid items array for role: ${role}`);
    }

    if (!roleConfig.groups || !Array.isArray(roleConfig.groups)) {
      errors.push(`Invalid groups array for role: ${role}`);
    }

    if (!roleConfig.permissions || !Array.isArray(roleConfig.permissions)) {
      errors.push(`Invalid permissions array for role: ${role}`);
    }

    // Validate navigation items
    if (roleConfig.items) {
      for (const item of roleConfig.items) {
        if (!item.id || !item.label || !item.href) {
          errors.push(`Invalid navigation item for role ${role}: missing required fields`);
        }

        if (typeof item.order !== 'number') {
          errors.push(`Invalid order for navigation item ${item.id} in role ${role}`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get all navigation items in a flat array (including children)
 */
export function flattenNavigationItems(items: NavigationItem[]): NavigationItem[] {
  const flattened: NavigationItem[] = [];

  function flatten(navItems: NavigationItem[]) {
    for (const item of navItems) {
      flattened.push(item);
      if (item.children) {
        flatten(item.children);
      }
    }
  }

  flatten(items);
  return flattened;
}

/**
 * Search navigation items by label or href
 */
export function searchNavigationItems(
  items: NavigationItem[],
  query: string
): NavigationItem[] {
  const lowercaseQuery = query.toLowerCase();
  const flatItems = flattenNavigationItems(items);

  return flatItems.filter(item =>
    item.label.toLowerCase().includes(lowercaseQuery) ||
    item.href.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Get navigation statistics for a role
 */
export function getNavigationStats(role: UserRole): {
  totalItems: number;
  totalGroups: number;
  itemsWithPermissions: number;
  permissionsCount: number;
} {
  const config = NAVIGATION_CONFIG[role];
  if (!config) {
    return { totalItems: 0, totalGroups: 0, itemsWithPermissions: 0, permissionsCount: 0 };
  }

  const flatItems = flattenNavigationItems(config.items);

  return {
    totalItems: flatItems.length,
    totalGroups: config.groups.length,
    itemsWithPermissions: flatItems.filter(item => item.permission).length,
    permissionsCount: config.permissions.length
  };
}
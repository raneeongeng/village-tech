/**
 * Navigation Utilities Tests
 * Tests for core navigation logic and helper functions
 */

import {
  getNavigationForRole,
  getNavigationItemsForRole,
  getNavigationGroupsForRole,
  filterNavigationByPermissions,
  findActiveNavigationItem,
  groupNavigationItems,
  sortNavigationItems,
  sortNavigationGroups,
  getItemsByGroup,
  canAccessItem,
  getBreadcrumbTrail,
  validateNavigationConfig,
  flattenNavigationItems,
  searchNavigationItems,
  getNavigationStats
} from '@/lib/navigation/utils';
import { NAVIGATION_CONFIG } from '@/lib/navigation/config';
import type { NavigationItem, NavigationGroup, UserRole } from '@/types/navigation';

describe('Navigation Utilities', () => {
  describe('getNavigationForRole', () => {
    test('returns correct configuration for superadmin', () => {
      const config = getNavigationForRole('superadmin');
      expect(config).toBeDefined();
      expect(config.role).toBe('superadmin');
      expect(config.permissions).toContain('*');
      expect(config.items).toBeInstanceOf(Array);
      expect(config.groups).toBeInstanceOf(Array);
    });

    test('returns correct configuration for admin_head', () => {
      const config = getNavigationForRole('admin_head');
      expect(config).toBeDefined();
      expect(config.role).toBe('admin_head');
      expect(config.permissions).toContain('manage_households');
      expect(config.items.length).toBeGreaterThan(0);
    });

    test('returns correct configuration for household_head', () => {
      const config = getNavigationForRole('household_head');
      expect(config).toBeDefined();
      expect(config.role).toBe('household_head');
      expect(config.permissions).toContain('manage_household');
    });
  });

  describe('getNavigationItemsForRole', () => {
    test('returns navigation items for admin_head', () => {
      const items = getNavigationItemsForRole('admin_head');
      expect(items).toBeInstanceOf(Array);
      expect(items.length).toBeGreaterThan(0);

      // Should include dashboard
      const dashboard = items.find(item => item.id === 'dashboard');
      expect(dashboard).toBeDefined();
      expect(dashboard?.href).toBe('/dashboard');
    });

    test('returns different items for different roles', () => {
      const superadminItems = getNavigationItemsForRole('superadmin');
      const householdItems = getNavigationItemsForRole('household_head');

      expect(superadminItems).not.toEqual(householdItems);

      // Superadmin should have system management
      const systemOverview = superadminItems.find(item => item.id === 'system-overview');
      expect(systemOverview).toBeDefined();

      // Household head should not have system management
      const householdSystemOverview = householdItems.find(item => item.id === 'system-overview');
      expect(householdSystemOverview).toBeUndefined();
    });
  });

  describe('filterNavigationByPermissions', () => {
    const testItems: NavigationItem[] = [
      {
        id: 'public',
        label: 'Public Page',
        href: '/public',
        order: 1
      },
      {
        id: 'admin-only',
        label: 'Admin Only',
        href: '/admin',
        permission: 'admin_access',
        order: 2
      },
      {
        id: 'special-perm',
        label: 'Special Permission',
        href: '/special',
        permission: 'special_permission',
        order: 3
      }
    ];

    test('allows access to items without permissions', () => {
      const filtered = filterNavigationByPermissions(testItems, ['basic_user']);
      const publicItem = filtered.find(item => item.id === 'public');
      expect(publicItem).toBeDefined();
    });

    test('filters out items requiring specific permissions', () => {
      const filtered = filterNavigationByPermissions(testItems, ['basic_user']);
      const adminItem = filtered.find(item => item.id === 'admin-only');
      expect(adminItem).toBeUndefined();
    });

    test('allows access when user has required permission', () => {
      const filtered = filterNavigationByPermissions(testItems, ['admin_access']);
      const adminItem = filtered.find(item => item.id === 'admin-only');
      expect(adminItem).toBeDefined();
    });

    test('allows access to all items with wildcard permission', () => {
      const filtered = filterNavigationByPermissions(testItems, ['*']);
      expect(filtered).toHaveLength(testItems.length);
    });
  });

  describe('findActiveNavigationItem', () => {
    const testItems: NavigationItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        order: 1
      },
      {
        id: 'users',
        label: 'Users',
        href: '/users',
        order: 2,
        children: [
          {
            id: 'user-list',
            label: 'User List',
            href: '/users/list',
            order: 1
          },
          {
            id: 'user-create',
            label: 'Create User',
            href: '/users/create',
            order: 2
          }
        ]
      }
    ];

    test('finds exact match for top-level item', () => {
      const active = findActiveNavigationItem(testItems, '/dashboard');
      expect(active).toBeDefined();
      expect(active?.id).toBe('dashboard');
    });

    test('finds nested item in children', () => {
      const active = findActiveNavigationItem(testItems, '/users/create');
      expect(active).toBeDefined();
      expect(active?.id).toBe('user-create');
    });

    test('finds parent item for nested routes', () => {
      const active = findActiveNavigationItem(testItems, '/users/profile/123');
      expect(active).toBeDefined();
      expect(active?.id).toBe('users');
    });

    test('returns null for non-matching path', () => {
      const active = findActiveNavigationItem(testItems, '/nonexistent');
      expect(active).toBeNull();
    });
  });

  describe('groupNavigationItems', () => {
    const testItems: NavigationItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        group: 'overview',
        order: 1
      },
      {
        id: 'users',
        label: 'Users',
        href: '/users',
        group: 'management',
        order: 1
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '/settings',
        group: 'management',
        order: 2
      },
      {
        id: 'ungrouped',
        label: 'Ungrouped',
        href: '/ungrouped',
        order: 1
      }
    ];

    test('groups items by group property', () => {
      const grouped = groupNavigationItems(testItems);

      expect(grouped.overview).toHaveLength(1);
      expect(grouped.management).toHaveLength(2);
      expect(grouped.default).toHaveLength(1);

      expect(grouped.overview[0].id).toBe('dashboard');
      expect(grouped.management).toContainEqual(
        expect.objectContaining({ id: 'users' })
      );
      expect(grouped.management).toContainEqual(
        expect.objectContaining({ id: 'settings' })
      );
    });
  });

  describe('canAccessItem', () => {
    const testItem: NavigationItem = {
      id: 'admin-page',
      label: 'Admin Page',
      href: '/admin',
      permission: 'admin_access',
      order: 1
    };

    const publicItem: NavigationItem = {
      id: 'public-page',
      label: 'Public Page',
      href: '/public',
      order: 1
    };

    test('allows access to item without permission requirement', () => {
      expect(canAccessItem(publicItem, ['basic_user'])).toBe(true);
    });

    test('denies access when user lacks permission', () => {
      expect(canAccessItem(testItem, ['basic_user'])).toBe(false);
    });

    test('allows access when user has required permission', () => {
      expect(canAccessItem(testItem, ['admin_access'])).toBe(true);
    });

    test('allows access with wildcard permission', () => {
      expect(canAccessItem(testItem, ['*'])).toBe(true);
    });
  });

  describe('validateNavigationConfig', () => {
    test('validates correct configuration structure', () => {
      const result = validateNavigationConfig(NAVIGATION_CONFIG);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('detects missing role configuration', () => {
      const invalidConfig = {
        superadmin: NAVIGATION_CONFIG.superadmin
        // Missing other roles
      } as any;

      const result = validateNavigationConfig(invalidConfig);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('admin_head'))).toBe(true);
    });
  });

  describe('flattenNavigationItems', () => {
    const nestedItems: NavigationItem[] = [
      {
        id: 'parent',
        label: 'Parent',
        href: '/parent',
        order: 1,
        children: [
          {
            id: 'child1',
            label: 'Child 1',
            href: '/parent/child1',
            order: 1
          },
          {
            id: 'child2',
            label: 'Child 2',
            href: '/parent/child2',
            order: 2
          }
        ]
      },
      {
        id: 'standalone',
        label: 'Standalone',
        href: '/standalone',
        order: 2
      }
    ];

    test('flattens nested navigation structure', () => {
      const flattened = flattenNavigationItems(nestedItems);
      expect(flattened).toHaveLength(4); // parent + 2 children + standalone

      const ids = flattened.map(item => item.id);
      expect(ids).toContain('parent');
      expect(ids).toContain('child1');
      expect(ids).toContain('child2');
      expect(ids).toContain('standalone');
    });
  });

  describe('searchNavigationItems', () => {
    const searchItems: NavigationItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        order: 1
      },
      {
        id: 'user-management',
        label: 'User Management',
        href: '/users',
        order: 2
      },
      {
        id: 'system-settings',
        label: 'System Settings',
        href: '/system/settings',
        order: 3
      }
    ];

    test('searches by label', () => {
      const results = searchNavigationItems(searchItems, 'user');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('user-management');
    });

    test('searches by href', () => {
      const results = searchNavigationItems(searchItems, 'system');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('system-settings');
    });

    test('case insensitive search', () => {
      const results = searchNavigationItems(searchItems, 'DASHBOARD');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('dashboard');
    });

    test('returns empty array for no matches', () => {
      const results = searchNavigationItems(searchItems, 'nonexistent');
      expect(results).toHaveLength(0);
    });
  });

  describe('getNavigationStats', () => {
    test('returns correct stats for superadmin', () => {
      const stats = getNavigationStats('superadmin');
      expect(stats.totalItems).toBeGreaterThan(0);
      expect(stats.totalGroups).toBeGreaterThan(0);
      expect(stats.permissionsCount).toBeGreaterThan(0);
    });

    test('returns stats for different roles', () => {
      const superadminStats = getNavigationStats('superadmin');
      const householdStats = getNavigationStats('household_head');

      // Both roles should have stats
      expect(superadminStats.totalItems).toBeGreaterThan(0);
      expect(householdStats.totalItems).toBeGreaterThan(0);
      expect(superadminStats.totalGroups).toBeGreaterThan(0);
      expect(householdStats.totalGroups).toBeGreaterThan(0);
    });
  });
});
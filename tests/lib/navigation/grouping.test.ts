/**
 * Navigation Grouping Tests
 * Tests for enhanced navigation grouping and organization functionality
 */

import {
  groupNavigationItems,
  groupNavigationItemsWithMetadata,
  sortNavigationItems,
  sortNavigationGroups
} from '@/lib/navigation/utils';
import type { NavigationItem, NavigationGroup } from '@/types/navigation';

describe('Navigation Grouping', () => {
  const testItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      group: 'overview',
      order: 1
    },
    {
      id: 'profile',
      label: 'Profile',
      href: '/profile',
      group: 'overview',
      order: 2
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
      order: 3
    },
    {
      id: 'reports',
      label: 'Reports',
      href: '/reports',
      group: 'management',
      order: 2
    },
    {
      id: 'ungrouped',
      label: 'Ungrouped Item',
      href: '/ungrouped',
      order: 1
    }
  ];

  const testGroups: NavigationGroup[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: 'home',
      order: 1,
      collapsible: false,
      collapsed: false
    },
    {
      id: 'management',
      label: 'Management',
      icon: 'briefcase',
      order: 2,
      collapsible: true,
      collapsed: false
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'chart-bar',
      order: 3,
      collapsible: true,
      collapsed: true
    }
  ];

  describe('groupNavigationItems', () => {
    test('groups items by group property', () => {
      const grouped = groupNavigationItems(testItems);

      expect(grouped.overview).toHaveLength(2);
      expect(grouped.management).toHaveLength(3);
      expect(grouped.default).toHaveLength(1);

      expect(grouped.overview.map(item => item.id)).toEqual(['dashboard', 'profile']);
      expect(grouped.management.map(item => item.id)).toEqual(['users', 'settings', 'reports']);
      expect(grouped.default.map(item => item.id)).toEqual(['ungrouped']);
    });

    test('handles items without group property', () => {
      const itemsWithoutGroup = [
        {
          id: 'item1',
          label: 'Item 1',
          href: '/item1',
          order: 1
        },
        {
          id: 'item2',
          label: 'Item 2',
          href: '/item2',
          order: 2
        }
      ];

      const grouped = groupNavigationItems(itemsWithoutGroup);

      expect(grouped.default).toHaveLength(2);
      expect(grouped.default.map(item => item.id)).toEqual(['item1', 'item2']);
    });

    test('handles empty items array', () => {
      const grouped = groupNavigationItems([]);
      expect(Object.keys(grouped)).toHaveLength(0);
    });
  });

  describe('groupNavigationItemsWithMetadata', () => {
    test('returns grouped items with group metadata', () => {
      const groupedWithMetadata = groupNavigationItemsWithMetadata(testItems, testGroups);

      expect(groupedWithMetadata).toHaveLength(2); // Only groups with items

      const overviewGroup = groupedWithMetadata.find(g => g.group.id === 'overview');
      const managementGroup = groupedWithMetadata.find(g => g.group.id === 'management');

      expect(overviewGroup).toBeDefined();
      expect(overviewGroup!.items).toHaveLength(2);
      expect(overviewGroup!.group.label).toBe('Overview');

      expect(managementGroup).toBeDefined();
      expect(managementGroup!.items).toHaveLength(3);
      expect(managementGroup!.group.label).toBe('Management');
    });

    test('sorts items within groups by order', () => {
      const groupedWithMetadata = groupNavigationItemsWithMetadata(testItems, testGroups);
      const managementGroup = groupedWithMetadata.find(g => g.group.id === 'management');

      expect(managementGroup!.items.map(item => item.id)).toEqual(['users', 'reports', 'settings']);
      expect(managementGroup!.items.map(item => item.order)).toEqual([1, 2, 3]);
    });

    test('excludes groups with no items', () => {
      const groupedWithMetadata = groupNavigationItemsWithMetadata(testItems, testGroups);
      const analyticsGroup = groupedWithMetadata.find(g => g.group.id === 'analytics');

      expect(analyticsGroup).toBeUndefined();
    });

    test('maintains group order based on groups array', () => {
      const groupedWithMetadata = groupNavigationItemsWithMetadata(testItems, testGroups);

      expect(groupedWithMetadata[0].group.id).toBe('overview');
      expect(groupedWithMetadata[1].group.id).toBe('management');
    });
  });

  describe('sortNavigationItems', () => {
    test('sorts items by order property', () => {
      const unsortedItems = [
        { id: 'c', label: 'C', href: '/c', order: 3 },
        { id: 'a', label: 'A', href: '/a', order: 1 },
        { id: 'b', label: 'B', href: '/b', order: 2 }
      ];

      const sorted = sortNavigationItems(unsortedItems);

      expect(sorted.map(item => item.id)).toEqual(['a', 'b', 'c']);
      expect(sorted.map(item => item.order)).toEqual([1, 2, 3]);
    });

    test('handles items with same order', () => {
      const itemsWithSameOrder = [
        { id: 'b', label: 'B', href: '/b', order: 1 },
        { id: 'a', label: 'A', href: '/a', order: 1 },
        { id: 'c', label: 'C', href: '/c', order: 2 }
      ];

      const sorted = sortNavigationItems(itemsWithSameOrder);

      expect(sorted[2].id).toBe('c'); // Highest order should be last
      expect(sorted.slice(0, 2).map(item => item.order)).toEqual([1, 1]);
    });

    test('does not mutate original array', () => {
      const originalItems = [
        { id: 'c', label: 'C', href: '/c', order: 3 },
        { id: 'a', label: 'A', href: '/a', order: 1 }
      ];
      const originalOrder = originalItems.map(item => item.id);

      sortNavigationItems(originalItems);

      expect(originalItems.map(item => item.id)).toEqual(originalOrder);
    });
  });

  describe('sortNavigationGroups', () => {
    test('sorts groups by order property', () => {
      const unsortedGroups = [
        { id: 'c', label: 'C', order: 3, collapsible: false },
        { id: 'a', label: 'A', order: 1, collapsible: false },
        { id: 'b', label: 'B', order: 2, collapsible: false }
      ];

      const sorted = sortNavigationGroups(unsortedGroups);

      expect(sorted.map(group => group.id)).toEqual(['a', 'b', 'c']);
      expect(sorted.map(group => group.order)).toEqual([1, 2, 3]);
    });

    test('does not mutate original array', () => {
      const originalGroups = [
        { id: 'c', label: 'C', order: 3, collapsible: false },
        { id: 'a', label: 'A', order: 1, collapsible: false }
      ];
      const originalOrder = originalGroups.map(group => group.id);

      sortNavigationGroups(originalGroups);

      expect(originalGroups.map(group => group.id)).toEqual(originalOrder);
    });
  });

  describe('Integration Tests', () => {
    test('full grouping and sorting workflow', () => {
      // Test the complete workflow from raw items to organized groups
      const groupedWithMetadata = groupNavigationItemsWithMetadata(testItems, testGroups);

      // Should have 2 groups with items
      expect(groupedWithMetadata).toHaveLength(2);

      // Groups should be in correct order
      expect(groupedWithMetadata[0].group.id).toBe('overview');
      expect(groupedWithMetadata[1].group.id).toBe('management');

      // Items within groups should be sorted
      const overviewItems = groupedWithMetadata[0].items;
      expect(overviewItems.map(item => item.order)).toEqual([1, 2]);

      const managementItems = groupedWithMetadata[1].items;
      expect(managementItems.map(item => item.order)).toEqual([1, 2, 3]);
    });

    test('handles mixed scenarios with various group configurations', () => {
      const mixedItems: NavigationItem[] = [
        { id: 'item1', label: 'Item 1', href: '/1', group: 'group1', order: 2 },
        { id: 'item2', label: 'Item 2', href: '/2', order: 1 }, // No group
        { id: 'item3', label: 'Item 3', href: '/3', group: 'group1', order: 1 },
        { id: 'item4', label: 'Item 4', href: '/4', group: 'group2', order: 1 },
        { id: 'item5', label: 'Item 5', href: '/5', order: 2 } // No group
      ];

      const mixedGroups: NavigationGroup[] = [
        { id: 'group1', label: 'Group 1', order: 2, collapsible: false },
        { id: 'group2', label: 'Group 2', order: 1, collapsible: true }
      ];

      const result = groupNavigationItemsWithMetadata(mixedItems, mixedGroups);

      // Groups should be ordered by their order property
      expect(result[0].group.id).toBe('group2');
      expect(result[1].group.id).toBe('group1');

      // Items in group1 should be sorted by order
      const group1Items = result[1].items;
      expect(group1Items.map(item => item.id)).toEqual(['item3', 'item1']);

      // Ungrouped items should still be accessible via basic grouping
      const basicGrouped = groupNavigationItems(mixedItems);
      expect(basicGrouped.default).toHaveLength(2);
      expect(basicGrouped.default.map(item => item.id)).toEqual(['item2', 'item5']);
    });
  });
});
/**
 * Test navigation configuration for all user roles
 */

import { getNavigationForRole } from '@/lib/config/navigation';
import { getAllRoles, getRoleDisplayName } from '@/lib/config/roles';
import type { UserRole } from '@/types/auth';

describe('Role Navigation Configuration', () => {
  const allRoles = getAllRoles();

  test('all roles should have navigation items', () => {
    allRoles.forEach(role => {
      const navigation = getNavigationForRole(role);
      expect(navigation.length).toBeGreaterThan(0);
      expect(navigation[0].id).toBe('dashboard'); // All roles should start with dashboard
    });
  });

  test('superadmin should have correct navigation items', () => {
    const navigation = getNavigationForRole('superadmin');
    const itemIds = navigation.map(item => item.id);

    expect(itemIds).toEqual([
      'dashboard',
      'villages',
      'users',
      'superadmin-payments',
      'reports'
    ]);

    // Check payments has badge
    const paymentsItem = navigation.find(item => item.id === 'superadmin-payments');
    expect(paymentsItem?.badge).toBe('3');
  });

  test('admin_head should have correct navigation items', () => {
    const navigation = getNavigationForRole('admin_head');
    const itemIds = navigation.map(item => item.id);

    expect(itemIds).toEqual([
      'dashboard',
      'household-approvals',
      'active-households',
      'fees-management',
      'payment-status',
      'rules',
      'announcements',
      'construction-permits'
    ]);
  });

  test('admin_officer should have correct navigation items', () => {
    const navigation = getNavigationForRole('admin_officer');
    const itemIds = navigation.map(item => item.id);

    expect(itemIds).toEqual([
      'dashboard',
      'household-records',
      'sticker-requests',
      'active-stickers',
      'officer-construction-permits',
      'manual-payments',
      'resident-inquiries'
    ]);
  });

  test('household_head should have correct navigation items', () => {
    const navigation = getNavigationForRole('household_head');
    const itemIds = navigation.map(item => item.id);

    expect(itemIds).toEqual([
      'dashboard',
      'members',
      'visitor-management',
      'active-guest-passes',
      'household-sticker-requests',
      'service-requests',
      'announcements-rules',
      'fee-status'
    ]);
  });

  test('security_officer should have correct navigation items', () => {
    const navigation = getNavigationForRole('security_officer');
    const itemIds = navigation.map(item => item.id);

    expect(itemIds).toEqual([
      'dashboard',
      'sticker-validation',
      'guest-registration',
      'guest-approval-status',
      'guest-pass-scan',
      'delivery-logging',
      'construction-worker-entry',
      'incident-report',
      'shift-history'
    ]);
  });

  test('all navigation items should have required properties', () => {
    allRoles.forEach(role => {
      const navigation = getNavigationForRole(role);

      navigation.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('href');
        expect(item).toHaveProperty('icon');
        expect(item).toHaveProperty('description');

        // Check that all hrefs start with /
        expect(item.href).toMatch(/^\/.*$/);

        // Check that icons are valid Material Icons names (lowercase with underscores)
        expect(item.icon).toMatch(/^[a-z_]+$/);
      });
    });
  });

  test('role display names should be correctly formatted', () => {
    expect(getRoleDisplayName('superadmin')).toBe('super admin');
    expect(getRoleDisplayName('admin_head')).toBe('Head Admin');
    expect(getRoleDisplayName('admin_officer')).toBe('Admin Officer');
    expect(getRoleDisplayName('household_head')).toBe('Household Head');
    expect(getRoleDisplayName('security_officer')).toBe('Security Officer');
  });

  test('only superadmin should have badge on payments item', () => {
    allRoles.forEach(role => {
      const navigation = getNavigationForRole(role);
      const itemsWithBadges = navigation.filter(item => item.badge);

      if (role === 'superadmin') {
        expect(itemsWithBadges).toHaveLength(1);
        expect(itemsWithBadges[0].id).toBe('superadmin-payments');
        expect(itemsWithBadges[0].badge).toBe('3');
      } else {
        expect(itemsWithBadges).toHaveLength(0);
      }
    });
  });

  test('all navigation items should have Material Icons compatible icon names', () => {
    const materialIconsPattern = /^[a-z][a-z0-9_]*[a-z0-9]?$/;

    allRoles.forEach(role => {
      const navigation = getNavigationForRole(role);

      navigation.forEach(item => {
        expect(item.icon).toMatch(materialIconsPattern);
      });
    });
  });
});
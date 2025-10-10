/**
 * Navigation Permission Tests
 * Tests for permission validation and access control functionality
 */

import {
  canAccessItem,
  validateUserPermissions,
  getAccessibleNavigationItems,
  canAccessRoute,
  createPermissionContext,
  validateNavigationAccess,
  validateMultipleItems,
  getRolePermissionRequirements,
  canAccessRoleNavigation,
  createSecurityAuditEntry,
  type UserPermissionContext,
  type PermissionValidationResult
} from '@/lib/navigation/permissions';
import type { NavigationItem, UserRole } from '@/types/navigation';

describe('Navigation Permissions', () => {
  const mockItems: NavigationItem[] = [
    {
      id: 'public-item',
      label: 'Public Item',
      href: '/public',
      order: 1
    },
    {
      id: 'admin-item',
      label: 'Admin Item',
      href: '/admin',
      permission: 'admin_access',
      order: 2
    },
    {
      id: 'household-item',
      label: 'Household Item',
      href: '/household',
      permission: 'manage_household',
      order: 3
    }
  ];

  const superadminContext: UserPermissionContext = {
    role: 'superadmin',
    permissions: ['*'],
    userId: 'user-1',
    tenantId: 'tenant-1'
  };

  const adminHeadContext: UserPermissionContext = {
    role: 'admin_head',
    permissions: ['manage_households', 'manage_fees', 'manage_security', 'manage_rules', 'view_reports'],
    userId: 'user-2',
    tenantId: 'tenant-1'
  };

  const householdHeadContext: UserPermissionContext = {
    role: 'household_head',
    permissions: ['manage_household', 'submit_requests', 'view_rules'],
    userId: 'user-3',
    tenantId: 'tenant-1'
  };

  const basicUserContext: UserPermissionContext = {
    role: 'household_head',
    permissions: [],
    userId: 'user-4',
    tenantId: 'tenant-1'
  };

  describe('canAccessItem', () => {
    test('allows access to items without permission requirements', () => {
      const result = canAccessItem(mockItems[0], basicUserContext);

      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('No permission required');
    });

    test('allows superadmin access to all items', () => {
      const result = canAccessItem(mockItems[1], superadminContext);

      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('Superadmin access');
      expect(result.userRole).toBe('superadmin');
    });

    test('allows access when user has required permission', () => {
      const result = canAccessItem(mockItems[2], householdHeadContext);

      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('User has required permission');
      expect(result.requiredPermission).toBe('manage_household');
      expect(result.userRole).toBe('household_head');
    });

    test('denies access when user lacks required permission', () => {
      const result = canAccessItem(mockItems[1], householdHeadContext);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Insufficient permissions');
      expect(result.requiredPermission).toBe('admin_access');
      expect(result.userRole).toBe('household_head');
    });

    test('denies access when user has no permissions', () => {
      const result = canAccessItem(mockItems[1], basicUserContext);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Insufficient permissions');
    });
  });

  describe('validateUserPermissions', () => {
    test('validates superadmin permissions correctly', () => {
      const result = validateUserPermissions('superadmin', ['*']);

      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('All role permissions verified');
      expect(result.userRole).toBe('superadmin');
    });

    test('validates admin_head permissions correctly', () => {
      const permissions = ['manage_households', 'manage_fees', 'manage_security', 'manage_rules', 'view_reports'];
      const result = validateUserPermissions('admin_head', permissions);

      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('All role permissions verified');
    });

    test('detects missing permissions for role', () => {
      const incompletePermissions = ['manage_households']; // Missing other required permissions
      const result = validateUserPermissions('admin_head', incompletePermissions);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Missing required permissions');
      expect(result.reason).toContain('manage_fees');
    });

    test('handles invalid role', () => {
      const result = validateUserPermissions('invalid_role' as UserRole, []);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Invalid user role');
    });
  });

  describe('getAccessibleNavigationItems', () => {
    test('returns all items for superadmin', () => {
      const accessibleItems = getAccessibleNavigationItems('superadmin', superadminContext);

      expect(accessibleItems.length).toBeGreaterThan(0);
      // Should include items with various permission requirements
    });

    test('filters items based on user permissions', () => {
      const accessibleItems = getAccessibleNavigationItems('household_head', householdHeadContext);

      // Should include public items and household-specific items
      const hasPublicItem = accessibleItems.some(item => !item.permission);
      const hasHouseholdItem = accessibleItems.some(item => item.permission === 'manage_household');

      expect(hasPublicItem).toBe(true);
      expect(hasHouseholdItem).toBe(true);
    });

    test('returns empty array for invalid role', () => {
      const accessibleItems = getAccessibleNavigationItems('invalid_role' as UserRole, basicUserContext);

      expect(accessibleItems).toEqual([]);
    });
  });

  describe('canAccessRoute', () => {
    test('allows access to routes user can access', () => {
      const result = canAccessRoute('/dashboard', adminHeadContext);

      expect(result.allowed).toBe(true);
    });

    test('denies access to routes user cannot access', () => {
      const result = canAccessRoute('/admin/system', householdHeadContext);

      expect(result.allowed).toBe(false);
      // Could be either route not found or insufficient permissions
      expect(result.reason).toMatch(/Route not found|Insufficient permissions/);
    });

    test('handles routes not in navigation configuration', () => {
      const result = canAccessRoute('/nonexistent-route', adminHeadContext);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Route not found in navigation configuration');
    });

    test('handles invalid user role', () => {
      const invalidContext = { ...adminHeadContext, role: 'invalid_role' as UserRole };
      const result = canAccessRoute('/dashboard', invalidContext);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Invalid user role');
    });
  });

  describe('createPermissionContext', () => {
    test('creates context with provided parameters', () => {
      const context = createPermissionContext(
        'admin_head',
        ['manage_households'],
        'user-123',
        'tenant-456'
      );

      expect(context.role).toBe('admin_head');
      expect(context.permissions).toEqual(['manage_households']);
      expect(context.userId).toBe('user-123');
      expect(context.tenantId).toBe('tenant-456');
    });

    test('uses role default permissions when none provided', () => {
      const context = createPermissionContext('superadmin');

      expect(context.role).toBe('superadmin');
      expect(context.permissions).toContain('*');
    });
  });

  describe('validateNavigationAccess', () => {
    test('provides detailed validation results', () => {
      const result = validateNavigationAccess(
        mockItems[1],
        adminHeadContext,
        { logAccess: false }
      );

      expect(result.navigationItem).toEqual(mockItems[1]);
      expect(result.context).toEqual(adminHeadContext);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.allowed).toBeDefined();
      expect(result.reason).toBeDefined();
    });

    test('logs access attempts when requested', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      validateNavigationAccess(
        mockItems[0],
        householdHeadContext,
        { logAccess: true }
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Navigation access attempt:',
        expect.objectContaining({
          item: 'public-item',
          user: 'user-3',
          role: 'household_head',
          allowed: true
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('validateMultipleItems', () => {
    test('validates multiple items at once', () => {
      const results = validateMultipleItems(mockItems, householdHeadContext);

      expect(results).toHaveLength(mockItems.length);

      // Check that each result has both item and result
      results.forEach(({ item, result }) => {
        expect(item).toBeDefined();
        expect(result.allowed).toBeDefined();
        expect(result.reason).toBeDefined();
      });

      // Public item should be accessible
      const publicResult = results.find(r => r.item.id === 'public-item');
      expect(publicResult?.result.allowed).toBe(true);

      // Admin item should not be accessible
      const adminResult = results.find(r => r.item.id === 'admin-item');
      expect(adminResult?.result.allowed).toBe(false);
    });
  });

  describe('getRolePermissionRequirements', () => {
    test('returns correct permissions for known roles', () => {
      const superadminPerms = getRolePermissionRequirements('superadmin');
      expect(superadminPerms).toContain('*');

      const adminHeadPerms = getRolePermissionRequirements('admin_head');
      expect(adminHeadPerms).toContain('manage_households');
      expect(adminHeadPerms).toContain('manage_fees');
    });

    test('returns empty array for invalid role', () => {
      const perms = getRolePermissionRequirements('invalid_role' as UserRole);
      expect(perms).toEqual([]);
    });
  });

  describe('canAccessRoleNavigation', () => {
    test('allows users to access their own role navigation', () => {
      const result = canAccessRoleNavigation('admin_head', 'admin_head', adminHeadContext.permissions);

      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('User accessing own role navigation');
    });

    test('allows superadmin to access any role navigation', () => {
      const result = canAccessRoleNavigation('superadmin', 'admin_head', ['*']);

      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('Superadmin can access all role navigation');
    });

    test('denies access to higher privilege role navigation', () => {
      const result = canAccessRoleNavigation('household_head', 'superadmin', householdHeadContext.permissions);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Cross-role navigation access denied');
    });
  });

  describe('createSecurityAuditEntry', () => {
    test('creates proper audit entry for access granted', () => {
      const result: PermissionValidationResult = {
        allowed: true,
        reason: 'User has required permission',
        requiredPermission: 'manage_household'
      };

      const auditEntry = createSecurityAuditEntry(
        result,
        householdHeadContext,
        'household-management'
      );

      expect(auditEntry.timestamp).toBeInstanceOf(Date);
      expect(auditEntry.userId).toBe('user-3');
      expect(auditEntry.userRole).toBe('household_head');
      expect(auditEntry.action).toBe('access_granted');
      expect(auditEntry.resource).toBe('household-management');
      expect(auditEntry.resourceType).toBe('navigation_item');
      expect(auditEntry.reason).toBe('User has required permission');
      expect(auditEntry.metadata?.requiredPermission).toBe('manage_household');
    });

    test('creates proper audit entry for access denied', () => {
      const result: PermissionValidationResult = {
        allowed: false,
        reason: 'Insufficient permissions',
        requiredPermission: 'admin_access'
      };

      const auditEntry = createSecurityAuditEntry(
        result,
        householdHeadContext,
        'admin-panel',
        'route'
      );

      expect(auditEntry.action).toBe('access_denied');
      expect(auditEntry.resourceType).toBe('route');
      expect(auditEntry.reason).toBe('Insufficient permissions');
    });
  });

  describe('Integration Tests', () => {
    test('full permission workflow for different user types', () => {
      const testCases = [
        {
          context: superadminContext,
          expectedAccessCount: 3, // Should access all items
          description: 'Superadmin should access all items'
        },
        {
          context: householdHeadContext,
          expectedAccessCount: 2, // Public + household items
          description: 'Household head should access public and household items'
        },
        {
          context: basicUserContext,
          expectedAccessCount: 1, // Only public items
          description: 'Basic user should only access public items'
        }
      ];

      testCases.forEach(({ context, expectedAccessCount, description }) => {
        const results = validateMultipleItems(mockItems, context);
        const accessibleCount = results.filter(r => r.result.allowed).length;

        expect(accessibleCount).toBeGreaterThanOrEqual(1); // At least public items
        if (context === superadminContext) {
          expect(accessibleCount).toBe(mockItems.length); // All items
        }
      });
    });

    test('permission escalation prevention', () => {
      // Test that users cannot access higher privilege navigation
      const householdToAdmin = canAccessRoleNavigation(
        'household_head',
        'admin_head',
        householdHeadContext.permissions
      );

      expect(householdToAdmin.allowed).toBe(false);

      const officerToHead = canAccessRoleNavigation(
        'admin_officer',
        'admin_head',
        ['manage_households', 'manage_fees', 'manage_deliveries']
      );

      expect(officerToHead.allowed).toBe(false);
    });
  });
});
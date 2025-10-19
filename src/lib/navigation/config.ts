/**
 * Navigation Configuration for Village Management Platform
 * Defines role-based navigation arrays for all user roles
 */

import type { UserRole, RoleNavigationMap } from '@/types/navigation';

export const NAVIGATION_CONFIG: Record<UserRole, RoleNavigationMap> = {
  superadmin: {
    role: 'superadmin',
    permissions: ['*'], // All permissions
    groups: [
      {
        id: 'system',
        label: 'System Management',
        icon: 'settings',
        order: 1,
        collapsible: false,
        collapsed: false
      },
      {
        id: 'villages',
        label: 'Villages & Tenants',
        icon: 'building',
        order: 2,
        collapsible: true,
        collapsed: false
      },
      {
        id: 'reports',
        label: 'Analytics & Reports',
        icon: 'chart-bar',
        order: 3,
        collapsible: true,
        collapsed: true
      }
    ],
    items: [
      {
        id: 'system-overview',
        label: 'System Overview',
        href: '/admin/system',
        icon: 'monitor',
        group: 'system',
        order: 1
      },
      {
        id: 'villages-management',
        label: 'All Villages',
        href: '/admin/villages',
        icon: 'building',
        group: 'villages',
        order: 1
      },
      {
        id: 'users-management',
        label: 'User Management',
        href: '/admin/users',
        icon: 'users',
        group: 'villages',
        order: 2
      },
      {
        id: 'system-reports',
        label: 'System Reports',
        href: '/admin/reports',
        icon: 'file-text',
        group: 'reports',
        order: 1
      }
    ]
  },

  admin_head: {
    role: 'admin_head',
    permissions: ['manage_households', 'manage_fees', 'manage_security', 'manage_rules', 'view_reports'],
    groups: [
      {
        id: 'overview',
        label: 'Dashboard & Overview',
        icon: 'home',
        order: 1,
        collapsible: false,
        collapsed: false
      },
      {
        id: 'management',
        label: 'Village Management',
        icon: 'briefcase',
        order: 2,
        collapsible: true,
        collapsed: false
      },
      {
        id: 'reports',
        label: 'Reports & Analytics',
        icon: 'chart-bar',
        order: 3,
        collapsible: true,
        collapsed: true
      }
    ],
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: 'home',
        group: 'overview',
        order: 1
      },
      {
        id: 'households',
        label: 'Households',
        href: '/households',
        icon: 'users',
        permission: 'manage_households',
        group: 'management',
        order: 1
      },
      {
        id: 'fees',
        label: 'Fee Management',
        href: '/fees',
        icon: 'dollar-sign',
        permission: 'manage_fees',
        group: 'management',
        order: 2
      },
      {
        id: 'security',
        label: 'Security',
        href: '/security',
        icon: 'shield',
        permission: 'manage_security',
        group: 'management',
        order: 3
      },
      {
        id: 'rules',
        label: 'Village Rules',
        href: '/rules',
        icon: 'file-text',
        permission: 'manage_rules',
        group: 'management',
        order: 4
      },
      {
        id: 'sticker-approvals',
        label: 'Sticker Approvals',
        href: '/admin/stickers',
        icon: 'badge-check',
        permission: 'manage_households',
        group: 'management',
        order: 5
      },
      {
        id: 'village-reports',
        label: 'Village Reports',
        href: '/reports',
        icon: 'bar-chart',
        permission: 'view_reports',
        group: 'reports',
        order: 1
      }
    ]
  },

  admin_officer: {
    role: 'admin_officer',
    permissions: ['manage_households', 'manage_fees', 'manage_deliveries'],
    groups: [
      {
        id: 'overview',
        label: 'Dashboard & Overview',
        icon: 'home',
        order: 1,
        collapsible: false,
        collapsed: false
      },
      {
        id: 'operations',
        label: 'Daily Operations',
        icon: 'clipboard',
        order: 2,
        collapsible: true,
        collapsed: false
      }
    ],
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: 'home',
        group: 'overview',
        order: 1
      },
      {
        id: 'households',
        label: 'Households',
        href: '/households',
        icon: 'users',
        permission: 'manage_households',
        group: 'operations',
        order: 1
      },
      {
        id: 'fees',
        label: 'Fee Collection',
        href: '/fees',
        icon: 'dollar-sign',
        permission: 'manage_fees',
        group: 'operations',
        order: 2
      },
      {
        id: 'deliveries',
        label: 'Deliveries',
        href: '/deliveries',
        icon: 'truck',
        permission: 'manage_deliveries',
        group: 'operations',
        order: 3
      },
      {
        id: 'sticker-approvals',
        label: 'Sticker Approvals',
        href: '/admin/stickers',
        icon: 'badge-check',
        permission: 'manage_households',
        group: 'operations',
        order: 4
      }
    ]
  },

  household_head: {
    role: 'household_head',
    permissions: ['manage_household', 'submit_requests', 'view_rules'],
    groups: [
      {
        id: 'overview',
        label: 'Dashboard & Overview',
        icon: 'home',
        order: 1,
        collapsible: false,
        collapsed: false
      },
      {
        id: 'household',
        label: 'My Household',
        icon: 'users',
        order: 2,
        collapsible: true,
        collapsed: false
      },
      {
        id: 'services',
        label: 'Village Services',
        icon: 'settings',
        order: 3,
        collapsible: true,
        collapsed: false
      }
    ],
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: 'home',
        group: 'overview',
        order: 1
      },
      {
        id: 'my-household',
        label: 'My Household',
        href: '/household',
        icon: 'users',
        permission: 'manage_household',
        group: 'household',
        order: 1
      },
      {
        id: 'guest-passes',
        label: 'Guest Passes',
        href: '/guest-passes',
        icon: 'key',
        group: 'services',
        order: 1
      },
      {
        id: 'requests',
        label: 'Requests',
        href: '/requests',
        icon: 'file-plus',
        permission: 'submit_requests',
        group: 'services',
        order: 2
      },
      {
        id: 'sticker-requests',
        label: 'Sticker Requests',
        href: '/sticker-requests',
        icon: 'badge',
        permission: 'submit_requests',
        group: 'services',
        order: 3
      },
      {
        id: 'rules',
        label: 'Village Rules',
        href: '/rules',
        icon: 'book',
        permission: 'view_rules',
        group: 'services',
        order: 4
      }
    ]
  },

  security_officer: {
    role: 'security_officer',
    permissions: ['manage_gate_logs', 'manage_visitors', 'view_incidents'],
    groups: [
      {
        id: 'overview',
        label: 'Dashboard & Overview',
        icon: 'home',
        order: 1,
        collapsible: false,
        collapsed: false
      },
      {
        id: 'security',
        label: 'Security Operations',
        icon: 'shield',
        order: 2,
        collapsible: true,
        collapsed: false
      }
    ],
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: 'home',
        group: 'overview',
        order: 1
      },
      {
        id: 'gate-logs',
        label: 'Gate Logs',
        href: '/security/gate-logs',
        icon: 'log-in',
        permission: 'manage_gate_logs',
        group: 'security',
        order: 1
      },
      {
        id: 'visitors',
        label: 'Visitor Management',
        href: '/security/visitors',
        icon: 'user-check',
        permission: 'manage_visitors',
        group: 'security',
        order: 2
      },
      {
        id: 'incidents',
        label: 'Incidents',
        href: '/security/incidents',
        icon: 'alert-triangle',
        permission: 'view_incidents',
        group: 'security',
        order: 3
      }
    ]
  }
};

export const NAVIGATION_VERSION = '1.0.0';
export const NAVIGATION_LAST_UPDATED = new Date('2025-01-10');

/**
 * Get navigation configuration for a specific role
 */
export function getNavigationConfigForRole(role: UserRole): RoleNavigationMap {
  return NAVIGATION_CONFIG[role];
}

/**
 * Get all available user roles
 */
export function getAllUserRoles(): UserRole[] {
  return Object.keys(NAVIGATION_CONFIG) as UserRole[];
}

/**
 * Check if a role exists in the configuration
 */
export function isValidUserRole(role: string): role is UserRole {
  return role in NAVIGATION_CONFIG;
}
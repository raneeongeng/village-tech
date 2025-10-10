# Quickstart: Role-Based Navigation Implementation

**Feature**: Role-Based Navigation Paths
**Target Audience**: Developers implementing navigation components
**Estimated Time**: 2-3 hours for basic implementation

## Overview

This guide walks through implementing role-based navigation for the Village Management Platform. The implementation provides distinct navigation arrays for five user roles with proper permission enforcement.

## Prerequisites

- Existing VMP project with authentication system
- TypeScript and Next.js 14+ App Router setup
- Familiarity with React hooks and context patterns
- Access to user role and permission data

## Implementation Steps

### Step 1: Install Dependencies

No additional dependencies required - uses existing VMP stack:
- React 18+
- Next.js 14+ App Router
- TypeScript
- TailwindCSS
- Existing authentication system

### Step 2: Create Navigation Type Definitions

Create the core types for navigation system:

```typescript
// src/types/navigation.ts
export type UserRole =
  | 'superadmin'
  | 'admin_head'
  | 'admin_officer'
  | 'household_head'
  | 'security_officer';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  permission?: string;
  group?: string;
  order: number;
  children?: NavigationItem[];
}

export interface NavigationGroup {
  id: string;
  label: string;
  icon?: string;
  order: number;
  collapsible: boolean;
}

export interface RoleNavigationMap {
  role: UserRole;
  groups: NavigationGroup[];
  items: NavigationItem[];
  permissions: string[];
}
```

### Step 3: Define Navigation Configuration

Create static navigation definitions:

```typescript
// src/lib/navigation/config.ts
import type { UserRole, RoleNavigationMap } from '@/types/navigation';

export const NAVIGATION_CONFIG: Record<UserRole, RoleNavigationMap> = {
  superadmin: {
    role: 'superadmin',
    permissions: ['*'],
    groups: [
      { id: 'system', label: 'System', icon: 'settings', order: 1, collapsible: false },
      { id: 'villages', label: 'Villages', icon: 'building', order: 2, collapsible: true }
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
        label: 'Villages',
        href: '/admin/villages',
        icon: 'building',
        group: 'villages',
        order: 1
      }
    ]
  },

  admin_head: {
    role: 'admin_head',
    permissions: ['manage_households', 'manage_fees', 'manage_security', 'view_reports'],
    groups: [
      { id: 'management', label: 'Management', icon: 'briefcase', order: 1, collapsible: false },
      { id: 'reports', label: 'Reports', icon: 'chart-bar', order: 2, collapsible: true }
    ],
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: 'home',
        group: 'management',
        order: 1
      },
      {
        id: 'households',
        label: 'Households',
        href: '/households',
        icon: 'users',
        permission: 'manage_households',
        group: 'management',
        order: 2
      },
      {
        id: 'fees',
        label: 'Fee Management',
        href: '/fees',
        icon: 'dollar-sign',
        permission: 'manage_fees',
        group: 'management',
        order: 3
      }
    ]
  },

  admin_officer: {
    role: 'admin_officer',
    permissions: ['manage_households', 'manage_fees', 'manage_deliveries'],
    groups: [
      { id: 'operations', label: 'Operations', icon: 'clipboard', order: 1, collapsible: false }
    ],
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: 'home',
        group: 'operations',
        order: 1
      },
      {
        id: 'households',
        label: 'Households',
        href: '/households',
        icon: 'users',
        permission: 'manage_households',
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
      }
    ]
  },

  household_head: {
    role: 'household_head',
    permissions: ['manage_household', 'submit_requests', 'view_rules'],
    groups: [
      { id: 'household', label: 'My Household', icon: 'home', order: 1, collapsible: false },
      { id: 'services', label: 'Services', icon: 'service', order: 2, collapsible: true }
    ],
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: 'home',
        group: 'household',
        order: 1
      },
      {
        id: 'my-household',
        label: 'My Household',
        href: '/household',
        icon: 'users',
        permission: 'manage_household',
        group: 'household',
        order: 2
      },
      {
        id: 'guest-passes',
        label: 'Guest Passes',
        href: '/guest-passes',
        icon: 'key',
        group: 'services',
        order: 1
      }
    ]
  },

  security_officer: {
    role: 'security_officer',
    permissions: ['manage_gate_logs', 'manage_visitors', 'view_incidents'],
    groups: [
      { id: 'security', label: 'Security', icon: 'shield', order: 1, collapsible: false }
    ],
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: 'home',
        group: 'security',
        order: 1
      },
      {
        id: 'gate-logs',
        label: 'Gate Logs',
        href: '/security/gate-logs',
        icon: 'log-in',
        permission: 'manage_gate_logs',
        group: 'security',
        order: 2
      },
      {
        id: 'visitors',
        label: 'Visitors',
        href: '/security/visitors',
        icon: 'user-check',
        permission: 'manage_visitors',
        group: 'security',
        order: 3
      }
    ]
  }
};
```

### Step 4: Create Navigation Utilities

Add helper functions for navigation logic:

```typescript
// src/lib/navigation/utils.ts
import type { NavigationItem, UserRole } from '@/types/navigation';
import { NAVIGATION_CONFIG } from './config';

export function getNavigationForRole(role: UserRole): NavigationItem[] {
  return NAVIGATION_CONFIG[role]?.items || [];
}

export function filterNavigationByPermissions(
  items: NavigationItem[],
  userPermissions: string[]
): NavigationItem[] {
  return items.filter(item => {
    if (!item.permission) return true;
    return userPermissions.includes('*') || userPermissions.includes(item.permission);
  });
}

export function findActiveNavigationItem(
  items: NavigationItem[],
  currentPath: string
): NavigationItem | null {
  for (const item of items) {
    if (item.href === currentPath) return item;
    if (item.children) {
      const found = findActiveNavigationItem(item.children, currentPath);
      if (found) return found;
    }
  }
  return null;
}

export function groupNavigationItems(
  items: NavigationItem[]
): Record<string, NavigationItem[]> {
  return items.reduce((groups, item) => {
    const group = item.group || 'default';
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, NavigationItem[]>);
}
```

### Step 5: Create Enhanced Navigation Hook

Extend the existing useNavigation hook:

```typescript
// src/hooks/useNavigation.tsx (enhanced version)
'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './useAuth';
import {
  getNavigationForRole,
  filterNavigationByPermissions,
  findActiveNavigationItem,
  groupNavigationItems
} from '@/lib/navigation/utils';

export function useNavigation() {
  const { user } = useAuth();
  const pathname = usePathname();

  const navigation = useMemo(() => {
    if (!user?.role) return { items: [], groups: {}, activeItem: null };

    const roleNavigation = getNavigationForRole(user.role.code as any);
    const userPermissions = user.role ? [user.role.code] : [];
    const filteredItems = filterNavigationByPermissions(roleNavigation, userPermissions);
    const activeItem = findActiveNavigationItem(filteredItems, pathname);
    const groups = groupNavigationItems(filteredItems);

    return {
      items: filteredItems,
      groups,
      activeItem
    };
  }, [user?.role, pathname]);

  return navigation;
}
```

### Step 6: Create Navigation Components

Create reusable navigation components:

```typescript
// src/components/navigation/NavigationItem.tsx
'use client';

import Link from 'next/link';
import { useNavigation } from '@/hooks/useNavigation';
import type { NavigationItem } from '@/types/navigation';

interface NavigationItemProps {
  item: NavigationItem;
  level?: number;
}

export function NavigationItem({ item, level = 0 }: NavigationItemProps) {
  const { activeItem } = useNavigation();
  const isActive = activeItem?.id === item.id;

  return (
    <li className={`navigation-item level-${level}`}>
      <Link
        href={item.href}
        className={`
          flex items-center px-4 py-2 text-sm rounded-lg transition-colors
          ${isActive
            ? 'bg-primary text-white'
            : 'text-gray-700 hover:bg-gray-100'
          }
        `}
      >
        {item.icon && <span className="mr-3">{item.icon}</span>}
        <span>{item.label}</span>
      </Link>

      {item.children && (
        <ul className="ml-4 mt-2 space-y-1">
          {item.children.map(child => (
            <NavigationItem key={child.id} item={child} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
```

```typescript
// src/components/navigation/Navigation.tsx
'use client';

import { useNavigation } from '@/hooks/useNavigation';
import { NavigationItem } from './NavigationItem';

export function Navigation() {
  const { items, groups } = useNavigation();

  if (!items.length) {
    return <div className="p-4 text-gray-500">No navigation available</div>;
  }

  return (
    <nav className="navigation">
      {Object.entries(groups).map(([groupId, groupItems]) => (
        <div key={groupId} className="navigation-group mb-6">
          <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {groupId.replace('_', ' ')}
          </h3>
          <ul className="space-y-1">
            {groupItems
              .sort((a, b) => a.order - b.order)
              .map(item => (
                <NavigationItem key={item.id} item={item} />
              ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
```

### Step 7: Update Existing Sidebar Component

Integrate with existing sidebar:

```typescript
// src/components/layout/Sidebar.tsx (update existing)
import { Navigation } from '@/components/navigation/Navigation';

export function Sidebar({ isCollapsed }: { isCollapsed?: boolean }) {
  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header p-4">
        <h2 className="text-lg font-semibold">VMP</h2>
      </div>

      <div className="sidebar-content flex-1 overflow-y-auto">
        <Navigation />
      </div>
    </aside>
  );
}
```

### Step 8: Add Navigation Tests

Create basic tests for navigation logic:

```typescript
// tests/lib/navigation/utils.test.ts
import { getNavigationForRole, filterNavigationByPermissions } from '@/lib/navigation/utils';

describe('Navigation Utils', () => {
  test('getNavigationForRole returns correct items for admin_head', () => {
    const navigation = getNavigationForRole('admin_head');
    expect(navigation).toHaveLength(3); // dashboard, households, fees
    expect(navigation[0].id).toBe('dashboard');
  });

  test('filterNavigationByPermissions filters correctly', () => {
    const items = [
      { id: '1', label: 'Public', href: '/public', order: 1 },
      { id: '2', label: 'Admin Only', href: '/admin', permission: 'admin', order: 2 }
    ];

    const filtered = filterNavigationByPermissions(items, ['user']);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });
});
```

## Verification Steps

1. **Role-Based Display**: Login as different roles and verify correct navigation items appear
2. **Permission Filtering**: Ensure items with permissions only show for authorized users
3. **Active States**: Confirm active navigation item highlights correctly
4. **Group Organization**: Verify navigation items group properly by category
5. **Performance**: Test navigation renders within 100ms requirement

## Troubleshooting

**Navigation not appearing**: Check that user role is properly set in auth context
**Wrong items showing**: Verify role configuration matches user permissions
**Performance issues**: Ensure navigation filtering is memoized properly
**Active state not working**: Check that pathname matching logic is correct

## Next Steps

1. Add navigation analytics tracking
2. Implement breadcrumb generation
3. Add navigation search functionality
4. Create navigation configuration admin interface
5. Add internationalization support

This implementation provides a solid foundation for role-based navigation that can be extended as the VMP grows.
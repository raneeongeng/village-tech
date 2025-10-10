# Data Model: Role-Based Navigation Paths

**Feature**: Role-Based Navigation Paths
**Phase**: 1 - Design & Contracts
**Date**: 2025-01-10

## Core Entities

### NavigationItem

Represents a single navigation link with associated permissions and metadata.

**Fields**:
- `id: string` - Unique identifier for the navigation item
- `label: string` - Display text for the navigation item
- `href: string` - Route path for navigation (Next.js route format)
- `icon?: string` - Optional icon identifier (Lucide icon name)
- `permission?: string` - Optional permission required to view this item
- `group?: string` - Optional grouping category for organization
- `order: number` - Sort order within group or navigation level
- `children?: NavigationItem[]` - Optional nested navigation items

**Validation Rules**:
- `id` must be unique within navigation scope
- `href` must be valid Next.js route path format
- `label` must be 1-50 characters
- `order` must be positive integer
- `children` array maximum depth of 2 levels

**Example**:
```typescript
{
  id: "households",
  label: "Household Management",
  href: "/households",
  icon: "home",
  permission: "manage_households",
  group: "management",
  order: 1,
  children: [
    {
      id: "households-list",
      label: "View All",
      href: "/households",
      order: 1
    },
    {
      id: "households-add",
      label: "Add New",
      href: "/households/new",
      permission: "create_households",
      order: 2
    }
  ]
}
```

### NavigationGroup

Logical grouping of related navigation items for organizational display.

**Fields**:
- `id: string` - Unique group identifier
- `label: string` - Display name for the group
- `icon?: string` - Optional group icon
- `order: number` - Sort order among groups
- `collapsible: boolean` - Whether group can be collapsed in UI

**Validation Rules**:
- `id` must be unique within navigation scope
- `label` must be 1-30 characters
- `order` must be positive integer

### RoleNavigationMap

Associates user roles with their permitted navigation items and groups.

**Fields**:
- `role: UserRole` - Role identifier (superadmin, admin_head, etc.)
- `groups: NavigationGroup[]` - Ordered list of navigation groups for this role
- `items: NavigationItem[]` - Flat list of all navigation items for this role
- `permissions: string[]` - List of permissions required by navigation items

**Validation Rules**:
- `role` must be valid UserRole enum value
- All navigation items must have permissions subset of role permissions
- No duplicate item IDs within role navigation

### UserRole Enum

Defines the five user roles in the Village Management Platform.

**Values**:
- `superadmin` - System-wide administrator
- `admin_head` - Village administrative head
- `admin_officer` - Village administrative officer
- `household_head` - Household head/owner
- `security_officer` - Security personnel

## Relationships

```
RoleNavigationMap {
  role: UserRole
  groups: NavigationGroup[]
  items: NavigationItem[]
}

NavigationGroup {
  items: NavigationItem[] (filtered by role)
}

NavigationItem {
  parent?: NavigationItem
  children: NavigationItem[]
}
```

## State Transitions

### Navigation Item States
- **Available**: Item is visible and accessible to user
- **Disabled**: Item is visible but not clickable (insufficient permissions)
- **Hidden**: Item is not displayed (role-based filtering)

### Role-Based Visibility Rules
1. Item visible if no permission required OR user has required permission
2. Parent items visible if any child items are visible
3. Groups visible if any contained items are visible
4. Empty groups are hidden from display

## Configuration Structure

### Static Navigation Configuration

```typescript
// Navigation definitions organized by role
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
        collapsible: false
      },
      {
        id: 'villages',
        label: 'Villages',
        icon: 'building',
        order: 2,
        collapsible: true
      }
    ],
    items: [
      // System management items
      {
        id: 'system-overview',
        label: 'System Overview',
        href: '/admin/system',
        icon: 'monitor',
        group: 'system',
        order: 1
      },
      // Village management items
      {
        id: 'villages-list',
        label: 'All Villages',
        href: '/admin/villages',
        icon: 'building',
        group: 'villages',
        order: 1
      }
    ]
  },

  admin_head: {
    role: 'admin_head',
    permissions: ['manage_households', 'manage_fees', 'manage_security', 'manage_rules', 'view_reports'],
    groups: [
      {
        id: 'management',
        label: 'Management',
        icon: 'briefcase',
        order: 1,
        collapsible: false
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: 'chart-bar',
        order: 2,
        collapsible: true
      }
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
        icon: 'home',
        permission: 'manage_households',
        group: 'management',
        order: 2
      }
    ]
  }

  // Additional roles...
};
```

## Data Access Patterns

### Navigation Resolution Flow
1. User authentication provides role information
2. Role mapped to navigation configuration
3. Navigation items filtered by user permissions
4. Groups filtered to exclude empty groups
5. Final navigation structure sorted by order fields

### Caching Strategy
- Static navigation configurations loaded at build time
- User-specific filtered navigation cached in memory
- Cache invalidated on role or permission changes
- No persistent storage required for navigation data

## Integration Points

### Existing Systems
- **Auth System**: Provides user role and permissions
- **Route Guards**: Validate navigation href access
- **UI Components**: Render filtered navigation structure

### Data Flow
```
User Authentication → Role Detection → Navigation Configuration Lookup → Permission Filtering → UI Rendering
```

This data model provides a flexible, type-safe foundation for implementing role-based navigation while maintaining performance and security requirements.
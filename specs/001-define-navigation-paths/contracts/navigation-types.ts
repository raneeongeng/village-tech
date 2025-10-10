/**
 * TypeScript Interface Contracts for Role-Based Navigation System
 *
 * These types define the public API for navigation components and utilities.
 * They serve as contracts between different parts of the navigation system.
 */

export type UserRole =
  | 'superadmin'
  | 'admin_head'
  | 'admin_officer'
  | 'household_head'
  | 'security_officer';

export interface NavigationItem {
  /** Unique identifier for the navigation item */
  id: string;

  /** Display text for the navigation item */
  label: string;

  /** Route path for navigation (Next.js route format) */
  href: string;

  /** Optional icon identifier (Lucide icon name) */
  icon?: string;

  /** Optional permission required to view this item */
  permission?: string;

  /** Optional grouping category for organization */
  group?: string;

  /** Sort order within group or navigation level */
  order: number;

  /** Optional nested navigation items (max depth: 2) */
  children?: NavigationItem[];

  /** Whether this item should be highlighted as active */
  isActive?: boolean;

  /** Additional metadata for the navigation item */
  metadata?: {
    description?: string;
    badge?: string | number;
    external?: boolean;
  };
}

export interface NavigationGroup {
  /** Unique group identifier */
  id: string;

  /** Display name for the group */
  label: string;

  /** Optional group icon */
  icon?: string;

  /** Sort order among groups */
  order: number;

  /** Whether group can be collapsed in UI */
  collapsible: boolean;

  /** Whether group is currently collapsed (UI state) */
  collapsed?: boolean;
}

export interface RoleNavigationMap {
  /** Role identifier */
  role: UserRole;

  /** Ordered list of navigation groups for this role */
  groups: NavigationGroup[];

  /** Flat list of all navigation items for this role */
  items: NavigationItem[];

  /** List of permissions required by navigation items */
  permissions: string[];
}

export interface NavigationConfig {
  /** Navigation configuration for all roles */
  roles: Record<UserRole, RoleNavigationMap>;

  /** Configuration version for cache invalidation */
  version: string;

  /** Last update timestamp */
  lastUpdated: Date;
}

/**
 * Hook return type for useNavigation
 */
export interface UseNavigationReturn {
  /** Filtered navigation items for current user */
  items: NavigationItem[];

  /** Navigation groups with filtered items */
  groups: NavigationGroup[];

  /** Current active navigation item */
  activeItem: NavigationItem | null;

  /** Loading state */
  isLoading: boolean;

  /** Error state */
  error: string | null;

  /** Function to check if user can access a navigation item */
  canAccess: (item: NavigationItem) => boolean;

  /** Function to get navigation items by group */
  getItemsByGroup: (groupId: string) => NavigationItem[];

  /** Function to find navigation item by href */
  findItemByHref: (href: string) => NavigationItem | null;
}

/**
 * Props for NavigationProvider component
 */
export interface NavigationProviderProps {
  children: React.ReactNode;

  /** Optional initial navigation config */
  initialConfig?: NavigationConfig;

  /** Optional navigation configuration override */
  configOverride?: Partial<NavigationConfig>;
}

/**
 * Props for Navigation component
 */
export interface NavigationProps {
  /** Navigation variant/style */
  variant?: 'sidebar' | 'header' | 'breadcrumb';

  /** Whether navigation is collapsible */
  collapsible?: boolean;

  /** Whether navigation starts collapsed */
  defaultCollapsed?: boolean;

  /** Optional CSS class name */
  className?: string;

  /** Optional callback when navigation item is clicked */
  onItemClick?: (item: NavigationItem) => void;

  /** Optional callback when navigation is collapsed/expanded */
  onCollapse?: (collapsed: boolean) => void;
}

/**
 * Props for NavigationItem component
 */
export interface NavigationItemProps {
  /** Navigation item data */
  item: NavigationItem;

  /** Whether this item is currently active */
  isActive?: boolean;

  /** Nesting level for styling (0 = top level) */
  level?: number;

  /** Optional click handler */
  onClick?: (item: NavigationItem) => void;

  /** Optional CSS class name */
  className?: string;
}

/**
 * Props for NavigationGroup component
 */
export interface NavigationGroupProps {
  /** Group data */
  group: NavigationGroup;

  /** Items belonging to this group */
  items: NavigationItem[];

  /** Optional click handler for group header */
  onGroupClick?: (group: NavigationGroup) => void;

  /** Optional CSS class name */
  className?: string;
}

/**
 * Utility type for navigation configuration validation
 */
export interface NavigationValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Type for navigation event handlers
 */
export type NavigationEventHandler = {
  onNavigate: (href: string, item: NavigationItem) => void;
  onPermissionDenied: (item: NavigationItem) => void;
  onError: (error: Error, context: string) => void;
};

/**
 * Filter options for navigation items
 */
export interface NavigationFilterOptions {
  /** Include only items with these permissions */
  permissions?: string[];

  /** Include only items in these groups */
  groups?: string[];

  /** Include only items matching search query */
  search?: string;

  /** Include only items at specific levels */
  levels?: number[];
}

/**
 * Configuration for navigation behavior
 */
export interface NavigationBehaviorConfig {
  /** Whether to prefetch navigation routes */
  prefetchRoutes: boolean;

  /** Whether to track navigation analytics */
  trackAnalytics: boolean;

  /** Cache timeout for navigation data (ms) */
  cacheTimeout: number;

  /** Whether to show permission-denied items as disabled */
  showDisabled: boolean;
}
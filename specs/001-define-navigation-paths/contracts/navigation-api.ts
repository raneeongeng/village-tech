/**
 * API Contracts for Navigation System
 *
 * Defines the public interface for navigation-related functions and utilities.
 * These serve as the contract between navigation components and business logic.
 */

import type {
  NavigationItem,
  NavigationGroup,
  RoleNavigationMap,
  NavigationConfig,
  UserRole,
  NavigationFilterOptions,
  NavigationValidationResult
} from './navigation-types';

/**
 * Navigation Configuration API
 */
export interface NavigationConfigAPI {
  /**
   * Get navigation configuration for a specific role
   * @param role - User role
   * @returns Promise resolving to role navigation map
   */
  getNavigationForRole(role: UserRole): Promise<RoleNavigationMap>;

  /**
   * Get complete navigation configuration
   * @returns Promise resolving to full navigation config
   */
  getNavigationConfig(): Promise<NavigationConfig>;

  /**
   * Validate navigation configuration
   * @param config - Navigation configuration to validate
   * @returns Validation result with errors and warnings
   */
  validateNavigationConfig(config: NavigationConfig): NavigationValidationResult;

  /**
   * Get navigation configuration version
   * @returns Current configuration version string
   */
  getConfigVersion(): string;
}

/**
 * Navigation Filtering API
 */
export interface NavigationFilterAPI {
  /**
   * Filter navigation items by user permissions
   * @param items - Navigation items to filter
   * @param permissions - User permissions
   * @returns Filtered navigation items
   */
  filterByPermissions(
    items: NavigationItem[],
    permissions: string[]
  ): NavigationItem[];

  /**
   * Filter navigation items by group
   * @param items - Navigation items to filter
   * @param groupId - Group identifier
   * @returns Items belonging to the specified group
   */
  filterByGroup(items: NavigationItem[], groupId: string): NavigationItem[];

  /**
   * Filter navigation items with advanced options
   * @param items - Navigation items to filter
   * @param options - Filter options
   * @returns Filtered navigation items
   */
  filterNavigation(
    items: NavigationItem[],
    options: NavigationFilterOptions
  ): NavigationItem[];

  /**
   * Search navigation items by query
   * @param items - Navigation items to search
   * @param query - Search query
   * @returns Matching navigation items
   */
  searchNavigation(items: NavigationItem[], query: string): NavigationItem[];
}

/**
 * Navigation Utilities API
 */
export interface NavigationUtilsAPI {
  /**
   * Find navigation item by ID
   * @param items - Navigation items to search
   * @param id - Item identifier
   * @returns Navigation item or null if not found
   */
  findItemById(items: NavigationItem[], id: string): NavigationItem | null;

  /**
   * Find navigation item by href
   * @param items - Navigation items to search
   * @param href - Route path
   * @returns Navigation item or null if not found
   */
  findItemByHref(items: NavigationItem[], href: string): NavigationItem | null;

  /**
   * Get active navigation item based on current route
   * @param items - Navigation items to check
   * @param currentPath - Current route path
   * @returns Active navigation item or null
   */
  getActiveItem(items: NavigationItem[], currentPath: string): NavigationItem | null;

  /**
   * Build breadcrumb path for a navigation item
   * @param items - All navigation items
   * @param targetItem - Target navigation item
   * @returns Array of breadcrumb items
   */
  buildBreadcrumbs(
    items: NavigationItem[],
    targetItem: NavigationItem
  ): NavigationItem[];

  /**
   * Sort navigation items by order
   * @param items - Navigation items to sort
   * @returns Sorted navigation items
   */
  sortNavigationItems(items: NavigationItem[]): NavigationItem[];

  /**
   * Group navigation items by group property
   * @param items - Navigation items to group
   * @returns Map of group ID to navigation items
   */
  groupNavigationItems(items: NavigationItem[]): Record<string, NavigationItem[]>;

  /**
   * Flatten nested navigation structure
   * @param items - Navigation items with potential children
   * @returns Flat array of all navigation items
   */
  flattenNavigation(items: NavigationItem[]): NavigationItem[];

  /**
   * Build hierarchical navigation tree
   * @param items - Flat array of navigation items
   * @returns Hierarchical navigation structure
   */
  buildNavigationTree(items: NavigationItem[]): NavigationItem[];
}

/**
 * Permission Checking API
 */
export interface NavigationPermissionAPI {
  /**
   * Check if user can access a navigation item
   * @param item - Navigation item
   * @param userPermissions - User's permissions
   * @returns True if user can access the item
   */
  canAccessItem(item: NavigationItem, userPermissions: string[]): boolean;

  /**
   * Check if user has required permission
   * @param permission - Required permission
   * @param userPermissions - User's permissions
   * @returns True if user has the permission
   */
  hasPermission(permission: string, userPermissions: string[]): boolean;

  /**
   * Get all permissions required by navigation items
   * @param items - Navigation items
   * @returns Array of unique permission strings
   */
  getRequiredPermissions(items: NavigationItem[]): string[];

  /**
   * Validate user permissions against navigation requirements
   * @param items - Navigation items
   * @param userPermissions - User's permissions
   * @returns Validation result
   */
  validateUserPermissions(
    items: NavigationItem[],
    userPermissions: string[]
  ): {
    valid: boolean;
    missingPermissions: string[];
    accessibleItems: NavigationItem[];
  };
}

/**
 * Navigation State Management API
 */
export interface NavigationStateAPI {
  /**
   * Get current navigation state
   * @returns Current navigation state
   */
  getCurrentState(): {
    activeItem: NavigationItem | null;
    expandedGroups: string[];
    collapsedSidebar: boolean;
  };

  /**
   * Set active navigation item
   * @param item - Navigation item to set as active
   */
  setActiveItem(item: NavigationItem | null): void;

  /**
   * Toggle group expansion state
   * @param groupId - Group identifier
   */
  toggleGroup(groupId: string): void;

  /**
   * Toggle sidebar collapse state
   */
  toggleSidebar(): void;

  /**
   * Reset navigation state to defaults
   */
  resetState(): void;

  /**
   * Subscribe to navigation state changes
   * @param callback - Function to call when state changes
   * @returns Unsubscribe function
   */
  subscribe(callback: (state: any) => void): () => void;
}

/**
 * Main Navigation API - Combines all sub-APIs
 */
export interface NavigationAPI
  extends NavigationConfigAPI,
    NavigationFilterAPI,
    NavigationUtilsAPI,
    NavigationPermissionAPI,
    NavigationStateAPI {

  /**
   * Initialize navigation system
   * @param config - Initial navigation configuration
   */
  initialize(config: NavigationConfig): Promise<void>;

  /**
   * Refresh navigation data
   * @param force - Force refresh even if cached data is fresh
   */
  refresh(force?: boolean): Promise<void>;

  /**
   * Clear navigation cache
   */
  clearCache(): void;

  /**
   * Get navigation analytics data
   * @returns Navigation usage analytics
   */
  getAnalytics(): {
    mostUsedItems: Array<{ item: NavigationItem; usage: number }>;
    navigationPaths: Array<{ path: string[]; frequency: number }>;
    errorRates: Record<string, number>;
  };
}

/**
 * Factory function type for creating navigation API instance
 */
export type CreateNavigationAPI = (config?: Partial<NavigationConfig>) => NavigationAPI;

/**
 * Hook factory type for navigation hooks
 */
export type NavigationHookFactory<TProps = {}, TReturn = any> = (
  props?: TProps
) => TReturn;
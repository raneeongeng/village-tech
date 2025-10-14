'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { NavigationItem, NavigationGroup, UserRole, UseNavigationReturn } from '@/types/navigation';
import {
  getNavigationForRole,
  getNavigationItemsForRole,
  getNavigationGroupsForRole,
  filterNavigationByPermissions,
  findActiveNavigationItem,
  groupNavigationItems,
  getItemsByGroup,
  canAccessItem
} from '@/lib/navigation/utils';
import {
  canAccessItem as canAccessItemSecure,
  createPermissionContext,
  validateNavigationAccess,
  type UserPermissionContext
} from '@/lib/navigation/permissions';
import { useAuth, useMockAuth } from './useAuth';

export function useNavigation(): UseNavigationReturn {
  // Use mock auth for development - replace with real useAuth when Supabase is set up
  const { user } = useMockAuth();
  const pathname = usePathname();
  const [error, setError] = useState<string | null>(null);

  const navigation = useMemo(() => {
    try {
      if (!user?.role) {
        return {
          items: [],
          groups: [],
          activeItem: null,
          userPermissions: []
        };
      }

      // Get role-based navigation configuration
      const userRole = user.role?.code as UserRole;
      if (!userRole) {
        return {
          items: [],
          groups: [],
          activeItem: null,
          userPermissions: []
        };
      }

      const roleConfig = getNavigationForRole(userRole);
      const navigationItems = getNavigationItemsForRole(userRole);
      const navigationGroups = getNavigationGroupsForRole(userRole);

      // Get user permissions (in real implementation, this would come from auth context)
      const userPermissions = roleConfig.permissions || [];

      // Filter navigation items by permissions
      const filteredItems = filterNavigationByPermissions(navigationItems, userPermissions);

      // Find active navigation item
      const activeItem = findActiveNavigationItem(filteredItems, pathname);

      setError(null);

      return {
        items: filteredItems,
        groups: navigationGroups,
        activeItem,
        userPermissions
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Navigation error occurred');
      return {
        items: [],
        groups: [],
        activeItem: null,
        userPermissions: []
      };
    }
  }, [user?.role, pathname]);

  // Enhanced permission checking with security validation
  const canAccess = (item: NavigationItem): boolean => {
    if (!user?.role) return false;

    const permissionContext = createPermissionContext(
      user.role.code as UserRole,
      navigation.userPermissions,
      user.id,
      (user as any).tenant?.id
    );

    const result = canAccessItemSecure(item, permissionContext);
    return result.allowed;
  };

  const getItemsByGroupId = (groupId: string): NavigationItem[] => {
    return getItemsByGroup(navigation.items, groupId);
  };

  const findItemByHref = (href: string): NavigationItem | null => {
    return findActiveNavigationItem(navigation.items, href);
  };

  return {
    items: navigation.items,
    groups: navigation.groups,
    activeItem: navigation.activeItem,
    isLoading: false, // Could be enhanced to show loading state during auth
    error,
    canAccess,
    getItemsByGroup: getItemsByGroupId,
    findItemByHref
  };
}
/**
 * Navigation Breadcrumb Generation for Village Management Platform
 * Provides breadcrumb trail generation and management functionality
 */

import type { NavigationItem, UserRole } from '@/types/navigation';
import { getNavigationItemsForRole, findActiveNavigationItem } from './utils';

/**
 * Breadcrumb item with additional metadata
 */
export interface BreadcrumbItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  isActive: boolean;
  isClickable: boolean;
  metadata?: {
    description?: string;
    external?: boolean;
  };
}

/**
 * Breadcrumb trail configuration
 */
export interface BreadcrumbConfig {
  /** Maximum number of breadcrumb items to show */
  maxItems?: number;
  /** Whether to show icons in breadcrumbs */
  showIcons?: boolean;
  /** Custom separator between breadcrumb items */
  separator?: string;
  /** Whether to make all items clickable except the last one */
  makeClickable?: boolean;
  /** Custom home/root item */
  homeItem?: Pick<BreadcrumbItem, 'label' | 'href' | 'icon'>;
}

/**
 * Generate breadcrumb trail for a given path
 */
export function generateBreadcrumbTrail(
  currentPath: string,
  userRole: UserRole,
  config: BreadcrumbConfig = {}
): BreadcrumbItem[] {
  const {
    maxItems = 6,
    showIcons = true,
    makeClickable = true,
    homeItem = { label: 'Home', href: '/dashboard', icon: 'home' }
  } = config;

  const navigationItems = getNavigationItemsForRole(userRole);
  const trail: BreadcrumbItem[] = [];

  // Always start with home item
  trail.push({
    id: 'home',
    label: homeItem.label,
    href: homeItem.href,
    icon: showIcons ? homeItem.icon : undefined,
    isActive: currentPath === homeItem.href,
    isClickable: makeClickable && currentPath !== homeItem.href
  });

  // Find navigation trail to current path
  const navigationTrail = getBreadcrumbTrail(navigationItems, currentPath);

  // Convert navigation items to breadcrumb items
  navigationTrail.forEach((item, index) => {
    const isLast = index === navigationTrail.length - 1;
    const isActive = item.href === currentPath;

    trail.push({
      id: item.id,
      label: item.label,
      href: item.href,
      icon: showIcons ? item.icon : undefined,
      isActive,
      isClickable: makeClickable && !isLast,
      metadata: item.metadata
    });
  });

  // Truncate if exceeds maxItems
  if (trail.length > maxItems) {
    // Keep first and last items, truncate middle
    const ellipsisItem: BreadcrumbItem = {
      id: 'ellipsis',
      label: '...',
      href: '#',
      isActive: false,
      isClickable: false
    };

    const truncated = [
      trail[0], // Home
      ellipsisItem,
      ...trail.slice(-(maxItems - 2)) // Last few items
    ];

    return truncated;
  }

  return trail;
}

/**
 * Helper function to get breadcrumb trail from navigation items
 */
function getBreadcrumbTrail(
  items: NavigationItem[],
  currentPath: string,
  trail: NavigationItem[] = []
): NavigationItem[] {
  for (const item of items) {
    const newTrail = [...trail, item];

    // Exact match - return the trail
    if (item.href === currentPath) {
      return newTrail;
    }

    // Check if current path starts with item href (for nested routes)
    if (currentPath.startsWith(item.href) && item.href !== '/') {
      // Check children first
      if (item.children) {
        const childTrail = getBreadcrumbTrail(item.children, currentPath, newTrail);
        if (childTrail.length > 0) {
          return childTrail;
        }
      }
      // If no children match, but path starts with this item, include it
      return newTrail;
    }

    // Check children recursively
    if (item.children) {
      const childTrail = getBreadcrumbTrail(item.children, currentPath, newTrail);
      if (childTrail.length > 0) {
        return childTrail;
      }
    }
  }

  return [];
}

/**
 * Generate breadcrumbs from URL segments
 */
export function generateBreadcrumbsFromUrl(
  url: string,
  config: BreadcrumbConfig = {}
): BreadcrumbItem[] {
  const {
    showIcons = false,
    makeClickable = true,
    homeItem = { label: 'Home', href: '/', icon: 'home' }
  } = config;

  const segments = url.split('/').filter(Boolean);
  const trail: BreadcrumbItem[] = [];

  // Add home item
  trail.push({
    id: 'home',
    label: homeItem.label,
    href: homeItem.href,
    icon: showIcons ? homeItem.icon : undefined,
    isActive: segments.length === 0,
    isClickable: makeClickable && segments.length > 0
  });

  // Build breadcrumb from URL segments
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    trail.push({
      id: `segment-${index}`,
      label: formatSegmentLabel(segment),
      href: currentPath,
      isActive: isLast,
      isClickable: makeClickable && !isLast
    });
  });

  return trail;
}

/**
 * Format URL segment into readable label
 */
function formatSegmentLabel(segment: string): string {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get breadcrumb schema for SEO/structured data
 */
export function getBreadcrumbSchema(breadcrumbs: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs
      .filter(item => item.id !== 'ellipsis')
      .map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: {
          '@type': 'WebPage',
          '@id': item.href
        }
      }))
  };
}

/**
 * Create accessible breadcrumb navigation
 */
export function createAccessibleBreadcrumb(
  breadcrumbs: BreadcrumbItem[],
  config: BreadcrumbConfig = {}
): {
  items: BreadcrumbItem[];
  ariaLabel: string;
  schemaMarkup: object;
} {
  const { separator = '/' } = config;

  return {
    items: breadcrumbs,
    ariaLabel: `Breadcrumb navigation: ${breadcrumbs.map(b => b.label).join(` ${separator} `)}`,
    schemaMarkup: getBreadcrumbSchema(breadcrumbs)
  };
}

/**
 * Smart breadcrumb generation that combines navigation and URL approaches
 */
export function generateSmartBreadcrumbs(
  currentPath: string,
  userRole: UserRole,
  config: BreadcrumbConfig = {}
): BreadcrumbItem[] {
  // First try navigation-based breadcrumbs
  const navigationBreadcrumbs = generateBreadcrumbTrail(currentPath, userRole, config);

  // If navigation breadcrumbs are minimal (just home), fall back to URL-based
  if (navigationBreadcrumbs.length <= 1) {
    return generateBreadcrumbsFromUrl(currentPath, config);
  }

  return navigationBreadcrumbs;
}

/**
 * Breadcrumb utilities for common operations
 */
export const breadcrumbUtils = {
  /**
   * Find parent item in breadcrumb trail
   */
  getParentItem(breadcrumbs: BreadcrumbItem[]): BreadcrumbItem | null {
    const activeIndex = breadcrumbs.findIndex(item => item.isActive);
    return activeIndex > 0 ? breadcrumbs[activeIndex - 1] : null;
  },

  /**
   * Get clickable breadcrumb items
   */
  getClickableItems(breadcrumbs: BreadcrumbItem[]): BreadcrumbItem[] {
    return breadcrumbs.filter(item => item.isClickable);
  },

  /**
   * Format breadcrumb for display
   */
  formatBreadcrumbText(breadcrumbs: BreadcrumbItem[], separator: string = ' > '): string {
    return breadcrumbs.map(item => item.label).join(separator);
  },

  /**
   * Check if breadcrumb is truncated
   */
  isTruncated(breadcrumbs: BreadcrumbItem[]): boolean {
    return breadcrumbs.some(item => item.id === 'ellipsis');
  },

  /**
   * Get breadcrumb depth
   */
  getDepth(breadcrumbs: BreadcrumbItem[]): number {
    return breadcrumbs.filter(item => item.id !== 'ellipsis').length;
  }
};
'use client';

import { NavigationGroup } from './NavigationGroup';
import { NavigationItem } from './NavigationItem';
import type { NavigationProps } from '@/types/navigation';
import { useNavigation } from '@/hooks/useNavigation';
import { groupNavigationItems, groupNavigationItemsWithMetadata, sortNavigationGroups } from '@/lib/navigation/utils';

/**
 * Navigation Component
 * Main navigation container that renders role-based navigation items organized by groups
 */
export function Navigation({
  variant = 'sidebar',
  collapsible = false,
  defaultCollapsed = false,
  className = '',
  onItemClick,
  onCollapse
}: NavigationProps) {
  const { items, groups, activeItem, isLoading, error } = useNavigation();

  if (isLoading) {
    return (
      <div className={`navigation navigation--loading ${className}`}>
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300"></div>
          <span className="ml-2 text-sm text-gray-500">Loading navigation...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`navigation navigation--error ${className}`}>
        <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md">
          <p className="font-medium">Navigation Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className={`navigation navigation--empty ${className}`}>
        <div className="p-4 text-sm text-gray-500 text-center">
          <p>No navigation items available</p>
          <p className="text-xs mt-1">Check your role permissions</p>
        </div>
      </div>
    );
  }

  // Use enhanced grouping with metadata
  const groupedItemsWithMetadata = groupNavigationItemsWithMetadata(items, groups);

  const handleItemClick = (item: any) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const handleGroupClick = (clickedGroup: any) => {
    // Handle group collapse/expand state changes
    // In a more complex implementation, this could update global state
    console.log('Group state changed:', clickedGroup.id, 'collapsed:', clickedGroup.collapsed);
  };

  const navigationClasses = `
    navigation
    navigation--${variant}
    ${collapsible ? 'navigation--collapsible' : ''}
    ${className}
  `;

  return (
    <nav className={navigationClasses} role="navigation" aria-label="Main navigation">
      <div className="navigation__content">
        {groupedItemsWithMetadata.map(({ group, items: groupItems }) => (
          <NavigationGroup
            key={group.id}
            group={group}
            items={groupItems.map(item => ({
              ...item,
              isActive: activeItem?.id === item.id
            }))}
            onGroupClick={handleGroupClick}
            onItemClick={handleItemClick}
          />
        ))}

        {/* Render ungrouped items if any */}
        {(() => {
          const groupedItems = groupNavigationItems(items);
          const ungroupedItems = groupedItems.default || [];

          if (ungroupedItems.length === 0) return null;

          return (
            <div className="navigation-group mb-6">
              <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Other
              </h3>
              <ul className="space-y-1">
                {ungroupedItems.map((item) => (
                  <NavigationItem
                    key={item.id}
                    item={item}
                    isActive={activeItem?.id === item.id}
                    onClick={handleItemClick}
                  />
                ))}
              </ul>
            </div>
          );
        })()}
      </div>

      {/* Navigation footer for additional actions */}
      <div className="navigation__footer mt-auto pt-4 border-t border-gray-200">
        <div className="px-3 py-2 text-xs text-gray-400">
          {items.length} navigation item{items.length !== 1 ? 's' : ''}
        </div>
      </div>
    </nav>
  );
}
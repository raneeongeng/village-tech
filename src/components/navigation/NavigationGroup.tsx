'use client';

import { useState } from 'react';
import { NavigationItem } from './NavigationItem';
import type { NavigationGroupProps } from '@/types/navigation';
import { sortNavigationItems } from '@/lib/navigation/utils';

/**
 * NavigationGroup Component
 * Renders a group of navigation items with collapsible functionality
 */
export function NavigationGroup({
  group,
  items,
  onGroupClick,
  onItemClick,
  className = ''
}: NavigationGroupProps & { onItemClick?: (item: any) => void }) {
  const [isCollapsed, setIsCollapsed] = useState(group.collapsed || false);

  const handleGroupClick = () => {
    if (group.collapsible) {
      setIsCollapsed(!isCollapsed);
    }

    if (onGroupClick) {
      onGroupClick({
        ...group,
        collapsed: !isCollapsed
      });
    }
  };

  const sortedItems = sortNavigationItems(items);

  const groupHeaderClasses = `
    flex items-center w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider transition-all duration-200
    ${group.collapsible
      ? 'cursor-pointer hover:text-gray-700 hover:bg-gray-50 rounded-md'
      : ''
    }
    ${isCollapsed && group.collapsible ? 'text-gray-400' : ''}
    ${className}
  `;

  return (
    <div className="navigation-group mb-6">
      <div
        className={groupHeaderClasses}
        onClick={handleGroupClick}
        role={group.collapsible ? 'button' : undefined}
        aria-expanded={group.collapsible ? !isCollapsed : undefined}
        aria-controls={`group-${group.id}-items`}
      >
        {group.icon && (
          <span className="flex-shrink-0 w-4 h-4 mr-2">
            {/* Icon will be rendered here - integrate with your icon system */}
            <span data-icon={group.icon}>📁</span>
          </span>
        )}

        <span className="flex-1">{group.label}</span>

        {group.collapsible && (
          <span
            className={`ml-2 w-4 h-4 flex items-center justify-center transition-transform duration-200 ${
              isCollapsed ? '' : 'rotate-90'
            }`}
            aria-hidden="true"
          >
            <svg
              className="w-3 h-3 fill-current"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          group.collapsible && isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'
        }`}
      >
        <ul
          id={`group-${group.id}-items`}
          className="space-y-1 pt-1"
        >
          {sortedItems.map((item) => (
            <NavigationItem
              key={item.id}
              item={item}
              isActive={item.isActive}
              onClick={onItemClick}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { NavigationItem as NavigationItemType, NavigationItemProps } from '@/types/navigation';
import { useNavigation } from '@/hooks/useNavigation';

/**
 * NavigationItem Component
 * Renders individual navigation items with proper styling, active states, and nested children
 */
export function NavigationItem({
  item,
  isActive = false,
  level = 0,
  onClick,
  className = ''
}: NavigationItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { canAccess } = useNavigation();
  const hasChildren = item.children && item.children.length > 0;
  const isAccessible = canAccess(item);
  const isDisabled = !isAccessible;

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation if item is disabled
    if (isDisabled && !hasChildren) {
      e.preventDefault();
      console.warn(`Access denied to navigation item: ${item.label}`);
      return;
    }

    if (hasChildren) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }

    if (onClick) {
      onClick(item);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard navigation
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e as any);
    }

    // Arrow key navigation for groups
    if (hasChildren) {
      if (e.key === 'ArrowRight' && !isExpanded) {
        setIsExpanded(true);
      } else if (e.key === 'ArrowLeft' && isExpanded) {
        setIsExpanded(false);
      }
    }
  };

  const baseClasses = `
    flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
    ${level > 0 ? 'ml-4' : ''}
    ${isDisabled
      ? 'text-gray-400 cursor-not-allowed opacity-60'
      : isActive
      ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-500'
      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }
    ${hasChildren && !isDisabled ? 'cursor-pointer' : ''}
    ${className}
  `;

  const iconClasses = `
    flex-shrink-0 w-5 h-5 mr-3
    ${isDisabled
      ? 'text-gray-300'
      : isActive
      ? 'text-primary-600'
      : 'text-gray-400'
    }
  `;

  const content = (
    <>
      {item.icon && (
        <span className={iconClasses}>
          {/* Icon will be rendered here - integrate with your icon system */}
          <span data-icon={item.icon}>📄</span>
        </span>
      )}

      <span className="flex-1 text-left">{item.label}</span>

      {item.metadata?.badge && (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {item.metadata.badge}
        </span>
      )}

      {hasChildren && (
        <span className={`ml-2 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
          ▶
        </span>
      )}
    </>
  );

  // Don't render if completely inaccessible (optional strict mode)
  if (isDisabled && process.env.NODE_ENV === 'production') {
    // In production, optionally hide inaccessible items completely
    // return null;
  }

  return (
    <li className="navigation-item">
      {hasChildren ? (
        <button
          id={`nav-button-${item.id}`}
          className={baseClasses}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          aria-expanded={isExpanded}
          aria-label={`${item.label} navigation group`}
          aria-controls={hasChildren ? `nav-group-${item.id}` : undefined}
          disabled={isDisabled}
        >
          {content}
        </button>
      ) : isDisabled ? (
        <div
          className={baseClasses}
          title={`Access denied: ${item.metadata?.description || 'Insufficient permissions'}`}
          aria-label={`${item.label} (access denied)`}
          aria-disabled="true"
          role="button"
          tabIndex={-1}
        >
          {content}
          <span className="sr-only">Access denied due to insufficient permissions</span>
        </div>
      ) : (
        <Link
          href={item.href}
          className={baseClasses}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          title={item.metadata?.description}
          aria-current={isActive ? 'page' : undefined}
          {...(item.metadata?.external && {
            target: '_blank',
            rel: 'noopener noreferrer',
            'aria-label': `${item.label} (opens in new tab)`
          })}
        >
          {content}
        </Link>
      )}

      {hasChildren && isExpanded && (
        <ul
          id={`nav-group-${item.id}`}
          className="mt-1 space-y-1"
          role="group"
          aria-labelledby={`nav-button-${item.id}`}
        >
          {item.children!.map((child) => (
            <NavigationItem
              key={child.id}
              item={child}
              level={level + 1}
              onClick={onClick}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
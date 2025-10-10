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
    flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200
    ${item.badge ? 'justify-between' : ''}
    ${level > 0 ? 'ml-4' : ''}
    ${isDisabled
      ? 'text-gray-400 cursor-not-allowed opacity-60'
      : isActive
      ? 'bg-secondary text-primary'
      : 'text-text hover:bg-secondary/50'
    }
    ${hasChildren && !isDisabled ? 'cursor-pointer' : ''}
    ${className}
  `;

  const iconClasses = `
    material-icons-outlined mr-3
    ${isDisabled
      ? 'text-gray-300'
      : isActive
      ? 'text-primary'
      : 'text-text'
    }
  `;

  const content = item.badge ? (
    <>
      <div className="flex items-center">
        {item.icon && (
          <span className={iconClasses}>
            {item.icon}
          </span>
        )}
        <span>{item.label}</span>
      </div>
      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-accent rounded-full">
        {item.badge}
      </span>
    </>
  ) : (
    <>
      {item.icon && (
        <span className={iconClasses}>
          {item.icon}
        </span>
      )}
      <span>{item.label}</span>
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
/**
 * NavigationGroup Component Tests
 * Tests for the NavigationGroup component with collapsible functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { NavigationGroup } from '@/components/navigation/NavigationGroup';
import type { NavigationGroup as NavigationGroupType, NavigationItem } from '@/types/navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/dashboard'),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('NavigationGroup Component', () => {
  const mockItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: 'home',
      order: 1,
      isActive: true
    },
    {
      id: 'users',
      label: 'Users',
      href: '/users',
      icon: 'users',
      order: 2
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/settings',
      icon: 'settings',
      order: 3
    }
  ];

  const mockCollapsibleGroup: NavigationGroupType = {
    id: 'management',
    label: 'Management',
    icon: 'briefcase',
    order: 1,
    collapsible: true,
    collapsed: false
  };

  const mockNonCollapsibleGroup: NavigationGroupType = {
    id: 'overview',
    label: 'Overview',
    icon: 'home',
    order: 1,
    collapsible: false,
    collapsed: false
  };

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders group header with label', () => {
      render(
        <NavigationGroup
          group={mockNonCollapsibleGroup}
          items={mockItems}
        />
      );

      expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    test('renders all navigation items when not collapsed', () => {
      render(
        <NavigationGroup
          group={mockNonCollapsibleGroup}
          items={mockItems}
        />
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    test('applies correct CSS classes to group header', () => {
      render(
        <NavigationGroup
          group={mockCollapsibleGroup}
          items={mockItems}
        />
      );

      const header = screen.getByText('Management').parentElement;
      expect(header).toHaveClass('cursor-pointer');
      expect(header).toHaveClass('hover:text-gray-700');
    });

    test('applies custom className', () => {
      const { container } = render(
        <NavigationGroup
          group={mockNonCollapsibleGroup}
          items={mockItems}
          className="custom-group"
        />
      );

      const header = container.querySelector('.custom-group');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Collapsible Functionality', () => {
    test('shows collapse indicator for collapsible groups', () => {
      render(
        <NavigationGroup
          group={mockCollapsibleGroup}
          items={mockItems}
        />
      );

      const collapseIcon = screen.getByRole('button').querySelector('svg');
      expect(collapseIcon).toBeInTheDocument();
    });

    test('does not show collapse indicator for non-collapsible groups', () => {
      render(
        <NavigationGroup
          group={mockNonCollapsibleGroup}
          items={mockItems}
        />
      );

      const header = screen.getByText('Overview').parentElement;
      const collapseIcon = header?.querySelector('svg');
      expect(collapseIcon).not.toBeInTheDocument();
    });

    test('toggles collapsed state when clicking collapsible group header', async () => {
      render(
        <NavigationGroup
          group={mockCollapsibleGroup}
          items={mockItems}
        />
      );

      const groupHeader = screen.getByRole('button');

      // Initially expanded - items should be visible
      expect(screen.getByText('Dashboard')).toBeInTheDocument();

      // Click to collapse
      fireEvent.click(groupHeader);

      // Items should be hidden due to CSS classes
      await waitFor(() => {
        const itemsList = screen.getByText('Dashboard').closest('ul');
        const wrapper = itemsList?.parentElement;
        expect(wrapper).toHaveClass('max-h-0');
        expect(wrapper).toHaveClass('opacity-0');
      });
    });

    test('does not toggle when clicking non-collapsible group header', () => {
      render(
        <NavigationGroup
          group={mockNonCollapsibleGroup}
          items={mockItems}
        />
      );

      const groupHeader = screen.getByText('Overview');

      // Should not be clickable (no button role)
      expect(groupHeader.parentElement).not.toHaveAttribute('role', 'button');

      // Items should always be visible
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    test('starts in collapsed state when group.collapsed is true', () => {
      const collapsedGroup = {
        ...mockCollapsibleGroup,
        collapsed: true
      };

      render(
        <NavigationGroup
          group={collapsedGroup}
          items={mockItems}
        />
      );

      // Items should be hidden initially
      const itemsList = screen.getByText('Dashboard').closest('ul');
      const wrapper = itemsList?.parentElement;
      expect(wrapper).toHaveClass('max-h-0');
      expect(wrapper).toHaveClass('opacity-0');
    });
  });

  describe('Item Interaction', () => {
    test('calls onItemClick when navigation item is clicked', () => {
      const onItemClick = jest.fn();

      render(
        <NavigationGroup
          group={mockNonCollapsibleGroup}
          items={mockItems}
          onItemClick={onItemClick}
        />
      );

      const dashboardLink = screen.getByText('Dashboard');
      fireEvent.click(dashboardLink);

      expect(onItemClick).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'dashboard',
          label: 'Dashboard'
        })
      );
    });

    test('calls onGroupClick when collapsible group header is clicked', () => {
      const onGroupClick = jest.fn();

      render(
        <NavigationGroup
          group={mockCollapsibleGroup}
          items={mockItems}
          onGroupClick={onGroupClick}
        />
      );

      const groupHeader = screen.getByRole('button');
      fireEvent.click(groupHeader);

      expect(onGroupClick).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'management',
          label: 'Management',
          collapsed: true // Should reflect the new state
        })
      );
    });
  });

  describe('Item Sorting', () => {
    test('renders items in correct order based on order property', () => {
      const unorderedItems = [
        { ...mockItems[2], order: 1 }, // Settings
        { ...mockItems[0], order: 3 }, // Dashboard
        { ...mockItems[1], order: 2 }  // Users
      ];

      render(
        <NavigationGroup
          group={mockNonCollapsibleGroup}
          items={unorderedItems}
        />
      );

      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveTextContent('Settings'); // order: 1
      expect(links[1]).toHaveTextContent('Users');    // order: 2
      expect(links[2]).toHaveTextContent('Dashboard'); // order: 3
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes for collapsible groups', () => {
      render(
        <NavigationGroup
          group={mockCollapsibleGroup}
          items={mockItems}
        />
      );

      const groupHeader = screen.getByRole('button');
      expect(groupHeader).toHaveAttribute('aria-expanded', 'true'); // Not collapsed initially
      expect(groupHeader).toHaveAttribute('aria-controls', 'group-management-items');

      const itemsList = screen.getByRole('list');
      expect(itemsList).toHaveAttribute('id', 'group-management-items');
    });

    test('updates aria-expanded when collapsed state changes', async () => {
      render(
        <NavigationGroup
          group={mockCollapsibleGroup}
          items={mockItems}
        />
      );

      const groupHeader = screen.getByRole('button');

      // Initially expanded (not collapsed)
      expect(groupHeader).toHaveAttribute('aria-expanded', 'true');

      // Click to toggle (collapse)
      fireEvent.click(groupHeader);

      await waitFor(() => {
        expect(groupHeader).toHaveAttribute('aria-expanded', 'false');
      });
    });

    test('collapse icon has aria-hidden attribute', () => {
      render(
        <NavigationGroup
          group={mockCollapsibleGroup}
          items={mockItems}
        />
      );

      const collapseIcon = screen.getByRole('button').querySelector('span[aria-hidden]');
      expect(collapseIcon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Animation Classes', () => {
    test('applies correct transition classes', () => {
      render(
        <NavigationGroup
          group={mockCollapsibleGroup}
          items={mockItems}
        />
      );

      const itemsList = screen.getByText('Dashboard').closest('ul');
      const wrapper = itemsList?.parentElement;

      expect(wrapper).toHaveClass('transition-all');
      expect(wrapper).toHaveClass('duration-300');
      expect(wrapper).toHaveClass('overflow-hidden');
    });

    test('rotates collapse icon when collapsed', async () => {
      render(
        <NavigationGroup
          group={mockCollapsibleGroup}
          items={mockItems}
        />
      );

      const groupHeader = screen.getByRole('button');
      const collapseIconWrapper = groupHeader.querySelector('span[aria-hidden="true"]');

      // Initially expanded, so icon should be rotated
      expect(collapseIconWrapper).toHaveClass('rotate-90');

      // Click to collapse
      fireEvent.click(groupHeader);

      await waitFor(() => {
        expect(collapseIconWrapper).not.toHaveClass('rotate-90');
      });
    });
  });

  describe('Empty States', () => {
    test('renders group header even with no items', () => {
      render(
        <NavigationGroup
          group={mockNonCollapsibleGroup}
          items={[]}
        />
      );

      expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    test('renders empty list when no items provided', () => {
      render(
        <NavigationGroup
          group={mockNonCollapsibleGroup}
          items={[]}
        />
      );

      const itemsList = screen.getByRole('list');
      expect(itemsList).toBeEmptyDOMElement();
    });
  });
});
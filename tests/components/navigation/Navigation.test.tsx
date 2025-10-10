/**
 * Navigation Component Tests
 * Tests for the main Navigation component functionality
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation/Navigation';
import { useNavigation } from '@/hooks/useNavigation';
import type { NavigationItem, NavigationGroup } from '@/types/navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/dashboard'),
}));

// Mock the useNavigation hook
jest.mock('@/hooks/useNavigation', () => ({
  useNavigation: jest.fn(),
}));

const mockUseNavigation = useNavigation as jest.MockedFunction<typeof useNavigation>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('Navigation Component', () => {
  const mockNavigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: 'home',
      group: 'overview',
      order: 1,
      isActive: true
    },
    {
      id: 'users',
      label: 'Users',
      href: '/users',
      icon: 'users',
      group: 'management',
      order: 1
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/settings',
      icon: 'settings',
      group: 'management',
      order: 2
    }
  ];

  const mockNavigationGroups: NavigationGroup[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: 'home',
      order: 1,
      collapsible: false
    },
    {
      id: 'management',
      label: 'Management',
      icon: 'briefcase',
      order: 2,
      collapsible: true
    }
  ];

  const mockNavigationReturn = {
    items: mockNavigationItems,
    groups: mockNavigationGroups,
    activeItem: mockNavigationItems[0],
    isLoading: false,
    error: null,
    canAccess: jest.fn(() => true),
    getItemsByGroup: jest.fn((groupId: string) =>
      mockNavigationItems.filter(item => item.group === groupId)
    ),
    findItemByHref: jest.fn((href: string) =>
      mockNavigationItems.find(item => item.href === href) || null
    )
  };

  beforeEach(() => {
    mockUseNavigation.mockReturnValue(mockNavigationReturn);
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
    test('renders navigation items correctly', () => {
      render(<Navigation />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    test('renders navigation groups correctly', () => {
      render(<Navigation />);

      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Management')).toBeInTheDocument();
    });

    test('applies correct CSS classes based on variant', () => {
      const { container } = render(<Navigation variant="sidebar" />);
      const nav = container.querySelector('nav');

      expect(nav).toHaveClass('navigation--sidebar');
    });

    test('applies custom className', () => {
      const { container } = render(<Navigation className="custom-nav" />);
      const nav = container.querySelector('nav');

      expect(nav).toHaveClass('custom-nav');
    });
  });

  describe('Loading State', () => {
    test('shows loading state when navigation is loading', () => {
      mockUseNavigation.mockReturnValue({
        ...mockNavigationReturn,
        isLoading: true,
        items: [],
        groups: []
      });

      render(<Navigation />);

      expect(screen.getByText('Loading navigation...')).toBeInTheDocument();
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    test('shows error state when navigation has error', () => {
      mockUseNavigation.mockReturnValue({
        ...mockNavigationReturn,
        error: 'Failed to load navigation',
        items: [],
        groups: []
      });

      render(<Navigation />);

      expect(screen.getByText('Navigation Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load navigation')).toBeInTheDocument();
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    test('shows empty state when no navigation items available', () => {
      mockUseNavigation.mockReturnValue({
        ...mockNavigationReturn,
        items: [],
        groups: []
      });

      render(<Navigation />);

      expect(screen.getByText('No navigation items available')).toBeInTheDocument();
      expect(screen.getByText('Check your role permissions')).toBeInTheDocument();
    });
  });

  describe('Item Interaction', () => {
    test('calls onItemClick when navigation item is clicked', () => {
      const onItemClick = jest.fn();
      render(<Navigation onItemClick={onItemClick} />);

      const dashboardLink = screen.getByText('Dashboard');
      fireEvent.click(dashboardLink);

      expect(onItemClick).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'dashboard',
          label: 'Dashboard'
        })
      );
    });
  });

  describe('Active States', () => {
    test('highlights active navigation item', () => {
      render(<Navigation />);

      const dashboardItem = screen.getByText('Dashboard').closest('a');
      expect(dashboardItem).toHaveClass('bg-primary-100');
    });

    test('does not highlight inactive items', () => {
      render(<Navigation />);

      const usersItem = screen.getByText('Users').closest('a');
      expect(usersItem).not.toHaveClass('bg-primary-100');
      expect(usersItem).toHaveClass('text-gray-700');
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      render(<Navigation />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    });

    test('navigation items are accessible as links', () => {
      render(<Navigation />);

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');

      const usersLink = screen.getByRole('link', { name: /users/i });
      expect(usersLink).toHaveAttribute('href', '/users');
    });
  });

  describe('Collapsible Behavior', () => {
    test('applies collapsible class when collapsible prop is true', () => {
      const { container } = render(<Navigation collapsible={true} />);
      const nav = container.querySelector('nav');

      expect(nav).toHaveClass('navigation--collapsible');
    });

    test('does not apply collapsible class when collapsible prop is false', () => {
      const { container } = render(<Navigation collapsible={false} />);
      const nav = container.querySelector('nav');

      expect(nav).not.toHaveClass('navigation--collapsible');
    });
  });

  describe('Navigation Statistics', () => {
    test('displays correct item count in footer', () => {
      render(<Navigation />);

      expect(screen.getByText('3 navigation items')).toBeInTheDocument();
    });

    test('displays singular form for single item', () => {
      mockUseNavigation.mockReturnValue({
        ...mockNavigationReturn,
        items: [mockNavigationItems[0]]
      });

      render(<Navigation />);

      expect(screen.getByText('1 navigation item')).toBeInTheDocument();
    });
  });

  describe('Group Organization', () => {
    test('groups items correctly by their group property', () => {
      render(<Navigation />);

      // Overview group should contain Dashboard
      const overviewSection = screen.getByText('Overview').closest('.navigation-group');
      expect(overviewSection).toContainElement(screen.getByText('Dashboard'));

      // Management group should contain Users and Settings
      const managementSection = screen.getByText('Management').closest('.navigation-group');
      expect(managementSection).toContainElement(screen.getByText('Users'));
      expect(managementSection).toContainElement(screen.getByText('Settings'));
    });
  });
});
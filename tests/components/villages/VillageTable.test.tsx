import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { VillageTable } from '@/components/villages/VillageTable'
import { Village } from '@/types/village'

// Mock Material Icons
const mockMaterialIcons = () => {
  const style = document.createElement('style');
  style.innerHTML = `
    .material-icons-outlined {
      font-family: 'Material Icons Outlined';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-feature-settings: 'liga';
      -webkit-font-smoothing: antialiased;
    }
  `;
  document.head.appendChild(style);
}

beforeAll(() => {
  mockMaterialIcons();
});

const mockVillages: Village[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Village',
    status_id: 'status-1',
    settings: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    status: {
      id: 'status-1',
      category_id: 'cat-1',
      code: 'active',
      name: 'Active',
      color_code: '#28a745',
      is_active: true,
      sort_order: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    admin_head: {
      id: 'admin-1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com'
    }
  }
]

const mockPagination = {
  currentPage: 1,
  totalPages: 1,
  totalCount: 1,
  itemsPerPage: 10
}

const mockVillageStatuses = [
  {
    id: 'status-1',
    category_id: 'cat-1',
    code: 'active',
    name: 'Active',
    color_code: '#28a745',
    is_active: true,
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

describe('VillageTable', () => {
  it('renders loading state', () => {
    render(
      <VillageTable
        villages={null}
        loading={true}
        error={null}
        pagination={mockPagination}
        villageStatuses={mockVillageStatuses}
        onPageChange={jest.fn()}
        onRefresh={jest.fn()}
      />
    )

    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders success state with villages', () => {
    render(
      <VillageTable
        villages={mockVillages}
        loading={false}
        error={null}
        pagination={mockPagination}
        villageStatuses={mockVillageStatuses}
        onPageChange={jest.fn()}
        onRefresh={jest.fn()}
      />
    )

    expect(screen.getByText('Test Village')).toBeInTheDocument()
    expect(screen.getByText('123E4567')).toBeInTheDocument() // Village ID (first 8 chars uppercase)
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('2024-01-15')).toBeInTheDocument()
  })

  it('renders empty state', () => {
    render(
      <VillageTable
        villages={[]}
        loading={false}
        error={null}
        pagination={{ ...mockPagination, totalCount: 0 }}
        villageStatuses={mockVillageStatuses}
        onPageChange={jest.fn()}
        onRefresh={jest.fn()}
      />
    )

    expect(screen.getByText('No villages found')).toBeInTheDocument()
  })

  it('renders error state', () => {
    const error = new Error('Test error')
    render(
      <VillageTable
        villages={null}
        loading={false}
        error={error}
        pagination={mockPagination}
        villageStatuses={mockVillageStatuses}
        onPageChange={jest.fn()}
        onRefresh={jest.fn()}
      />
    )

    expect(screen.getByText('Failed to load villages')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })
})
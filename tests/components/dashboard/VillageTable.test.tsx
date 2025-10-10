import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { VillageTable } from '@/components/dashboard/VillageTable'
import { Village } from '@/types/dashboard'

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
    id: '1',
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
    }
  }
]

describe('VillageTable', () => {
  it('renders loading state', () => {
    render(
      <VillageTable
        villages={null}
        loading={true}
        error={null}
      />
    )

    expect(screen.getByText('Recently Created Villages')).toBeInTheDocument()
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders success state with villages', () => {
    render(
      <VillageTable
        villages={mockVillages}
        loading={false}
        error={null}
      />
    )

    expect(screen.getByText('Recently Created Villages')).toBeInTheDocument()
    expect(screen.getByText('Test Village')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders empty state', () => {
    render(
      <VillageTable
        villages={[]}
        loading={false}
        error={null}
      />
    )

    expect(screen.getByText('No villages created yet.')).toBeInTheDocument()
  })

  it('renders error state', () => {
    const error = new Error('Test error')
    render(
      <VillageTable
        villages={null}
        loading={false}
        error={error}
      />
    )

    expect(screen.getByText('Failed to load villages')).toBeInTheDocument()
  })
})
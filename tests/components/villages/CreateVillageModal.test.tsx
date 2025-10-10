import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CreateVillageModal } from '@/components/villages/CreateVillageModal'

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

// Mock hooks
jest.mock('@/hooks/useCreateVillage', () => ({
  useCreateVillage: () => ({
    creating: false,
    createVillage: jest.fn(),
    checkVillageNameUnique: jest.fn(),
    checkEmailUnique: jest.fn(),
  }),
}))

jest.mock('@/hooks/useLookupValues', () => ({
  useLookupValues: () => ({
    villageStatuses: [
      { id: '1', code: 'active', name: 'Active', color_code: '#22574A' },
      { id: '2', code: 'inactive', name: 'Inactive', color_code: '#666666' },
    ],
    userRoles: [
      { id: '1', code: 'admin_head', name: 'Admin Head' },
    ],
    loading: false,
    error: null,
    refetch: jest.fn(),
    getAdminHeadRoleId: () => '1',
  }),
}))

beforeAll(() => {
  mockMaterialIcons();
});

describe('CreateVillageModal', () => {
  it('renders modal when open', () => {
    render(
      <CreateVillageModal
        isOpen={true}
        onClose={jest.fn()}
        onSuccess={jest.fn()}
      />
    )

    expect(screen.getByText('Create New Village')).toBeInTheDocument()
    expect(screen.getByText('Set up a new village community with guided configuration')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <CreateVillageModal
        isOpen={false}
        onClose={jest.fn()}
        onSuccess={jest.fn()}
      />
    )

    expect(screen.queryByText('Create New Village')).not.toBeInTheDocument()
  })

  it('renders step 1 by default', () => {
    render(
      <CreateVillageModal
        isOpen={true}
        onClose={jest.fn()}
        onSuccess={jest.fn()}
      />
    )

    expect(screen.getByText('Basic Information')).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 5: Basic Information')).toBeInTheDocument()
  })
})
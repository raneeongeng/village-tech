import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { StatCard } from '@/components/dashboard/StatCard'

describe('StatCard', () => {
  it('renders loading state', () => {
    render(
      <StatCard
        title="Test Title"
        value="123"
        loading={true}
      />
    )

    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders success state with value', () => {
    render(
      <StatCard
        title="Total Villages"
        value={42}
      />
    )

    expect(screen.getByText('Total Villages')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders error state with retry button', () => {
    const mockRetry = jest.fn()
    render(
      <StatCard
        title="Test Title"
        value="123"
        error={new Error('Test error')}
        onRetry={mockRetry}
      />
    )

    expect(screen.getByText('Error loading data')).toBeInTheDocument()
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('displays zero values correctly', () => {
    render(
      <StatCard
        title="Active Tenants"
        value={0}
      />
    )

    expect(screen.getByText('Active Tenants')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
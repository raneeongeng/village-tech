import { renderHook } from '@testing-library/react'
import { useDashboardStats } from '@/hooks/useDashboardStats'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        count: 0,
        error: null
      }))
    }))
  }
}))

describe('useDashboardStats', () => {
  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useDashboardStats())

    expect(result.current.totalVillages.loading).toBe(true)
    expect(result.current.activeHouseholds.loading).toBe(true)
    expect(result.current.inactiveHouseholds.loading).toBe(true)

    expect(result.current.totalVillages.data).toBe(null)
    expect(result.current.activeHouseholds.data).toBe(null)
    expect(result.current.inactiveHouseholds.data).toBe(null)
  })

  it('should provide refetchAll function', () => {
    const { result } = renderHook(() => useDashboardStats())

    expect(typeof result.current.refetchAll).toBe('function')
  })
})
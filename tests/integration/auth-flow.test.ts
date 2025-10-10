/**
 * @jest-environment jsdom
 */

import { signIn, signOut, getCurrentSession, hasPermission } from '@/lib/auth'
import { supabase } from '@/lib/supabase/client'
import type { AuthSession, User } from '@/types/auth'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}))

const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Sign In Flow', () => {
    it('successfully authenticates user with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'admin@greenville.vmp.app',
        aud: 'authenticated',
        role: 'authenticated',
        email_confirmed_at: '2024-01-01T00:00:00Z',
        phone: '',
        confirmed_at: '2024-01-01T00:00:00Z',
        last_sign_in_at: '2024-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
        identities: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: mockUser,
      }

      const mockUserProfile = {
        ...mockUser,
        role: 'admin-head' as const,
        tenant_id: 'tenant-123',
        full_name: 'John Administrator',
        is_active: true,
        tenant: {
          id: 'tenant-123',
          name: 'Greenville Village',
          subdomain: 'greenville',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      }

      // Mock Supabase auth response
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      })

      // Mock user profile query
      const mockFrom = mockSupabase.from as jest.Mock
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUserProfile,
            error: null,
          }),
        }),
      })
      mockFrom.mockReturnValue({ select: mockSelect })

      const credentials = {
        email: 'admin@greenville.vmp.app',
        password: 'password123',
      }

      const result = await signIn(credentials)

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: credentials.email,
        password: credentials.password,
      })

      expect(result).toEqual({
        user: mockUserProfile,
        tenant: mockUserProfile.tenant,
        access_token: mockSession.access_token,
        refresh_token: mockSession.refresh_token,
        expires_at: mockSession.expires_at,
      })
    })

    it('handles authentication failure with invalid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      })

      const credentials = {
        email: 'admin@greenville.vmp.app',
        password: 'wrongpassword',
      }

      await expect(signIn(credentials)).rejects.toThrow('Invalid login credentials')
    })

    it('handles user profile fetch failure', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'admin@greenville.vmp.app',
        aud: 'authenticated',
        role: 'authenticated',
        email_confirmed_at: '2024-01-01T00:00:00Z',
        phone: '',
        confirmed_at: '2024-01-01T00:00:00Z',
        last_sign_in_at: '2024-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
        identities: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: mockUser,
      }

      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      })

      // Mock user profile query failure
      const mockFrom = mockSupabase.from as jest.Mock
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'User profile not found' },
          }),
        }),
      })
      mockFrom.mockReturnValue({ select: mockSelect })

      const credentials = {
        email: 'admin@greenville.vmp.app',
        password: 'password123',
      }

      await expect(signIn(credentials)).rejects.toThrow('Failed to fetch user profile')
    })
  })

  describe('Sign Out Flow', () => {
    it('successfully signs out user', async () => {
      mockSupabase.auth.signOut.mockResolvedValueOnce({
        error: null,
      })

      await expect(signOut()).resolves.toBeUndefined()
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })

    it('handles sign out failure', async () => {
      mockSupabase.auth.signOut.mockResolvedValueOnce({
        error: { message: 'Sign out failed' },
      })

      await expect(signOut()).rejects.toThrow('Sign out failed')
    })
  })

  describe('Session Management', () => {
    it('retrieves current session when user is authenticated', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'admin@greenville.vmp.app',
        aud: 'authenticated',
        role: 'authenticated',
        email_confirmed_at: '2024-01-01T00:00:00Z',
        phone: '',
        confirmed_at: '2024-01-01T00:00:00Z',
        last_sign_in_at: '2024-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
        identities: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: mockUser,
      }

      const mockUserProfile = {
        ...mockUser,
        role: 'admin-head' as const,
        tenant_id: 'tenant-123',
        full_name: 'John Administrator',
        is_active: true,
        tenant: {
          id: 'tenant-123',
          name: 'Greenville Village',
          subdomain: 'greenville',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      }

      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      })

      // Mock user profile query
      const mockFrom = mockSupabase.from as jest.Mock
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUserProfile,
            error: null,
          }),
        }),
      })
      mockFrom.mockReturnValue({ select: mockSelect })

      const result = await getCurrentSession()

      expect(result).toEqual({
        user: mockUserProfile,
        tenant: mockUserProfile.tenant,
        access_token: mockSession.access_token,
        refresh_token: mockSession.refresh_token,
        expires_at: mockSession.expires_at,
      })
    })

    it('returns null when no session exists', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      })

      const result = await getCurrentSession()
      expect(result).toBeNull()
    })

    it('handles session retrieval errors gracefully', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: { message: 'Session retrieval failed' },
      })

      const result = await getCurrentSession()
      expect(result).toBeNull()
    })
  })

  describe('Permission System', () => {
    it('grants all permissions to superadmin', () => {
      const superadmin: User = {
        id: 'user-1',
        email: 'super@vmp.app',
        role: 'superadmin',
        tenant_id: 'tenant-1',
        full_name: 'Super Admin',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        aud: 'authenticated',
        confirmed_at: '2024-01-01T00:00:00Z',
        email_confirmed_at: '2024-01-01T00:00:00Z',
        phone: '',
        last_sign_in_at: '2024-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
      }

      expect(hasPermission(superadmin, 'manage_users')).toBe(true)
      expect(hasPermission(superadmin, 'view_reports')).toBe(true)
      expect(hasPermission(superadmin, 'any_permission')).toBe(true)
    })

    it('grants specific permissions to admin-head', () => {
      const adminHead: User = {
        id: 'user-2',
        email: 'admin@village.vmp.app',
        role: 'admin-head',
        tenant_id: 'tenant-1',
        full_name: 'Admin Head',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        aud: 'authenticated',
        confirmed_at: '2024-01-01T00:00:00Z',
        email_confirmed_at: '2024-01-01T00:00:00Z',
        phone: '',
        last_sign_in_at: '2024-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
      }

      expect(hasPermission(adminHead, 'manage_households')).toBe(true)
      expect(hasPermission(adminHead, 'manage_fees')).toBe(true)
      expect(hasPermission(adminHead, 'view_reports')).toBe(true)
      expect(hasPermission(adminHead, 'manage_users')).toBe(false) // Superadmin only
    })

    it('restricts permissions for household-member', () => {
      const householdMember: User = {
        id: 'user-3',
        email: 'member@village.vmp.app',
        role: 'household-member',
        tenant_id: 'tenant-1',
        full_name: 'Household Member',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        aud: 'authenticated',
        confirmed_at: '2024-01-01T00:00:00Z',
        email_confirmed_at: '2024-01-01T00:00:00Z',
        phone: '',
        last_sign_in_at: '2024-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
      }

      expect(hasPermission(householdMember, 'view_household')).toBe(true)
      expect(hasPermission(householdMember, 'view_rules')).toBe(true)
      expect(hasPermission(householdMember, 'manage_households')).toBe(false)
      expect(hasPermission(householdMember, 'manage_fees')).toBe(false)
    })

    it('handles unknown permissions gracefully', () => {
      const user: User = {
        id: 'user-4',
        email: 'test@village.vmp.app',
        role: 'household-head',
        tenant_id: 'tenant-1',
        full_name: 'Test User',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        aud: 'authenticated',
        confirmed_at: '2024-01-01T00:00:00Z',
        email_confirmed_at: '2024-01-01T00:00:00Z',
        phone: '',
        last_sign_in_at: '2024-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
      }

      expect(hasPermission(user, 'unknown_permission')).toBe(false)
    })
  })

  describe('Multi-Tenant Isolation', () => {
    it('authenticates users within correct tenant context', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'admin@greenville.vmp.app',
        aud: 'authenticated',
        role: 'authenticated',
        email_confirmed_at: '2024-01-01T00:00:00Z',
        phone: '',
        confirmed_at: '2024-01-01T00:00:00Z',
        last_sign_in_at: '2024-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
        identities: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: mockUser,
      }

      const mockUserProfile = {
        ...mockUser,
        role: 'admin-head' as const,
        tenant_id: 'greenville-123',
        full_name: 'John Administrator',
        is_active: true,
        tenant: {
          id: 'greenville-123',
          name: 'Greenville Village',
          subdomain: 'greenville',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      }

      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      })

      // Mock user profile query with tenant context
      const mockFrom = mockSupabase.from as jest.Mock
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUserProfile,
            error: null,
          }),
        }),
      })
      mockFrom.mockReturnValue({ select: mockSelect })

      const result = await signIn({
        email: 'admin@greenville.vmp.app',
        password: 'password123',
      })

      expect(result.tenant.subdomain).toBe('greenville')
      expect(result.user.tenant_id).toBe('greenville-123')
    })
  })
})
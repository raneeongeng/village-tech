'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User, AuthSession } from '@/types/auth'
import { getCurrentSession, signOut } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refreshSession = async () => {
    try {
      const currentSession = await getCurrentSession()
      if (currentSession) {
        setSession(currentSession)
        setUser(currentSession.user)
      } else {
        setSession(null)
        setUser(null)
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
      // Clear any invalid session data
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      setSession(null)
      setUser(null)
    }
  }

  const logout = async () => {
    try {
      await signOut()
      setSession(null)
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      await refreshSession()
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    logout,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Mock user data for development - replace with real Supabase data
export function useMockAuth() {
  const [mockUser] = useState<User>({
    id: 'mock-user-1',
    email: 'admin@greenville.vmp.app',
    first_name: 'John',
    middle_name: '',
    last_name: 'Administrator',
    tenant_id: '1',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    role: {
      id: 'role-1',
      code: 'admin_head',
      name: 'Admin Head',
      description: 'Village administrator with full management permissions',
      color_code: '#007bff',
      icon: 'person-gear'
    },
    aud: 'authenticated',
    confirmed_at: '2024-01-01T00:00:00Z',
    email_confirmed_at: '2024-01-01T00:00:00Z',
    phone: '',
    last_sign_in_at: '2024-01-01T00:00:00Z',
    app_metadata: {},
    user_metadata: {},
  })

  return {
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
    logout: async () => {
      console.log('Mock logout')
    },
    refreshSession: async () => {
      console.log('Mock refresh session')
    },
  }
}
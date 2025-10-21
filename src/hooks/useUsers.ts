import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useTenant } from '@/hooks/useTenant'
import { useAuth } from '@/hooks/useAuth'
import type { User } from '@/types/auth'

export interface CreateUserData {
  firstName: string
  middleName?: string
  lastName: string
  suffix?: string
  email: string
  roleId: string
  password: string
}

export interface UpdateUserData {
  firstName?: string
  middleName?: string
  lastName?: string
  suffix?: string
  email?: string
  roleId?: string
}

export interface UserWithRole extends User {
  role_name: string
  role_code: string
}

interface UseUsersOptions {
  search?: string
  roleFilter?: string
  statusFilter?: string
}

export function useUsers(options: UseUsersOptions = {}) {
  const { tenant } = useTenant()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserWithRole[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    if (!tenant?.id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      let query = supabase
        .from('users')
        .select(`
          *,
          role:lookup_values!users_role_id_fkey (
            id,
            code,
            name
          )
        `)
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })

      // Apply search filter
      if (options.search) {
        query = query.or(`first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,email.ilike.%${options.search}%`)
      }

      // Apply role filter
      if (options.roleFilter) {
        query = query.eq('role.code', options.roleFilter)
      }

      // Apply status filter
      if (options.statusFilter === 'active') {
        query = query.eq('is_active', true)
      } else if (options.statusFilter === 'inactive') {
        query = query.eq('is_active', false)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw new Error(`Failed to fetch users: ${fetchError.message}`)
      }

      // Transform data to include role information
      const transformedUsers: UserWithRole[] = (data || []).map((user: any) => ({
        ...user,
        role: user.role,
        role_name: user.role?.name || 'Unknown',
        role_code: user.role?.code || 'unknown'
      }))

      setUsers(transformedUsers)
    } catch (err) {
      console.error('Failed to load users:', err)
      setError('Failed to load users. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [tenant?.id, options.search, options.roleFilter, options.statusFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const createUser = async (userData: CreateUserData): Promise<{ success: boolean; error?: string }> => {
    if (!tenant?.id || !currentUser?.id) {
      return { success: false, error: 'Authentication required' }
    }

    try {
      // Step 1: Check email availability
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)

      if (checkError) {
        throw new Error(`Email check failed: ${checkError.message}`)
      }

      if (existingUsers && existingUsers.length > 0) {
        return { success: false, error: 'Email already exists in the system' }
      }

      // Step 2: Store current session before creating new user
      const currentSession = await supabase.auth.getSession()

      // Step 3: Create auth user with skip_auto_insert
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: undefined, // No email confirmation
          data: {
            skip_auto_insert: 'true', // We'll handle the user record insertion manually
            first_name: userData.firstName,
            middle_name: userData.middleName || null,
            last_name: userData.lastName,
            suffix: userData.suffix || null,
          }
        }
      })

      // Step 4: Restore original session immediately after signup
      if (currentSession.data.session) {
        await supabase.auth.setSession({
          access_token: currentSession.data.session.access_token,
          refresh_token: currentSession.data.session.refresh_token
        })
      }

      if (authError) {
        throw new Error(`Authentication error: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('Failed to create authentication account')
      }

      // Step 5: Create the user record manually in users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id, // Use the auth user ID
          tenant_id: tenant.id,
          email: userData.email,
          role_id: userData.roleId,
          first_name: userData.firstName,
          middle_name: userData.middleName || null,
          last_name: userData.lastName,
          suffix: userData.suffix || null,
          is_active: true,
          created_by: currentUser.id,
        })

      if (userError) {
        console.error('Error creating user record:', userError)

        // Rollback: Try to delete the auth user if user record creation fails
        try {
          await supabase.auth.admin.deleteUser(authData.user.id)
        } catch (rollbackError) {
          console.error('Failed to rollback auth user:', rollbackError)
        }

        throw new Error(`Failed to create user record: ${userError.message}`)
      }

      // Refresh the users list
      await fetchUsers()

      return { success: true }
    } catch (err) {
      console.error('Failed to create user:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to create user'
      }
    }
  }

  const updateUser = async (userId: string, userData: UpdateUserData): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser?.id) {
      return { success: false, error: 'Authentication required' }
    }

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          ...userData,
          updated_by: currentUser.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .eq('tenant_id', tenant?.id)

      if (updateError) {
        throw new Error(`Failed to update user: ${updateError.message}`)
      }

      // Refresh the users list
      await fetchUsers()

      return { success: true }
    } catch (err) {
      console.error('Failed to update user:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update user'
      }
    }
  }

  const toggleUserStatus = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser?.id) {
      return { success: false, error: 'Authentication required' }
    }

    try {
      // Get current user status
      const currentUserData = users.find(u => u.id === userId)
      if (!currentUserData) {
        return { success: false, error: 'User not found' }
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          is_active: !currentUserData.is_active,
          updated_by: currentUser.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .eq('tenant_id', tenant?.id)

      if (updateError) {
        throw new Error(`Failed to update user status: ${updateError.message}`)
      }

      // Refresh the users list
      await fetchUsers()

      return { success: true }
    } catch (err) {
      console.error('Failed to toggle user status:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update user status'
      }
    }
  }

  const deleteUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser?.id) {
      return { success: false, error: 'Authentication required' }
    }

    try {
      // Delete user record (this will also handle auth cleanup via triggers if configured)
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)
        .eq('tenant_id', tenant?.id)

      if (deleteError) {
        throw new Error(`Failed to delete user: ${deleteError.message}`)
      }

      // Refresh the users list
      await fetchUsers()

      return { success: true }
    } catch (err) {
      console.error('Failed to delete user:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to delete user'
      }
    }
  }

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
  }
}
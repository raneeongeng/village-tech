'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { CreateVillageFormData, CreateVillageResult } from '@/types/village'
import { useAuth } from '@/hooks/useAuth'

interface UseCreateVillageReturn {
  creating: boolean
  error: Error | null
  createVillage: (formData: CreateVillageFormData) => Promise<CreateVillageResult>
  checkVillageNameUnique: (name: string) => Promise<boolean>
  checkEmailUnique: (email: string, excludeVillageId?: string) => Promise<boolean>
}

export function useCreateVillage(): UseCreateVillageReturn {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()

  const checkVillageNameUnique = useCallback(async (name: string): Promise<boolean> => {
    try {
      const { count, error } = await supabase
        .from('villages')
        .select('*', { count: 'exact', head: true })
        .eq('name', name)

      if (error) {
        console.error('Error checking village name uniqueness:', error)
        return false
      }

      return count === 0
    } catch (err) {
      console.error('Error in checkVillageNameUnique:', err)
      return false
    }
  }, [])

  const checkEmailUnique = useCallback(async (email: string, excludeVillageId?: string): Promise<boolean> => {
    try {
      let query = supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('email', email)

      if (excludeVillageId) {
        query = query.neq('tenant_id', excludeVillageId)
      }

      const { count, error } = await query

      if (error) {
        console.error('Error checking email uniqueness:', error)
        return false
      }

      return count === 0
    } catch (err) {
      console.error('Error in checkEmailUnique:', err)
      return false
    }
  }, [])

  const createVillage = useCallback(async (formData: CreateVillageFormData): Promise<CreateVillageResult> => {
    setCreating(true)
    setError(null)

    try {
      // Step 1: Create village
      const villageSettings = {
        description: formData.description || undefined,
        address: formData.address || undefined,
        contact_phone: formData.contactPhone || undefined,
        contact_email: formData.contactEmail || undefined,
        region: formData.region || undefined,
        timezone: formData.timezone || 'America/New_York',
        currency: formData.currency || 'USD',
        date_format: formData.dateFormat || 'MM/DD/YYYY',
        notifications_enabled: formData.notificationsEnabled !== false,
      }

      const { data: village, error: villageError } = await supabase
        .from('villages')
        .insert({
          name: formData.name,
          status_id: formData.statusId,
          settings: villageSettings,
          created_by: user?.id,
        })
        .select()
        .single()

      if (villageError) {
        console.error('Error creating village:', villageError)
        throw new Error(
          villageError.code === '23505'
            ? 'Village name already exists'
            : 'Failed to create village'
        )
      }

      // Step 2: Create admin head authentication account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.adminEmail,
        password: formData.adminPassword,
        options: {
          emailRedirectTo: undefined, // No email confirmation flow
          data: {
            skip_auto_insert: 'true', // We'll handle the user record insertion manually
            first_name: formData.adminFirstName,
            middle_name: formData.adminMiddleName || null,
            last_name: formData.adminLastName,
            suffix: formData.adminSuffix || null,
          }
        }
      })

      if (authError) {
        console.error('Error creating admin head authentication:', authError)

        // Rollback: Delete village if auth creation fails
        await supabase.from('villages').delete().eq('id', village.id)

        throw new Error(
          authError.message === 'User already registered'
            ? 'Email already exists'
            : `Failed to create admin head account: ${authError.message}`
        )
      }

      // Step 3: Create the user record manually since we skipped auto-insert
      const { data: adminHead, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user?.id, // Use the auth user ID
          tenant_id: village.id,
          email: formData.adminEmail,
          role_id: formData.adminRoleId,
          first_name: formData.adminFirstName,
          middle_name: formData.adminMiddleName || null,
          last_name: formData.adminLastName,
          suffix: formData.adminSuffix || null,
          is_active: true,
        })
        .select()
        .single()

      if (userError) {
        console.error('Error creating admin head user record:', userError)

        // Rollback: Delete the auth user if user record creation fails
        if (authData.user?.id) {
          await supabase.auth.admin.deleteUser(authData.user.id)
        }
        // Also rollback the village
        await supabase.from('villages').delete().eq('id', village.id)

        throw new Error(
          userError.code === '23505'
            ? 'User record already exists'
            : 'Failed to create admin head user record'
        )
      }

      setCreating(false)
      return {
        success: true,
        village,
        adminHead,
      }

    } catch (err) {
      console.error('Error in createVillage:', err)
      setError(err as Error)
      setCreating(false)
      return {
        success: false,
        error: err as Error,
      }
    }
  }, [user])

  return {
    creating,
    error,
    createVillage,
    checkVillageNameUnique,
    checkEmailUnique,
  }
}

export async function updateVillageStatus(villageId: string, newStatusId: string): Promise<{ success: boolean; error?: Error }> {
  try {
    const { error } = await supabase
      .from('villages')
      .update({
        status_id: newStatusId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', villageId)

    if (error) {
      console.error('Failed to update village status:', error)
      return { success: false, error: new Error('Failed to update village status') }
    }

    return { success: true }
  } catch (err) {
    console.error('Error in updateVillageStatus:', err)
    return { success: false, error: err as Error }
  }
}
'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface VillageUser {
  id: string
  first_name: string
  middle_name?: string
  last_name: string
  suffix?: string
  email: string
  is_active: boolean
  role_id: string
  settings?: any
  created_at: string
}

export interface VillageDetails {
  id: string
  name: string
  status_id: string
  settings: {
    description?: string
    address?: string
    region?: string
    contact_phone?: string
    contact_email?: string
    timezone?: string
    currency?: string
  }
  created_at: string
  updated_at: string
  lookup_values?: {
    name: string
  }
  users: VillageUser[]
}

export interface VillageMetadata {
  totalMembers: number
  qrCodesCount: number
  lastActivityDate: string
  activeAdminsCount: number
  storageUsed: number
  storageTotal: number
}

export interface VillageDetailsData {
  village: VillageDetails | null
  adminHead: VillageUser | null
  metadata: VillageMetadata | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useVillageDetails(villageId: string): VillageDetailsData {
  const [village, setVillage] = useState<VillageDetails | null>(null)
  const [adminHead, setAdminHead] = useState<VillageUser | null>(null)
  const [metadata, setMetadata] = useState<VillageMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchVillageDetails = useCallback(async () => {
    if (!villageId) return

    setLoading(true)
    setError(null)

    try {
      // Get admin_head role ID first
      const { data: roleCategoryData } = await supabase
        .from('lookup_categories')
        .select('id')
        .eq('code', 'user_roles')
        .single()

      if (!roleCategoryData) {
        throw new Error('User roles category not found')
      }

      const { data: adminRoleData } = await supabase
        .from('lookup_values')
        .select('id')
        .eq('code', 'admin_head')
        .eq('category_id', roleCategoryData.id)
        .single()

      // Fetch village with status lookup
      const { data: villageData, error: villageError } = await supabase
        .from('villages')
        .select(`
          id,
          name,
          status_id,
          settings,
          created_at,
          updated_at,
          lookup_values!villages_status_id_fkey (
            name
          )
        `)
        .eq('id', villageId)
        .single()

      if (villageError) {
        if (villageError.code === 'PGRST116') {
          throw new Error('Village not found')
        }
        throw new Error('Failed to fetch village details')
      }

      // Fetch users for this village
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          first_name,
          middle_name,
          last_name,
          suffix,
          email,
          is_active,
          role_id,
          settings,
          created_at
        `)
        .eq('tenant_id', villageId)

      if (usersError) {
        console.error('Error fetching users:', usersError)
        // Don't throw error for users, just log it and continue
      }

      const users = usersData || []
      const adminHeadUser = adminRoleData ? users.find(u => u.role_id === adminRoleData.id) : null

      // Calculate metadata
      const totalMembers = users.length
      const activeAdminsCount = users.filter(u =>
        u.is_active && u.role_id !== adminRoleData?.id
      ).length

      const villageWithUsers: VillageDetails = {
        ...villageData,
        lookup_values: (villageData.lookup_values as any)?.[0],
        users
      }

      const metadataInfo: VillageMetadata = {
        totalMembers,
        qrCodesCount: 0, // Placeholder for now
        lastActivityDate: villageData.updated_at,
        activeAdminsCount,
        storageUsed: 0, // Placeholder for now
        storageTotal: 10 // Placeholder for now
      }

      setVillage(villageWithUsers)
      setAdminHead(adminHeadUser || null)
      setMetadata(metadataInfo)
      setLoading(false)
    } catch (err) {
      console.error('Error in fetchVillageDetails:', err)
      setError(err as Error)
      setVillage(null)
      setAdminHead(null)
      setMetadata(null)
      setLoading(false)
    }
  }, [villageId])

  const refetch = useCallback(async () => {
    await fetchVillageDetails()
  }, [fetchVillageDetails])

  useEffect(() => {
    fetchVillageDetails()
  }, [fetchVillageDetails])

  return {
    village,
    adminHead,
    metadata,
    loading,
    error,
    refetch,
  }
}
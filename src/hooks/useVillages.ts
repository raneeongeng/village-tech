'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Village, VillageFilters, PaginationData, VillageListData, DEFAULT_VILLAGE_FILTERS, ITEMS_PER_PAGE } from '@/types/village'

// Simplified interface for client-side filtering
export interface SimpleVillageData {
  villages: Village[] | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useVillages(): SimpleVillageData {
  const [villages, setVillages] = useState<Village[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchVillages = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch all villages without any filters for client-side filtering
      const { data: villageData, error: villageError } = await supabase
        .from('villages')
        .select(`
          id,
          name,
          status_id,
          settings,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })

      if (villageError) {
        throw new Error('Failed to fetch villages')
      }

      // Fetch status lookup values for all villages
      let statusLookup: { [key: string]: any } = {}
      if (villageData && villageData.length > 0) {
        const statusIds = Array.from(new Set(villageData.map(v => v.status_id)))
        const { data: statuses, error: statusError } = await supabase
          .from('lookup_values')
          .select('id, code, name, color_code')
          .in('id', statusIds)

        if (!statusError && statuses) {
          statusLookup = statuses.reduce((acc: { [key: string]: any }, status: any) => {
            acc[status.id] = status
            return acc
          }, {})
        }
      }

      // Fetch admin head for each village
      const villagesWithAdminHead: Village[] = []

      if (villageData && villageData.length > 0) {
        // Get admin_head role ID first
        const { data: roleCategoryData } = await supabase
          .from('lookup_categories')
          .select('id')
          .eq('code', 'user_roles')
          .single()

        if (roleCategoryData) {
          const { data: adminRoleData } = await supabase
            .from('lookup_values')
            .select('id')
            .eq('code', 'admin_head')
            .eq('category_id', roleCategoryData.id)
            .single()

          if (adminRoleData) {
            // Fetch admin heads for all villages
            const villageIds = villageData.map(v => v.id)
            const { data: adminHeads } = await supabase
              .from('users')
              .select('id, tenant_id, first_name, middle_name, last_name, suffix, email')
              .in('tenant_id', villageIds)
              .eq('role_id', adminRoleData.id)
              .eq('is_active', true)

            // Create lookup for admin heads by village ID
            const adminHeadLookup: { [key: string]: any } = {}
            if (adminHeads) {
              adminHeads.forEach(admin => {
                adminHeadLookup[admin.tenant_id] = admin
              })
            }

            // Combine all data
            for (const village of villageData) {
              const adminHead = adminHeadLookup[village.id]

              villagesWithAdminHead.push({
                ...village,
                status: statusLookup[village.status_id],
                admin_head: adminHead ? {
                  id: adminHead.id,
                  first_name: adminHead.first_name,
                  middle_name: adminHead.middle_name,
                  last_name: adminHead.last_name,
                  suffix: adminHead.suffix,
                  email: adminHead.email,
                } : undefined,
              })
            }
          }
        }
      }

      setVillages(villagesWithAdminHead)
      setLoading(false)
    } catch (err) {
      console.error('Error in fetchVillages:', err)
      setError(err as Error)
      setVillages(null)
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(async () => {
    await fetchVillages()
  }, [fetchVillages])

  useEffect(() => {
    fetchVillages()
  }, [fetchVillages])

  return {
    villages,
    loading,
    error,
    refetch,
  }
}
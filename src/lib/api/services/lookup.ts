import { supabase } from '@/lib/supabase/client'
import { lookupCacheManager, type LookupCategory } from '@/lib/cache/lookup-cache'
import type { LookupValue } from '@/types/village'
import type { ApiResponse } from '@/lib/api/client'

/**
 * Common lookup categories used throughout the application
 */
export const LOOKUP_CATEGORIES = {
  HOUSEHOLD_STATUSES: 'household_statuses',
  HOUSEHOLD_MEMBER_RELATIONSHIPS: 'household_member_relationships',
  USER_ROLES: 'user_roles',
  VILLAGE_TENANT_STATUSES: 'village_tenant_statuses',
} as const

/**
 * Request deduplication for simultaneous calls
 */
const pendingRequests = new Map<string, Promise<any>>()

/**
 * Centralized lookup service with caching and request deduplication
 */
export class LookupService {
  /**
   * Get all lookup categories with caching
   */
  static async getAllCategories(): Promise<ApiResponse<LookupCategory[]>> {
    const cacheKey = 'all_categories'

    // Check if request is already pending
    if (pendingRequests.has(cacheKey)) {
      try {
        const result = await pendingRequests.get(cacheKey)
        return { success: true, data: result }
      } catch (error) {
        return { success: false, error: { message: 'Failed to fetch categories' } }
      }
    }

    // Check cache first
    const cached = lookupCacheManager.getCachedCategories()
    if (cached) {
      return { success: true, data: cached }
    }

    // Create pending request
    const request = supabase
      .from('lookup_categories')
      .select('*')
      .eq('is_active', true)
      .order('name')

    pendingRequests.set(cacheKey, request.then(({ data }) => data || []))

    try {
      const { data, error } = await request

      if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`)
      }

      const categories = data || []

      // Cache the result
      lookupCacheManager.cacheAllCategories(categories)

      return { success: true, data: categories }
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Unknown error' }
      }
    } finally {
      pendingRequests.delete(cacheKey)
    }
  }

  /**
   * Get lookup category by code with caching
   */
  static async getCategoryByCode(code: string): Promise<ApiResponse<LookupCategory>> {
    const cacheKey = `category_${code}`

    // Check if request is already pending
    if (pendingRequests.has(cacheKey)) {
      try {
        const result = await pendingRequests.get(cacheKey)
        return { success: true, data: result }
      } catch (error) {
        return { success: false, error: { message: 'Failed to fetch category' } }
      }
    }

    // Check cache first
    const cached = lookupCacheManager.getCachedCategory(code)
    if (cached) {
      return { success: true, data: cached }
    }

    // Create pending request
    const request = supabase
      .from('lookup_categories')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single()

    pendingRequests.set(cacheKey, request.then(({ data }) => data || []))

    try {
      const { data, error } = await request

      if (error) {
        throw new Error(`Failed to fetch category ${code}: ${error.message}`)
      }

      if (!data) {
        throw new Error(`Category ${code} not found`)
      }

      // Cache the result
      lookupCacheManager.cacheCategory(data)

      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Unknown error' }
      }
    } finally {
      pendingRequests.delete(cacheKey)
    }
  }

  /**
   * Get lookup values by category code with caching
   */
  static async getValuesByCategoryCode(categoryCode: string): Promise<ApiResponse<LookupValue[]>> {
    const cacheKey = `values_${categoryCode}`

    // Check if request is already pending
    if (pendingRequests.has(cacheKey)) {
      try {
        const result = await pendingRequests.get(cacheKey)
        return { success: true, data: result }
      } catch (error) {
        return { success: false, error: { message: 'Failed to fetch values' } }
      }
    }

    // Check cache first
    const cached = lookupCacheManager.getCachedCategoryValuesByCode(categoryCode)
    if (cached) {
      return { success: true, data: cached }
    }

    try {
      // First get the category ID
      const categoryResult = await this.getCategoryByCode(categoryCode)
      if (!categoryResult.success || !categoryResult.data) {
        return {
          success: false,
          error: { message: `Category ${categoryCode} not found` }
        }
      }

      const categoryId = categoryResult.data.id

      // Create pending request for values
      const request = supabase
        .from('lookup_values')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      pendingRequests.set(cacheKey, request.then(({ data }) => data || []))

      const { data, error } = await request

      if (error) {
        throw new Error(`Failed to fetch values for ${categoryCode}: ${error.message}`)
      }

      const values = data || []

      // Cache the result
      lookupCacheManager.cacheCategoryValuesByCode(categoryCode, values)

      return { success: true, data: values }
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Unknown error' }
      }
    } finally {
      pendingRequests.delete(cacheKey)
    }
  }

  /**
   * Get common lookup data in a single batch request
   */
  static async getCommonLookups(): Promise<ApiResponse<{
    householdStatuses: LookupValue[]
    relationshipTypes: LookupValue[]
    userRoles: LookupValue[]
  }>> {
    const cacheKey = 'common_lookups'

    // Check if request is already pending
    if (pendingRequests.has(cacheKey)) {
      try {
        const result = await pendingRequests.get(cacheKey)
        return { success: true, data: result }
      } catch (error) {
        return { success: false, error: { message: 'Failed to fetch common lookups' } }
      }
    }

    // Check cache first
    const cached = lookupCacheManager.getCachedCommonLookups()
    if (cached) {
      return { success: true, data: cached }
    }

    // Create batch request
    const batchRequest = Promise.all([
      this.getValuesByCategoryCode(LOOKUP_CATEGORIES.HOUSEHOLD_STATUSES),
      this.getValuesByCategoryCode(LOOKUP_CATEGORIES.HOUSEHOLD_MEMBER_RELATIONSHIPS),
      this.getValuesByCategoryCode(LOOKUP_CATEGORIES.USER_ROLES),
    ])

    pendingRequests.set(cacheKey, batchRequest)

    try {
      const [
        householdStatusesResult,
        relationshipTypesResult,
        userRolesResult,
      ] = await batchRequest

      // Check if all requests succeeded
      if (!householdStatusesResult.success || !relationshipTypesResult.success || !userRolesResult.success) {
        const errors = [
          householdStatusesResult.error,
          relationshipTypesResult.error,
          userRolesResult.error,
        ].filter(Boolean).map(e => e?.message).join(', ')

        throw new Error(`Failed to fetch common lookups: ${errors}`)
      }

      const result = {
        householdStatuses: householdStatusesResult.data || [],
        relationshipTypes: relationshipTypesResult.data || [],
        userRoles: userRolesResult.data || [],
      }

      // Cache the result
      lookupCacheManager.cacheCommonLookups(result)

      return { success: true, data: result }
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Unknown error' }
      }
    } finally {
      pendingRequests.delete(cacheKey)
    }
  }

  /**
   * Get specific lookup value by category and value codes
   */
  static async getValueByCode(categoryCode: string, valueCode: string): Promise<ApiResponse<LookupValue>> {
    // Check cache first
    const cached = lookupCacheManager.getCachedValue(categoryCode, valueCode)
    if (cached) {
      return { success: true, data: cached }
    }

    // Get all values for the category and find the specific one
    const valuesResult = await this.getValuesByCategoryCode(categoryCode)
    if (!valuesResult.success) {
      return {
        success: false,
        error: valuesResult.error
      }
    }

    const value = valuesResult.data?.find(v => v.code === valueCode)
    if (!value) {
      return {
        success: false,
        error: { message: `Value ${valueCode} not found in category ${categoryCode}` }
      }
    }

    return { success: true, data: value }
  }

  /**
   * Invalidate cache for a specific category
   */
  static invalidateCategory(categoryCode: string): void {
    lookupCacheManager.invalidateCategory(categoryCode)
  }

  /**
   * Invalidate all lookup caches
   */
  static invalidateAll(): void {
    lookupCacheManager.invalidateAll()
    pendingRequests.clear()
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return lookupCacheManager.getStats()
  }
}

export default LookupService
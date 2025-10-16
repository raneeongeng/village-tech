/**
 * Lookup Data Caching System for Village Management Platform
 * Provides caching for lookup categories and values (relationships, statuses, roles)
 * Follows the same pattern as navigation cache for consistency
 */

import type { LookupValue } from '@/types/village'

/**
 * Lookup data types
 */
export interface LookupCategory {
  id: string
  code: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LookupValueWithCategory extends LookupValue {
  category?: LookupCategory
}

/**
 * Cache entry structure
 */
interface CacheEntry<T> {
  data: T
  timestamp: Date
  ttl: number // Time to live in milliseconds
  hits: number
}

/**
 * Cache key generator for lookup data
 */
class LookupCacheKeyGenerator {
  static category(code: string): string {
    return `lookup_category_${code}`
  }

  static categoryValues(categoryId: string): string {
    return `lookup_values_${categoryId}`
  }

  static categoryValuesByCode(categoryCode: string): string {
    return `lookup_values_code_${categoryCode}`
  }

  static allCategories(): string {
    return 'lookup_categories_all'
  }

  static valueByCode(categoryCode: string, valueCode: string): string {
    return `lookup_value_${categoryCode}_${valueCode}`
  }

  static commonLookups(): string {
    return 'lookup_common_all'
  }
}

/**
 * LRU Cache implementation for lookup data (reusing navigation cache pattern)
 */
export class LookupCache<T> {
  private cache: Map<string, CacheEntry<T>>
  private maxSize: number
  private defaultTTL: number

  constructor(maxSize: number = 200, defaultTTL: number = 15 * 60 * 1000) { // 15 minutes default
    this.cache = new Map()
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
  }

  /**
   * Get item from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp.getTime() > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    // Update hit count and move to end (LRU)
    entry.hits++
    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.data
  }

  /**
   * Set item in cache
   */
  set(key: string, data: T, ttl?: number): void {
    // Remove expired entries
    this.cleanup()

    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: new Date(),
      ttl: ttl || this.defaultTTL,
      hits: 0
    }

    this.cache.set(key, entry)
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Remove item from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number
    maxSize: number
    hitRate: number
    totalHits: number
    oldestEntry: Date | null
    newestEntry: Date | null
  } {
    const entries = Array.from(this.cache.values())
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0)
    const timestamps = entries.map(entry => entry.timestamp)

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: totalHits > 0 ? totalHits / (totalHits + this.cache.size) : 0,
      totalHits,
      oldestEntry: timestamps.length > 0 ? new Date(Math.min(...timestamps.map(t => t.getTime()))) : null,
      newestEntry: timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => t.getTime()))) : null
    }
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (now - entry.timestamp.getTime() > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

/**
 * Lookup cache manager
 */
export class LookupCacheManager {
  private categoriesCache: LookupCache<LookupCategory[]>
  private categoryCache: LookupCache<LookupCategory>
  private valuesCache: LookupCache<LookupValue[]>
  private valueCache: LookupCache<LookupValue>
  private commonLookupsCache: LookupCache<{
    householdStatuses: LookupValue[]
    relationshipTypes: LookupValue[]
    userRoles: LookupValue[]
  }>
  private isEnabled: boolean

  constructor(options: {
    enabled?: boolean
    maxCategoryEntries?: number
    maxValueEntries?: number
    maxCommonEntries?: number
    ttl?: number
  } = {}) {
    this.isEnabled = options.enabled ?? true
    const ttl = options.ttl ?? 15 * 60 * 1000 // 15 minutes default (longer for lookup data)

    this.categoriesCache = new LookupCache<LookupCategory[]>(
      options.maxCategoryEntries ?? 10,
      ttl
    )

    this.categoryCache = new LookupCache<LookupCategory>(
      options.maxCategoryEntries ?? 50,
      ttl
    )

    this.valuesCache = new LookupCache<LookupValue[]>(
      options.maxValueEntries ?? 100,
      ttl
    )

    this.valueCache = new LookupCache<LookupValue>(
      options.maxValueEntries ?? 200,
      ttl
    )

    this.commonLookupsCache = new LookupCache(
      options.maxCommonEntries ?? 5,
      ttl
    )
  }

  /**
   * Cache all lookup categories
   */
  cacheAllCategories(categories: LookupCategory[]): void {
    if (!this.isEnabled) return

    const key = LookupCacheKeyGenerator.allCategories()
    this.categoriesCache.set(key, categories)

    // Also cache individual categories
    categories.forEach(category => {
      const categoryKey = LookupCacheKeyGenerator.category(category.code)
      this.categoryCache.set(categoryKey, category)
    })
  }

  /**
   * Get cached lookup categories
   */
  getCachedCategories(): LookupCategory[] | null {
    if (!this.isEnabled) return null

    const key = LookupCacheKeyGenerator.allCategories()
    return this.categoriesCache.get(key)
  }

  /**
   * Cache lookup category by code
   */
  cacheCategory(category: LookupCategory): void {
    if (!this.isEnabled) return

    const key = LookupCacheKeyGenerator.category(category.code)
    this.categoryCache.set(key, category)
  }

  /**
   * Get cached lookup category by code
   */
  getCachedCategory(code: string): LookupCategory | null {
    if (!this.isEnabled) return null

    const key = LookupCacheKeyGenerator.category(code)
    return this.categoryCache.get(key)
  }

  /**
   * Cache lookup values for a category
   */
  cacheCategoryValues(categoryId: string, values: LookupValue[]): void {
    if (!this.isEnabled) return

    const key = LookupCacheKeyGenerator.categoryValues(categoryId)
    this.valuesCache.set(key, values)

    // Also cache individual values
    values.forEach(value => {
      const valueKey = LookupCacheKeyGenerator.valueByCode(categoryId, value.code)
      this.valueCache.set(valueKey, value)
    })
  }

  /**
   * Cache lookup values by category code
   */
  cacheCategoryValuesByCode(categoryCode: string, values: LookupValue[]): void {
    if (!this.isEnabled) return

    const key = LookupCacheKeyGenerator.categoryValuesByCode(categoryCode)
    this.valuesCache.set(key, values)

    // Also cache individual values
    values.forEach(value => {
      const valueKey = LookupCacheKeyGenerator.valueByCode(categoryCode, value.code)
      this.valueCache.set(valueKey, value)
    })
  }

  /**
   * Get cached lookup values for a category
   */
  getCachedCategoryValues(categoryId: string): LookupValue[] | null {
    if (!this.isEnabled) return null

    const key = LookupCacheKeyGenerator.categoryValues(categoryId)
    return this.valuesCache.get(key)
  }

  /**
   * Get cached lookup values by category code
   */
  getCachedCategoryValuesByCode(categoryCode: string): LookupValue[] | null {
    if (!this.isEnabled) return null

    const key = LookupCacheKeyGenerator.categoryValuesByCode(categoryCode)
    return this.valuesCache.get(key)
  }

  /**
   * Cache common lookup data (frequently accessed together)
   */
  cacheCommonLookups(data: {
    householdStatuses: LookupValue[]
    relationshipTypes: LookupValue[]
    userRoles: LookupValue[]
  }): void {
    if (!this.isEnabled) return

    const key = LookupCacheKeyGenerator.commonLookups()
    this.commonLookupsCache.set(key, data)
  }

  /**
   * Get cached common lookup data
   */
  getCachedCommonLookups(): {
    householdStatuses: LookupValue[]
    relationshipTypes: LookupValue[]
    userRoles: LookupValue[]
  } | null {
    if (!this.isEnabled) return null

    const key = LookupCacheKeyGenerator.commonLookups()
    return this.commonLookupsCache.get(key)
  }

  /**
   * Get cached lookup value by codes
   */
  getCachedValue(categoryCode: string, valueCode: string): LookupValue | null {
    if (!this.isEnabled) return null

    const key = LookupCacheKeyGenerator.valueByCode(categoryCode, valueCode)
    return this.valueCache.get(key)
  }

  /**
   * Invalidate all lookup caches
   */
  invalidateAll(): void {
    this.categoriesCache.clear()
    this.categoryCache.clear()
    this.valuesCache.clear()
    this.valueCache.clear()
    this.commonLookupsCache.clear()
  }

  /**
   * Invalidate category and its values
   */
  invalidateCategory(categoryCode: string): void {
    const categoryKey = LookupCacheKeyGenerator.category(categoryCode)
    const valuesKey = LookupCacheKeyGenerator.categoryValuesByCode(categoryCode)

    this.categoryCache.delete(categoryKey)
    this.valuesCache.delete(valuesKey)

    // Clear common lookups as they may contain this category
    this.commonLookupsCache.clear()
  }

  /**
   * Get comprehensive cache statistics
   */
  getStats(): {
    categories: ReturnType<LookupCache<any>['getStats']>
    category: ReturnType<LookupCache<any>['getStats']>
    values: ReturnType<LookupCache<any>['getStats']>
    value: ReturnType<LookupCache<any>['getStats']>
    commonLookups: ReturnType<LookupCache<any>['getStats']>
    totalMemoryUsage: number
  } {
    return {
      categories: this.categoriesCache.getStats(),
      category: this.categoryCache.getStats(),
      values: this.valuesCache.getStats(),
      value: this.valueCache.getStats(),
      commonLookups: this.commonLookupsCache.getStats(),
      totalMemoryUsage: this.estimateMemoryUsage()
    }
  }

  /**
   * Enable or disable caching
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    if (!enabled) {
      this.invalidateAll()
    }
  }

  /**
   * Estimate memory usage (rough approximation)
   */
  private estimateMemoryUsage(): number {
    const stats = [
      this.categoriesCache.getStats(),
      this.categoryCache.getStats(),
      this.valuesCache.getStats(),
      this.valueCache.getStats(),
      this.commonLookupsCache.getStats()
    ]

    // Rough estimate: each cache entry is approximately 1KB
    return stats.reduce((total, stat) => total + stat.size * 1024, 0)
  }
}

/**
 * Global lookup cache manager instance
 */
export const lookupCacheManager = new LookupCacheManager({
  enabled: process.env.NODE_ENV !== 'test',
  maxCategoryEntries: 20,
  maxValueEntries: 200,
  maxCommonEntries: 10,
  ttl: 15 * 60 * 1000 // 15 minutes
})

/**
 * Cache key generator export for external use
 */
export { LookupCacheKeyGenerator }
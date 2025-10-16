/**
 * Global request cache for preventing duplicate API calls across page navigation
 * This cache persists across component unmounts/remounts
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface PendingRequest<T> {
  promise: Promise<T>
  timestamp: number
}

class GlobalRequestCache {
  private cache = new Map<string, CacheEntry<any>>()
  private pendingRequests = new Map<string, PendingRequest<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    console.log(`[GlobalCache] Cache HIT for key: ${key}`)
    return entry.data
  }

  /**
   * Set data in cache with TTL
   */
  set<T>(key: string, data: T, ttlMs?: number): void {
    const ttl = ttlMs || this.defaultTTL
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    }
    this.cache.set(key, entry)
    console.log(`[GlobalCache] Cache SET for key: ${key}, expires in ${ttl}ms`)
  }

  /**
   * Execute request with deduplication and caching
   */
  async executeRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    ttlMs?: number
  ): Promise<T> {
    console.log(`[GlobalCache] Request for key: ${key}`)

    // Check cache first
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Check if request is already pending
    const pending = this.pendingRequests.get(key)
    if (pending) {
      console.log(`[GlobalCache] Request already pending for key: ${key}, waiting...`)
      try {
        return await pending.promise
      } catch (error) {
        // Remove failed pending request
        this.pendingRequests.delete(key)
        throw error
      }
    }

    console.log(`[GlobalCache] Starting new request for key: ${key}`)

    // Create new request
    const requestPromise = (async () => {
      try {
        const result = await requestFn()

        // Cache the result
        this.set(key, result, ttlMs)

        console.log(`[GlobalCache] Request completed for key: ${key}`)
        return result
      } finally {
        // Always clean up pending request
        this.pendingRequests.delete(key)
      }
    })()

    // Store pending request
    this.pendingRequests.set(key, {
      promise: requestPromise,
      timestamp: Date.now()
    })

    return requestPromise
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key)
    this.pendingRequests.delete(key)
    console.log(`[GlobalCache] Invalidated key: ${key}`)
  }

  /**
   * Invalidate entries matching pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'))

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        console.log(`[GlobalCache] Invalidated pattern match: ${key}`)
      }
    }

    for (const key of this.pendingRequests.keys()) {
      if (regex.test(key)) {
        this.pendingRequests.delete(key)
        console.log(`[GlobalCache] Invalidated pending pattern match: ${key}`)
      }
    }
  }

  /**
   * Clear all cache and pending requests
   */
  clear(): void {
    this.cache.clear()
    this.pendingRequests.clear()
    console.log(`[GlobalCache] Cleared all cache`)
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      entries: Array.from(this.cache.keys()),
      pending: Array.from(this.pendingRequests.keys())
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        cleaned++
      }
    }

    // Clean up old pending requests (older than 5 minutes)
    for (const [key, pending] of this.pendingRequests.entries()) {
      if (now - pending.timestamp > 5 * 60 * 1000) {
        this.pendingRequests.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`[GlobalCache] Cleaned up ${cleaned} expired entries`)
    }
  }
}

// Global singleton instance
export const globalRequestCache = new GlobalRequestCache()

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    globalRequestCache.cleanup()
  }, 5 * 60 * 1000)
}

// Cache key generators for consistent naming
export const CacheKeys = {
  // Household keys
  households: (tenantId: string, search: string, statusFilter: string, page: number, pageSize: number) =>
    `households:${tenantId}:${search}:${statusFilter}:${page}:${pageSize}`,

  pendingHouseholds: (tenantId: string, search: string, page: number, pageSize: number) =>
    `pending_households:${tenantId}:${search}:${page}:${pageSize}`,

  householdDetails: (tenantId: string, householdId: string) =>
    `household_details:${tenantId}:${householdId}`,

  // Dashboard keys
  dashboard: (villageId: string) =>
    `dashboard:${villageId}`,

  villageStats: (type: 'total' | 'active' | 'inactive') =>
    `village_stats:${type}`,

  // Lookup keys (these should already be cached by LookupContext, but adding for completeness)
  lookupCategory: (categoryCode: string) =>
    `lookup_category:${categoryCode}`,

  lookupValues: (categoryCode: string) =>
    `lookup_values:${categoryCode}`,
} as const

export default globalRequestCache
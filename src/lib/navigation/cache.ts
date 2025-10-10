/**
 * Navigation Caching Optimization for Village Management Platform
 * Provides caching for role-based navigation configurations and permission checks
 */

import type { NavigationItem, NavigationGroup, UserRole, RoleNavigationMap } from '@/types/navigation';
import type { PermissionValidationResult, UserPermissionContext } from './permissions';

/**
 * Cache entry structure
 */
interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  ttl: number; // Time to live in milliseconds
  hits: number;
}

/**
 * Cache key generator
 */
class CacheKeyGenerator {
  static navigationConfig(role: UserRole): string {
    return `nav_config_${role}`;
  }

  static filteredItems(role: UserRole, permissions: string[]): string {
    const permissionsHash = permissions.sort().join(',');
    return `nav_filtered_${role}_${this.hashString(permissionsHash)}`;
  }

  static permissionCheck(itemId: string, context: UserPermissionContext): string {
    const contextHash = this.hashString(JSON.stringify({
      role: context.role,
      permissions: context.permissions.sort(),
      tenantId: context.tenantId
    }));
    return `perm_check_${itemId}_${contextHash}`;
  }

  static groupedItems(role: UserRole, groupId?: string): string {
    return groupId
      ? `nav_grouped_${role}_${groupId}`
      : `nav_grouped_${role}_all`;
  }

  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

/**
 * LRU Cache implementation for navigation data
 */
export class NavigationCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize: number = 100, defaultTTL: number = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  /**
   * Get item from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp.getTime() > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count and move to end (LRU)
    entry.hits++;
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data;
  }

  /**
   * Set item in cache
   */
  set(key: string, data: T, ttl?: number): void {
    // Remove expired entries
    this.cleanup();

    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: new Date(),
      ttl: ttl || this.defaultTTL,
      hits: 0
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove item from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalHits: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  } {
    const entries = Array.from(this.cache.values());
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    const timestamps = entries.map(entry => entry.timestamp);

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: totalHits > 0 ? totalHits / (totalHits + this.cache.size) : 0,
      totalHits,
      oldestEntry: timestamps.length > 0 ? new Date(Math.min(...timestamps.map(t => t.getTime()))) : null,
      newestEntry: timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => t.getTime()))) : null
    };
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp.getTime() > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Navigation cache manager
 */
export class NavigationCacheManager {
  private configCache: NavigationCache<RoleNavigationMap>;
  private itemsCache: NavigationCache<NavigationItem[]>;
  private permissionCache: NavigationCache<PermissionValidationResult>;
  private groupsCache: NavigationCache<NavigationGroup[]>;
  private isEnabled: boolean;

  constructor(options: {
    enabled?: boolean;
    maxConfigEntries?: number;
    maxItemEntries?: number;
    maxPermissionEntries?: number;
    ttl?: number;
  } = {}) {
    this.isEnabled = options.enabled ?? true;
    const ttl = options.ttl ?? 5 * 60 * 1000; // 5 minutes default

    this.configCache = new NavigationCache<RoleNavigationMap>(
      options.maxConfigEntries ?? 10,
      ttl
    );

    this.itemsCache = new NavigationCache<NavigationItem[]>(
      options.maxItemEntries ?? 50,
      ttl
    );

    this.permissionCache = new NavigationCache<PermissionValidationResult>(
      options.maxPermissionEntries ?? 200,
      ttl
    );

    this.groupsCache = new NavigationCache<NavigationGroup[]>(
      options.maxConfigEntries ?? 10,
      ttl
    );
  }

  /**
   * Cache navigation configuration
   */
  cacheNavigationConfig(role: UserRole, config: RoleNavigationMap): void {
    if (!this.isEnabled) return;

    const key = CacheKeyGenerator.navigationConfig(role);
    this.configCache.set(key, config);
  }

  /**
   * Get cached navigation configuration
   */
  getCachedNavigationConfig(role: UserRole): RoleNavigationMap | null {
    if (!this.isEnabled) return null;

    const key = CacheKeyGenerator.navigationConfig(role);
    return this.configCache.get(key);
  }

  /**
   * Cache filtered navigation items
   */
  cacheFilteredItems(
    role: UserRole,
    permissions: string[],
    items: NavigationItem[]
  ): void {
    if (!this.isEnabled) return;

    const key = CacheKeyGenerator.filteredItems(role, permissions);
    this.itemsCache.set(key, items);
  }

  /**
   * Get cached filtered navigation items
   */
  getCachedFilteredItems(
    role: UserRole,
    permissions: string[]
  ): NavigationItem[] | null {
    if (!this.isEnabled) return null;

    const key = CacheKeyGenerator.filteredItems(role, permissions);
    return this.itemsCache.get(key);
  }

  /**
   * Cache permission check result
   */
  cachePermissionCheck(
    itemId: string,
    context: UserPermissionContext,
    result: PermissionValidationResult
  ): void {
    if (!this.isEnabled) return;

    const key = CacheKeyGenerator.permissionCheck(itemId, context);
    this.permissionCache.set(key, result, 2 * 60 * 1000); // Shorter TTL for permission checks
  }

  /**
   * Get cached permission check result
   */
  getCachedPermissionCheck(
    itemId: string,
    context: UserPermissionContext
  ): PermissionValidationResult | null {
    if (!this.isEnabled) return null;

    const key = CacheKeyGenerator.permissionCheck(itemId, context);
    return this.permissionCache.get(key);
  }

  /**
   * Cache navigation groups
   */
  cacheNavigationGroups(role: UserRole, groups: NavigationGroup[]): void {
    if (!this.isEnabled) return;

    const key = CacheKeyGenerator.groupedItems(role);
    this.groupsCache.set(key, groups);
  }

  /**
   * Get cached navigation groups
   */
  getCachedNavigationGroups(role: UserRole): NavigationGroup[] | null {
    if (!this.isEnabled) return null;

    const key = CacheKeyGenerator.groupedItems(role);
    return this.groupsCache.get(key);
  }

  /**
   * Invalidate cache for a specific role
   */
  invalidateRole(role: UserRole): void {
    // Clear all entries related to this role
    const roleKeys = [
      CacheKeyGenerator.navigationConfig(role),
      CacheKeyGenerator.groupedItems(role)
    ];

    roleKeys.forEach(key => {
      this.configCache.delete(key);
      this.groupsCache.delete(key);
    });

    // Clear filtered items cache (more complex, clear all for now)
    this.itemsCache.clear();
  }

  /**
   * Invalidate cache for a specific user
   */
  invalidateUser(userId: string): void {
    // For permission checks, we'd need to track which entries belong to which user
    // For now, clear the permission cache
    this.permissionCache.clear();
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.configCache.clear();
    this.itemsCache.clear();
    this.permissionCache.clear();
    this.groupsCache.clear();
  }

  /**
   * Get comprehensive cache statistics
   */
  getStats(): {
    config: ReturnType<NavigationCache<any>['getStats']>;
    items: ReturnType<NavigationCache<any>['getStats']>;
    permissions: ReturnType<NavigationCache<any>['getStats']>;
    groups: ReturnType<NavigationCache<any>['getStats']>;
    totalMemoryUsage: number;
  } {
    return {
      config: this.configCache.getStats(),
      items: this.itemsCache.getStats(),
      permissions: this.permissionCache.getStats(),
      groups: this.groupsCache.getStats(),
      totalMemoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Enable or disable caching
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.clearAll();
    }
  }

  /**
   * Estimate memory usage (rough approximation)
   */
  private estimateMemoryUsage(): number {
    const stats = [
      this.configCache.getStats(),
      this.itemsCache.getStats(),
      this.permissionCache.getStats(),
      this.groupsCache.getStats()
    ];

    // Rough estimate: each cache entry is approximately 1KB
    return stats.reduce((total, stat) => total + stat.size * 1024, 0);
  }
}

/**
 * Cache-aware utility functions
 */
export const cacheUtils = {
  /**
   * Memoize function with cache
   */
  memoize<T extends (...args: any[]) => any>(
    fn: T,
    cache: NavigationCache<ReturnType<T>>,
    keyGenerator: (...args: Parameters<T>) => string,
    ttl?: number
  ): T {
    return ((...args: Parameters<T>): ReturnType<T> => {
      const key = keyGenerator(...args);
      const cached = cache.get(key);

      if (cached !== null) {
        return cached;
      }

      const result = fn(...args);
      cache.set(key, result, ttl);
      return result;
    }) as T;
  },

  /**
   * Create cache warmup function
   */
  createWarmupFunction(
    cacheManager: NavigationCacheManager,
    roles: UserRole[]
  ): () => Promise<void> {
    return async () => {
      // This would be implemented to pre-populate cache
      // with common navigation configurations
      console.log('Warming up navigation cache for roles:', roles);
    };
  }
};

/**
 * Global navigation cache manager instance
 */
export const navigationCacheManager = new NavigationCacheManager({
  enabled: process.env.NODE_ENV !== 'test',
  maxConfigEntries: 10,
  maxItemEntries: 100,
  maxPermissionEntries: 500,
  ttl: 5 * 60 * 1000 // 5 minutes
});
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<T> {
    return this.cacheManager.set<T>(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    // Note: reset() method is not available in cache-manager v7
    // This would need to be implemented based on the specific store
    console.warn('Cache reset not implemented for this store');
  }

  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  async invalidatePattern(pattern: string): Promise<void> {
    // Note: Pattern invalidation is not directly supported in cache-manager v7
    // This would need Redis-specific implementation
    console.warn('Pattern invalidation not implemented for this store');
  }

  async getStats(): Promise<any> {
    // Note: Stats are not available in the base cache interface
    return { message: 'Stats not available for this cache store' };
  }
} 

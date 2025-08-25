import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager_1 from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: cacheManager_1.Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.clear();
  }

  generateKey(organizationId: string, resource: string, ...params: string[]): string {
    return `org:${organizationId}:${resource}${params.length ? ':' + params.join(':') : ''}`;
  }
}
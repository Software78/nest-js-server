import { Injectable } from '@nestjs/common';
import { RedisService } from '../database/redis.service';

@Injectable()
export class CacheService {
  constructor(private readonly redisService: RedisService) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisService.get(key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    }
    return null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const stringValue =
      typeof value === 'string' ? value : JSON.stringify(value);
    await this.redisService.set(key, stringValue, ttl);
  }

  async delete(key: string): Promise<void> {
    await this.redisService.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redisService.exists(key);
    return result === 1;
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    return await this.redisService.expire(key, ttl);
  }

  async getTtl(key: string): Promise<number> {
    return await this.redisService.ttl(key);
  }

  async increment(key: string): Promise<number> {
    const client = this.redisService.getClient();
    return await client.incr(key);
  }

  async decrement(key: string): Promise<number> {
    const client = this.redisService.getClient();
    return await client.decr(key);
  }

  async setHash(key: string, field: string, value: string): Promise<void> {
    await this.redisService.hSet(key, field, value);
  }

  async getHash(key: string, field: string): Promise<string | null> {
    return await this.redisService.hGet(key, field);
  }

  async getAllHash(key: string): Promise<Record<string, string>> {
    return await this.redisService.hGetAll(key);
  }

  async deleteHash(key: string, field: string): Promise<void> {
    await this.redisService.hDel(key, field);
  }

  async pushToList(key: string, value: string): Promise<number> {
    return await this.redisService.lPush(key, value);
  }

  async popFromList(key: string): Promise<string | null> {
    return await this.redisService.lPop(key);
  }

  async getListRange(
    key: string,
    start: number,
    stop: number,
  ): Promise<string[]> {
    return await this.redisService.lRange(key, start, stop);
  }

  async addToSet(key: string, member: string): Promise<void> {
    await this.redisService.sAdd(key, member);
  }

  async removeFromSet(key: string, member: string): Promise<void> {
    await this.redisService.sRem(key, member);
  }

  async getSetMembers(key: string): Promise<string[]> {
    return await this.redisService.sMembers(key);
  }

  async isSetMember(key: string, member: string): Promise<boolean> {
    return await this.redisService.sIsMember(key, member);
  }

  async clearCache(): Promise<void> {
    const client = this.redisService.getClient();
    await client.flushDb();
  }

  async getCacheStats(): Promise<{ keys: number; memory: string }> {
    const client = this.redisService.getClient();
    const info = await client.info('memory');
    const keys = await client.dbSize();

    // Parse memory info
    const memoryMatch = info.match(/used_memory_human:(\S+)/);
    const memory = memoryMatch ? memoryMatch[1] : 'Unknown';

    return { keys, memory };
  }
}

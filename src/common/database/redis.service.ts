import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: RedisClientType;

  constructor(private configService: ConfigService) {
    this.redisClient = createClient({
      url: this.configService.get<string>(
        'REDIS_URI',
        'redis://localhost:6379',
      ),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      database: this.configService.get<number>('REDIS_DB', 0),
    });

    this.redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });
  }

  async onModuleInit() {
    if (process.env.SKIP_REDIS !== 'true') {
      await this.redisClient.connect();
    }
  }

  async onModuleDestroy() {
    if (this.redisClient && this.redisClient.isOpen) {
      await this.redisClient.quit();
    }
  }

  getClient(): RedisClientType {
    return this.redisClient;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redisClient.setEx(key, ttl, value);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async del(key: string): Promise<number> {
    return await this.redisClient.del(key);
  }

  async exists(key: string): Promise<number> {
    return await this.redisClient.exists(key);
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    return await this.redisClient.expire(key, ttl);
  }

  async ttl(key: string): Promise<number> {
    return await this.redisClient.ttl(key);
  }

  async hSet(key: string, field: string, value: string): Promise<number> {
    return await this.redisClient.hSet(key, field, value);
  }

  async hGet(key: string, field: string): Promise<string | null> {
    const result = await this.redisClient.hGet(key, field);
    return result || null;
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    return await this.redisClient.hGetAll(key);
  }

  async hDel(key: string, field: string): Promise<number> {
    return await this.redisClient.hDel(key, field);
  }

  async lPush(key: string, value: string): Promise<number> {
    return await this.redisClient.lPush(key, value);
  }

  async rPush(key: string, value: string): Promise<number> {
    return await this.redisClient.rPush(key, value);
  }

  async lPop(key: string): Promise<string | null> {
    return await this.redisClient.lPop(key);
  }

  async rPop(key: string): Promise<string | null> {
    return await this.redisClient.rPop(key);
  }

  async lRange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.redisClient.lRange(key, start, stop);
  }

  async sAdd(key: string, member: string): Promise<number> {
    return await this.redisClient.sAdd(key, member);
  }

  async sRem(key: string, member: string): Promise<number> {
    return await this.redisClient.sRem(key, member);
  }

  async sMembers(key: string): Promise<string[]> {
    return await this.redisClient.sMembers(key);
  }

  async sIsMember(key: string, member: string): Promise<boolean> {
    return await this.redisClient.sIsMember(key, member);
  }
}

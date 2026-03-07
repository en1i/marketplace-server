import { Injectable } from "@nestjs/common";
import {
  type CacheModuleOptions,
  type CacheOptionsFactory,
} from "@nestjs/cache-manager";
import KeyvRedis from "@keyv/redis";
import { KeyvCacheableMemory } from "cacheable";
import { Keyv } from "keyv";

const MEMORY_CACHE_TTL_MS = 60000;
const MEMORY_CACHE_LRU_SIZE = 5000;
const DEFAULT_REDIS_URL = "redis://redis:6379";

@Injectable()
export class CacheService implements CacheOptionsFactory {
  createCacheOptions(): CacheModuleOptions {
    return {
      stores: [
        new Keyv({
          store: new KeyvCacheableMemory({
            ttl: MEMORY_CACHE_TTL_MS,
            lruSize: MEMORY_CACHE_LRU_SIZE,
          }),
        }),
        new KeyvRedis(process.env.REDIS_DB_URL ?? DEFAULT_REDIS_URL),
      ],
    };
  }
}

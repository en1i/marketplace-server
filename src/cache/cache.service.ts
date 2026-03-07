import { Injectable } from "@nestjs/common";
import {
  type CacheModuleOptions,
  type CacheOptionsFactory,
} from "@nestjs/cache-manager";
import KeyvRedis from "@keyv/redis";
import { KeyvCacheableMemory } from "cacheable";
import { Keyv } from "keyv";

@Injectable()
export class CacheService implements CacheOptionsFactory {
  createCacheOptions(): CacheModuleOptions {
    return {
      stores: [
        new Keyv({
          store: new KeyvCacheableMemory({ ttl: 60000, lruSize: 5000 }),
        }),
        new KeyvRedis(process.env.REDIS_DB_URL ?? "redis://redis:6379"),
      ],
    };
  }
}

# Redis Cache Setup

Two-tier caching using `@nestjs/cache-manager` with an in-memory L1 store and Redis L2 store.

## Packages

```bash
yarn add @nestjs/cache-manager @keyv/redis cacheable keyv
```

| Package | Role |
|---|---|
| `@nestjs/cache-manager` | NestJS cache module wrapper |
| `keyv` | Unified key-value storage interface |
| `cacheable` | In-memory store (`KeyvCacheableMemory`) + `Keyv` helpers |
| `@keyv/redis` | Redis adapter for Keyv |

## Configuration

Keep the cache wiring isolated in its own module so `AppModule` only imports it.

```ts
// src/cache/cache.service.ts
import {
  type CacheModuleOptions,
  type CacheOptionsFactory,
} from "@nestjs/cache-manager";
import { Injectable } from "@nestjs/common";
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
```

```ts
// src/cache/cache.module.ts
import { CacheModule as NestCacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { CacheService } from "./cache.service";

@Module({
  imports: [
    NestCacheModule.registerAsync({
      useClass: CacheService,
    }),
  ],
  providers: [CacheService],
  exports: [NestCacheModule],
})
export class CacheModule {}
```

```ts
// src/app.module.ts
import { CacheModule } from "./cache/cache.module";

@Module({
  imports: [DatabaseModule, CacheModule],
})
```

Reads hit the in-memory store first; on a miss, fall through to Redis.

## Issues & Fixes

### 1. `useFactory` marked `async` with no `await`

**Rule:** `@typescript-eslint/require-await`

The factory was declared `async` but returned a plain object — no async operations. Fix: remove `async`.

```ts
// before
useFactory: async () => { ... }

// after
useFactory: () => { ... }
```

### 2. `CacheableMemory` is not a `KeyvStoreAdapter`

**Rules:** `@typescript-eslint/no-unsafe-assignment`, `@typescript-eslint/no-unsafe-call`

`CacheableMemory` is a plain in-memory cache class. It does **not** implement `KeyvStoreAdapter`, so it cannot be passed as the `store` option to `Keyv`. The correct class is `KeyvCacheableMemory`, which wraps `CacheableMemory` and implements `KeyvStoreAdapter`.

```ts
// before — wrong class
import { CacheableMemory } from "cacheable";
new Keyv({ store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }) })

// after — correct class
import { KeyvCacheableMemory } from "cacheable";
new Keyv({ store: new KeyvCacheableMemory({ ttl: 60000, lruSize: 5000 }) })
```

### 3. IDE ESLint showed stale errors after fix

After correcting the import, the VS Code ESLint extension continued reporting the same errors on the (now correct) line. The errors disappeared after restarting the ESLint server (**ESLint: Restart ESLint Server** from the command palette). The CLI (`npx eslint src/app.module.ts`) was clean throughout.

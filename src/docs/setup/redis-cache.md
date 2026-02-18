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

## Configuration (`app.module.ts`)

```ts
import { CacheModule } from "@nestjs/cache-manager";
import { KeyvCacheableMemory } from "cacheable";
import KeyvRedis from "@keyv/redis";
import { Keyv } from "keyv";

CacheModule.registerAsync({
  useFactory: () => ({
    stores: [
      new Keyv({ store: new KeyvCacheableMemory({ ttl: 60000, lruSize: 5000 }) }),
      new KeyvRedis("redis://localhost:6379"),
    ],
  }),
}),
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

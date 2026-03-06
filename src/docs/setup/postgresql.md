# PostgreSQL + Prisma Setup

This document summarizes how PostgreSQL was integrated in this project, why Prisma was selected, and why build hooks were added.

## What Was Added

- PostgreSQL service in Compose:
  - Production compose: [`compose.yml`](../../../compose.yml)
  - Development compose: [`compose.dev.yml`](../../../compose.dev.yml)
- Prisma setup under `src/prisma/`:
  - [`schema.prisma`](../../../src/prisma/schema.prisma)
  - [`prisma.service.ts`](../../../src/prisma/prisma.service.ts)
  - [`prisma.module.ts`](../../../src/prisma/prisma.module.ts)
- `PrismaModule` imported in app root module:
  - [`app.module.ts`](../../../src/app.module.ts)

## Packages

```bash
yarn add prisma @prisma/client @prisma/adapter-pg
```

| Package | Role |
|---|---|
| `prisma` | CLI for schema, generate, and migrations |
| `@prisma/client` | Prisma runtime dependency |
| `@prisma/adapter-pg` | PostgreSQL driver adapter for Prisma |

## Runtime Configuration

Prisma service uses PostgreSQL connection from `DATABASE_URL`:

```ts
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
```

Main environment variables used:

- `DATABASE_URL`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`

## Why Prisma ORM

Prisma was chosen for:

- Strong TypeScript support and typed query API
- Predictable schema-based workflow
- Good fit with NestJS service/module DI structure
- Clear separation between schema, generated client, and runtime service

## Why Build Hooks Are Needed

This project currently imports Prisma client from local generated output:

```ts
import { PrismaClient } from "./generated/client";
```

Generated files are not a source-of-truth implementation and may be missing in a clean checkout/container unless generation runs first.

To avoid failures in those cases, generation is automated with hooks in [`package.json`](../../../package.json):

- `prebuild` -> run `prisma generate` before `yarn build`
- `prestart:dev` -> run `prisma generate` before `yarn start:dev`
- `pretest:e2e` -> run `prisma generate` before `yarn test:e2e`

Container build uses the same `prebuild` hook in the Docker `build` stage, where a non-production fallback `DATABASE_URL` is set only for generation/compilation.

This guarantees Prisma client exists before TypeScript compilation in local/dev/CI/container flows.

## Related Files

- Prisma config: [`prisma.config.ts`](../../../prisma.config.ts)
- Deployment notes: [`deployment.md`](./deployment.md)

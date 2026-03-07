# PostgreSQL + Drizzle Setup

This document summarizes how PostgreSQL is integrated in this project using Drizzle ORM and the `pg` driver.

## What Was Added

- PostgreSQL service in Compose:
  - Production compose: [`compose.yml`](../../../compose.yml)
  - Development compose: [`compose.dev.yml`](../../../compose.dev.yml)
- Drizzle runtime setup under `src/db/`:
  - [`db.service.ts`](../../../src/db/db.service.ts)
  - [`db.module.ts`](../../../src/db/db.module.ts)
  - [`schema.ts`](../../../src/db/schema.ts)
- Drizzle Kit config at repo root:
  - [`drizzle.config.ts`](../../../drizzle.config.ts)
- `DatabaseModule` imported in app root module:
  - [`app.module.ts`](../../../src/app.module.ts)

## Packages

```bash
yarn add drizzle-orm pg
yarn add -D drizzle-kit @types/pg
```

| Package | Role |
|---|---|
| `drizzle-orm` | Runtime ORM and type-safe query builder |
| `pg` | PostgreSQL driver and connection pool |
| `drizzle-kit` | Schema diffing and SQL migration tooling |
| `@types/pg` | TypeScript types for the PostgreSQL driver |

## Runtime Configuration

Database service uses PostgreSQL connection from `DATABASE_URL` and wraps a shared `pg` pool with Drizzle:

```ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle({ client: pool, schema });
```

Main environment variables used:

- `DATABASE_URL`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`

## Why Drizzle ORM

Drizzle was selected for:

- Strong TypeScript support without runtime client generation
- Explicit PostgreSQL driver usage through `pg`
- Simpler build/lint/test flows in clean checkouts and CI
- Good fit for an early-stage NestJS service where schema and query patterns are still evolving

## Migration Workflow

This project uses Drizzle Kit for schema-driven SQL migrations via scripts in [`package.json`](../../../package.json):

- `db:generate` -> generate SQL migrations from `src/db/schema.ts`
- `db:migrate` -> apply pending migrations using `drizzle.config.ts`

Because Drizzle does not require a generated runtime client, app build and startup flows do not need ORM-specific prebuild hooks.

## Related Files

- Drizzle config: [`drizzle.config.ts`](../../../drizzle.config.ts)
- Deployment notes: [`deployment.md`](./deployment.md)

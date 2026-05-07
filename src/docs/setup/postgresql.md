# PostgreSQL + Drizzle Setup

This document summarizes how PostgreSQL is integrated in this project using Drizzle ORM and the `pg` driver.

## What Was Added

- PostgreSQL integration through `DATABASE_URL`
- PostgreSQL is expected to be provided externally in all environments through `DATABASE_URL`:
  - Development: a locally installed PostgreSQL instance on the host machine
  - Production: PostgreSQL installed directly on the Hostinger VPS
- Drizzle runtime setup under `src/db/`:
  - [`db.service.ts`](../../../src/db/db.service.ts)
  - [`db.module.ts`](../../../src/db/db.module.ts)
  - [`schema.ts`](../../../src/db/schema.ts)
- Drizzle Kit config at repo root:
  - [`drizzle.config.ts`](../../../drizzle.config.ts)
- `DatabaseModule` imported in app root module:
  - [`app.module.ts`](../../../src/app.module.ts)

## Local Development Setup

PostgreSQL is installed directly on the host machine (not containerized). The app container reaches it via `host.docker.internal`.

**Linux (snap):**

```bash
sudo snap install postgresql --channel=16/stable
```

**macOS (Homebrew):**

```bash
brew install postgresql@16 && brew services start postgresql@16
```

### One-time configuration (snap)

```bash
# Set password for the postgres user
sudo snap run --shell postgresql.postgresql -c "psql -U postgres -c \"ALTER USER postgres WITH PASSWORD 'postgres_password';\""

# Create the database
sudo snap run --shell postgresql.postgresql -c "psql -U postgres -c \"CREATE DATABASE marketplace;\""

# Apply migrations
yarn db:migrate
```

### Allow Docker containers to connect

By default PostgreSQL only listens on `127.0.0.1`, which is not reachable from Docker containers. Two config changes are needed (snap config path: `/var/snap/postgresql/common/etc/postgresql/16/main/`):

**`postgresql.conf`** — enable listening on all interfaces:
```
listen_addresses = '*'
```

**`pg_hba.conf`** — allow password auth from the Docker bridge network:
```
host    all    all    172.17.0.0/16    scram-sha-256
```

Then restart the service:
```bash
sudo snap restart postgresql
```

`DATABASE_URL` in `.env.dev` uses `host.docker.internal` as the host so it works both inside the app container (resolved via `extra_hosts: host-gateway`) and directly on the host (add `127.0.0.1 host.docker.internal` to `/etc/hosts` if running outside Docker).

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

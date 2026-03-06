# Deployment Setup

This document explains the current container/deployment setup, why it was introduced, and how a new developer can deploy and run the app.

## Why This Setup Exists

The project now uses a multi-stage Docker and split compose setup to achieve:

- Consistent environments across local/dev/prod workflows
- Smaller production images (build tooling excluded from runtime image)
- Safer runtime defaults (`NODE_ENV=production`, non-root runtime user)
- Faster local development in container (bind mount + watch mode + Redis service)

## What Changed

### Dockerfile (multi-stage)

- `base`: Node + Corepack/Yarn bootstrap
- `deps`: installs full dependencies as the `node` user so dev-time Prisma generation can write inside `node_modules`
- `dev`: developer image (`yarn start:dev`, git + ssh client available)
- `build`: compiles NestJS into `dist/`
- `production-deps`: production-only dependencies
- `runner`: final production runtime image

### Compose split

- Root [`compose.yml`](../../../compose.yml): production-oriented run (`runner` target)
- Root [`compose.dev.yml`](../../../compose.dev.yml): development-oriented run (`dev` target using `.env.dev`)
- [`.devcontainer/docker-compose.yml`](../../../.devcontainer/docker-compose.yml): development overrides for Dev Containers

### Runtime/cache configuration

- Redis URL is configured via `REDIS_DB_URL` environment variable
- PostgreSQL URL is configured via `DATABASE_URL` environment variable
- Cache uses in-memory L1 + Redis L2
- Prisma client generation is automated in execution hooks (`prebuild`, `prestart:dev`, `pretest:e2e`) to avoid clean-build/runtime failures when local generated files are absent

## Deploy The App (Onboarding Steps)

### 1. Prerequisites

- Docker Engine installed
- Docker Compose v2 available (`docker compose version`)

### 2. Clone and enter repository

```bash
git clone <repo-url>
cd marketplace-server
```

### 3. Create deployment env file

Create an env file outside Git (for example `/opt/marketplace/.env.prod`) and provide:

```env
PORT=<APP_PORT>
REDIS_DB_URL=<REDIS_URL>
DATABASE_URL=<POSTGRES_CONNECTION_URL>
POSTGRES_PASSWORD=<password>
```

Optional overrides:

- `NODE_ENV` (defaults to `production`)
- `POSTGRES_USER`
- `POSTGRES_DB`

### 4. Start production stack

```bash
docker compose --env-file /opt/marketplace/.env.prod -f compose.yml up -d --build
```

This starts:

- `marketplace-server` using `PORT`
- `postgres` using `POSTGRES_*` variables (internal compose network)
- `redis` using `REDIS_DB_URL`

### 5. Verify deployment

```bash
docker compose --env-file /opt/marketplace/.env.prod -f compose.yml ps
docker compose --env-file /opt/marketplace/.env.prod -f compose.yml logs -f marketplace-server
curl -i "http://localhost:<APP_PORT>/"
```

### 6. Stop stack

```bash
docker compose --env-file /opt/marketplace/.env.prod -f compose.yml down
```

## Update/Redeploy

After pulling latest changes:

```bash
git pull
docker compose --env-file /opt/marketplace/.env.prod -f compose.yml up -d --build
```

## Dev Container Note

For local development in VS Code Dev Containers, the project uses:

- [`compose.dev.yml`](../../../compose.dev.yml)
- [`.devcontainer/devcontainer.json`](../../../.devcontainer/devcontainer.json)
- [`.devcontainer/docker-compose.yml`](../../../.devcontainer/docker-compose.yml)

`compose.dev.yml` loads environment values from a local `.env.dev` file. Ensure `.env.dev` exists before opening the Dev Container and includes:

- `NODE_ENV`
- `PORT`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `DATABASE_URL`
- `REDIS_DB_URL`

`NODE_ENV` remains in `.env.dev` as the developer-edited runtime value for the app, even though the Docker `dev` stage also sets `NODE_ENV=development` as an image default.

`PORT` is used by the Nest app and by `compose.dev.yml` host publishing for `marketplace-server`. When running Compose manually and you want the published host port to follow `.env.dev`, use `docker compose --env-file .env.dev -f compose.dev.yml ...` so Compose variable interpolation sees the same `PORT` value.

This path is for development only and should not replace production deployment commands above.

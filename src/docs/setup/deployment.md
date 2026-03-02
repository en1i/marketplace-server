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
- `deps`: installs full dependencies
- `dev`: developer image (`yarn start:dev`, git + ssh client available)
- `build`: compiles NestJS into `dist/`
- `production-deps`: production-only dependencies
- `runner`: final production runtime image

### Compose split

- Root [`compose.yml`](../../../compose.yml): production-oriented run (`runner` target)
- [`.devcontainer/docker-compose.yml`](../../../.devcontainer/docker-compose.yml): development overrides for Dev Containers

### Runtime/cache configuration

- Redis URL is configured via `REDIS_URL` environment variable (with default fallback)
- Cache uses in-memory L1 + Redis L2

## Deploy The App (Onboarding Steps)

### 1. Prerequisites

- Docker Engine installed
- Docker Compose v2 available (`docker compose version`)

### 2. Clone and enter repository

```bash
git clone <repo-url>
cd marketplace-server
```

### 3. Start production stack

```bash
docker compose -f compose.yml up -d --build
```

This starts:

- `marketplace-server` on port `3001`
- `redis` on port `6379` (internal app connection uses `redis://redis:6379`)

### 4. Verify deployment

```bash
docker compose -f compose.yml ps
docker compose -f compose.yml logs -f marketplace-server
curl -i http://localhost:3001/
```

### 5. Stop stack

```bash
docker compose -f compose.yml down
```

## Update/Redeploy

After pulling latest changes:

```bash
git pull
docker compose -f compose.yml up -d --build
```

## Dev Container Note

For local development in VS Code Dev Containers, the project uses:

- [`.devcontainer/devcontainer.json`](../../../.devcontainer/devcontainer.json)
- [`.devcontainer/docker-compose.yml`](../../../.devcontainer/docker-compose.yml)

This path is for development only and should not replace production deployment commands above.

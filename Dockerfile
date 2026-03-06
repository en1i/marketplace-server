FROM node:22-slim AS base
WORKDIR /usr/src/app
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

FROM base AS deps
COPY --chown=node:node package.json yarn.lock ./
RUN chown node:node /usr/src/app
USER node
RUN yarn install --frozen-lockfile

FROM deps AS dev
USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends git openssh-client \
  && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=development
EXPOSE 3001
USER node
CMD ["yarn", "start:dev"]

FROM deps AS build
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY prisma.config.ts ./
COPY src ./src
# Prisma client generation runs during `yarn build` (prebuild hook) and needs a build-time DATABASE_URL;
# this placeholder is only for compile/generate and is not used as runtime database configuration.
ARG DATABASE_URL="postgresql://localhost:5432/postgres?schema=public"
RUN DATABASE_URL=${DATABASE_URL} yarn build

FROM base AS production-deps
ENV NODE_ENV=production
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true && yarn cache clean

FROM base AS runner
ENV NODE_ENV=production
COPY --from=production-deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY package.json ./
USER node
EXPOSE 3001
CMD ["node", "dist/main"]

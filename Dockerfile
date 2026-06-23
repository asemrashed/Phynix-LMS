# syntax=docker/dockerfile:1

FROM oven/bun:1.3.9 AS base

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps

ARG APP_DIR=.
ARG TYPES_DIR=_backend-types/packages/types

ENV NODE_ENV=development
ENV FXPRIME_BACKEND_PATH=/backend

COPY ${TYPES_DIR}/package.json ${TYPES_DIR}/bun.lock ${TYPES_DIR}/tsconfig.json /backend/packages/types/
COPY ${TYPES_DIR}/src /backend/packages/types/src
COPY ${APP_DIR}/package.json ${APP_DIR}/bun.lock ./
COPY ${APP_DIR}/scripts ./scripts

RUN bun install --cwd /backend/packages/types && bun install

FROM deps AS builder

ARG APP_DIR=.
ARG NEXT_PUBLIC_API_URL=/api/v1
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG API_INTERNAL_URL=http://127.0.0.1:4000
ARG NEXT_PUBLIC_WS_URL=http://127.0.0.1:4000

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
ENV API_INTERNAL_URL=${API_INTERNAL_URL}

COPY ${APP_DIR}/app ./app
COPY ${APP_DIR}/components ./components
COPY ${APP_DIR}/hooks ./hooks
COPY ${APP_DIR}/lib ./lib
COPY ${APP_DIR}/public ./public
COPY ${APP_DIR}/stores ./stores
COPY ${APP_DIR}/styles ./styles
COPY ${APP_DIR}/components.json ./components.json
COPY ${APP_DIR}/next-env.d.ts ./next-env.d.ts
COPY ${APP_DIR}/next.config.mjs ./next.config.mjs
COPY ${APP_DIR}/postcss.config.mjs ./postcss.config.mjs
COPY ${APP_DIR}/proxy.ts ./proxy.ts
COPY ${APP_DIR}/tsconfig.json ./tsconfig.json

RUN bun run build

FROM base AS runtime

ARG API_INTERNAL_URL=http://127.0.0.1:4000

ENV NODE_ENV=production
ENV PORT=3005
ENV HOSTNAME=0.0.0.0
ENV API_INTERNAL_URL=${API_INTERNAL_URL}

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 3005

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PORT}" >/dev/null || exit 1

CMD ["bun", "run", "start"]

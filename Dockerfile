# syntax=docker/dockerfile:1

# -------------------------------------------------------------
# Stage 1: Base Alpine Image with Node.js
# -------------------------------------------------------------
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# -------------------------------------------------------------
# Stage 2: Dependencies
# -------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# -------------------------------------------------------------
# Stage 3: Builder
# -------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set dummy environment values required during static build time (no secrets)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# -------------------------------------------------------------
# Stage 4: Production Runner (Least Privilege)
# -------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root system user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and standalone server
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Container Healthcheck Strategy (checks internal lightweight health endpoint)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]

# =============================================================================
# Convio Backend — Dockerfile for Railway deployment
# =============================================================================
# Multi-stage build: install → build → production runtime
#
# Railway will use this file automatically when present in the repo root.
# Make sure all required env vars are set in your Railway project dashboard.
# =============================================================================

# ── Stage 1: Install dependencies ──────────────────────────────────────────
FROM node:22-slim AS installer
RUN corepack enable && corepack install -g pnpm@11.17.0

WORKDIR /app

# Copy root manifests
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./

# Copy all workspace packages (needed for dependency resolution)
COPY apps/api/package.json apps/api/
COPY packages/database/package.json packages/database/
COPY packages/config/package.json packages/config/
COPY packages/types/package.json packages/types/
COPY packages/ai/package.json packages/ai/
COPY packages/validation/package.json packages/validation/
COPY packages/utils/package.json packages/utils/
COPY packages/ui/package.json packages/ui/
COPY packages/sdk/package.json packages/sdk/

# Copy Prisma config
COPY prisma.config.ts ./
COPY packages/database/prisma/ packages/database/prisma/

# Install (frozen lockfile ensures reproducible builds)
RUN pnpm install --frozen-lockfile

# ── Stage 2: Build ─────────────────────────────────────────────────────────
FROM installer AS builder
WORKDIR /app

# Copy all source code
COPY apps/api/tsup.config.ts apps/api/tsconfig.json apps/api/
COPY apps/api/src/ apps/api/src/
COPY packages/database/src/ packages/database/src/
COPY packages/config/src/ packages/config/src/
COPY packages/types/src/ packages/types/src/
COPY packages/ai/src/ packages/ai/src/
COPY packages/validation/src/ packages/validation/src/
COPY packages/utils/src/ packages/utils/src/
COPY packages/ui/src/ packages/ui/src/
COPY packages/sdk/src/ packages/sdk/src/

# Generate Prisma client & build API
RUN pnpm exec prisma generate
RUN pnpm --filter @convio/api build

# ── Stage 3: Production runtime ────────────────────────────────────────────
FROM node:22-slim AS runner
RUN corepack enable && corepack install -g pnpm@11.17.0 && apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy manifests for pnpm install
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy workspace packages (needed for pnpm link resolution)
COPY apps/api/package.json apps/api/
COPY packages/database/ packages/database/
COPY packages/config/ packages/config/
COPY packages/types/ packages/types/
COPY packages/ai/ packages/ai/
COPY packages/validation/ packages/validation/
COPY packages/utils/ packages/utils/
COPY packages/ui/ packages/ui/
COPY packages/sdk/ packages/sdk/

# Copy Prisma config
COPY prisma.config.ts ./

# Install all dependencies (frozen lockfile ensures reproducibility)
RUN pnpm install --frozen-lockfile

# Copy built artifacts from builder (overwrites workspace source with built output)
COPY --from=builder /app/packages/database/src/generated/ ./packages/database/src/generated/
COPY --from=builder /app/apps/api/dist/ ./apps/api/dist/

# Expose API port
EXPOSE 3000

# Run database migrations (best-effort), then start the server
CMD ["sh", "-c", "pnpm exec prisma migrate deploy 2>/dev/null; node apps/api/dist/server.cjs"]

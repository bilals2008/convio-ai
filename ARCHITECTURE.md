# Architecture

## Overview

Convio is an AI Chatbot & Agent Management Platform built as a pnpm + Turborepo monorepo with two apps (`apps/web` React frontend, `apps/api` Fastify backend) and shared packages.

## Principles

1. **Agent over Bot** — Agents are AI brains; deployments/widgets are user-facing interfaces
2. **Semantic Tokens** — No hardcoded colors, always use design tokens (see `docs/THEME.md`)
3. **shadcn First** — Use existing components before custom UI
4. **Shared Validation** — Zod schemas shared between frontend and backend (`packages/validation`)
5. **Provider Abstraction** — AI providers implement a common interface (`packages/ai`)
6. **BYOK** — Users can bring their own API keys per provider, stored org-scoped and encrypted at rest

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + TypeScript + Tailwind + shadcn/ui (Base UI) |
| Backend | Fastify + TypeScript |
| Auth | Supabase Auth (Bearer JWT, verified via `supabase.auth.getUser`) |
| Database | PostgreSQL + Prisma, pgvector for document embeddings |
| Realtime | Server-Sent Events (SSE) for streaming chat |
| AI | Provider-agnostic `packages/ai` (generate / stream / embed) |
| Monorepo | Turborepo + pnpm |

## Key Decisions

### Provider Abstraction

All AI providers implement the same interface in `packages/ai`:

```typescript
interface AIProvider {
  generate(params): Promise<Result>
  stream(params): AsyncIterable<Chunk>
  embed(text): Promise<number[]>
  moderate(text): Promise<Result>
  listModels(): Promise<Model[]>
}
```

Providers include OpenAI, Anthropic, Google, Groq, OpenRouter, DeepSeek, a local gateway (`LOCAL_API_URL`), and OpenCode Zen (free fallback). Keys are resolved per-org via `ProviderKey` and encrypted with AES-256-GCM at rest.

### Adapter-based Channels

Each channel is a service in `apps/api/src/services/` (`whatsapp/`, `telegram.ts`, `discord.ts`, `slack.ts`, `twilio.ts`) that normalizes inbound updates and routes them through a shared chat pipeline.

### RAG Pipeline

Documents are chunked (1000 chars, 40-word overlap), embedded (OpenAI or local `all-MiniLM-L6-v2`), stored as pgvector in `DocumentChunk`, retrieved by cosine distance, and optionally reranked.

### Auth & Multi-tenancy

- Frontend signs in via `@supabase/supabase-js` and sends the access token as a Bearer header.
- API verifies the token (`plugins/auth.ts`) and decorates the request with `userId`/`user`.
- `plugins/membership.ts` provides `requireMembership`, `requireAdmin`, `requireOwner`, and per-entity `getMembership`/`ensureAdmin` guards.
- Profiles are synced from `auth.users` → `public.profiles` via a DB trigger.

### Widget

The public widget loads config + creates conversations via `publicKey`-based endpoints, streams responses over SSE, and enforces allowed domains server-side.

## Documentation

- [Structure](./docs/STRUCTURE.md)
- [Theme](./docs/THEME.md)
- [Database Schema](./docs/DATABASE-SCHEMA.md)
- [API Design](./docs/API-DESIGN.md)
- [Auth Flow](./docs/AUTH.md)
- [Backend Modules](./docs/BACKEND-MODULES.md)
- [Frontend Structure](./docs/FRONTEND-STRUCTURE.md)
- [AI Integration](./docs/AI-INTEGRATION.md)
- [Multi-channel](./docs/MULTI-CHANNEL.md)
- [Real-time Chat](./docs/REALTIME-CHAT.md)

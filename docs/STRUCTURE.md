# Convio — Project Structure

## Overview
Convio is an AI Chatbot & Agent Management Platform.
Single React app (no separate landing/auth/dashboard apps).

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React + Vite + TypeScript + Tailwind |
| UI | shadcn/ui |
| Backend | Fastify (TypeScript) |
| Auth | Better Auth (self-hosted, free) |
| Database | Supabase PostgreSQL |
| Realtime | Supabase Realtime |
| Vector/RAG | Supabase pgvector |
| AI | Vercel AI SDK |
| Monorepo | Turborepo + pnpm |
| Schemas | Zod |

## Folder Structure

```
convio/
├── apps/
│   ├── web/                    ← React + Vite
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── App.tsx
│   │   └── index.html
│   │
│   └── api/                    ← Fastify
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── users/
│       │   │   ├── organizations/
│       │   │   ├── chatbots/
│       │   │   ├── agents/
│       │   │   ├── conversations/
│       │   │   ├── messages/
│       │   │   ├── knowledge/
│       │   │   ├── analytics/
│       │   │   ├── integrations/
│       │   │   └── billing/
│       │   ├── common/
│       │   ├── plugins/
│       │   ├── config/
│       │   └── server.ts
│       └── package.json
│
├── packages/
│   ├── ui/                     ← shadcn components
│   ├── auth/                   ← Better Auth config
│   ├── db/                     ← Prisma schema + client
│   ├── ai/                     ← AI/LLM logic
│   ├── schemas/                ← Zod schemas (shared)
│   ├── constants/              ← Roles, permissions, routes
│   ├── utils/                  ← Helper functions
│   └── config/                 ← Shared configs (tsconfig, etc.)
│
├── docs/
│   ├── adr/                    ← Architecture Decision Records
│   └── api/                    ← API documentation
│
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

## Key Decisions

1. Single app — no separate landing/auth/dashboard apps
2. No types/ package — types inferred from Prisma, Zod, Better Auth
3. No hooks/ package — only when genuinely reusable hooks exist
4. Modular API — modules/ not flat routes/services
5. SEO not required — React SPA is sufficient

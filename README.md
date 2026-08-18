# Convio

AI Chatbot & Agent Management Platform — multi-tenant, multi-channel AI agents with RAG knowledge bases, BYOK AI providers, embeddable web widget, and real-time streaming chat.

## Features

- **AI Agents** — Configure AI brains with custom prompts, tools, tool configs, and knowledge bases
- **Multi-channel Deployment** — Deploy agents to Web widget, WhatsApp, Telegram, Discord, Slack
- **Knowledge Base (RAG)** — Upload documents and URLs; chunking, embeddings, and reranking
- **Real-time Chat** — Streaming AI responses (SSE) in the dashboard and web widget
- **Embeddable Widget** — Paste one `<script>` tag; customizable theme, quick replies, domain allow-listing
- **Analytics** — Conversations, messages, success rate, response time, token usage
- **Multi-tenant Organizations** — Team collaboration with role-based access (owner/admin/member/viewer)
- **Custom Tools** — Extend AI capabilities with web search, calculators, HTTP tools, and more
- **Admin Panel** — Platform-wide management: users, orgs, tickets, billing, audit log

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + TypeScript + Tailwind + shadcn/ui (Base UI) |
| Backend | Fastify + TypeScript |
| Auth | Supabase Auth (JWT verified server-side) |
| Database | PostgreSQL + Prisma (pgvector for embeddings) |
| Streaming | Server-Sent Events (SSE) |
| AI | Provider-agnostic `packages/ai` (OpenAI, Anthropic, Google, Groq, OpenRouter, local gateway, BYOK) |
| Embeddings | OpenAI or local `@huggingface/transformers` + `all-MiniLM-L6-v2` |
| Validation | Zod (routes) + Typebox (env config) |
| Monorepo | Turborepo + pnpm workspaces |

## Getting Started

```bash
pnpm install
pnpm dev          # runs api + web
pnpm build        # build all packages
```

Copy `.env.example` to `.env` (API) and set the `VITE_*` vars in `apps/web/.env`.

## Project Structure

```
convio/
├── apps/
│   ├── web/          ← React frontend (dashboard, admin, widget, docs)
│   └── api/          ← Fastify backend
│
├── packages/
│   ├── ai/           ← AI provider abstraction (generate/stream/embed)
│   ├── config/       ← Shared plan/limits config
│   ├── database/     ← Prisma schema + client
│   ├── types/        ← Shared types & RBAC permissions
│   ├── ui/           ← shadcn components
│   ├── utils/        ← Helper functions
│   ├── validation/   ← Shared Zod schemas
│   └── sdk/          ← Client SDK (placeholder)
│
└── docs/             ← Project documentation
```

## Documentation

- [Architecture](./ARCHITECTURE.md)
- [Database Schema](./docs/DATABASE-SCHEMA.md)
- [API Design](./docs/API-DESIGN.md)
- [Backend Modules](./docs/BACKEND-MODULES.md)
- [Auth Flow](./docs/AUTH.md)
- [Theme](./docs/THEME.md)
- [shadcn Patterns](./docs/SHADCN-PATTERNS.md)

## License

MIT

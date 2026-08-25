# Convio

AI Chatbot & Agent Management Platform — multi-tenant, multi-channel AI agents with RAG knowledge bases, BYOK AI providers, embeddable web widget, and real-time streaming chat.

![Convio Dashboard](https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/hero.avif)

## Features

- **AI Agents** — Configure AI brains with custom prompts, tools, tool configs, and knowledge bases
- **Multi-channel Deployment** — Deploy agents to Web widget, WhatsApp, Telegram, Discord, Slack
- **Knowledge Base (RAG)** — Upload documents and URLs; chunking, embeddings, and reranking
- **Real-time Chat** — Streaming AI responses (SSE) in the dashboard and web widget
- **Embeddable Widget** — Paste one `<script>` tag; customizable theme, quick replies, domain allow-listing
- **Analytics** — Conversations, messages, success rate, response time, token usage
- **Multi-tenant Organizations** — Team collaboration with role-based access (owner/admin/member/viewer)
- **Custom Tools** — Extend AI capabilities with web search, calculators, HTTP tools, and more
- **BYOK** — Bring your own API keys per provider; stored org-scoped and encrypted at rest (AES-256-GCM)
- **Billing** — Subscription plans via Creem (Free / Pro / Business / Enterprise)
- **Admin Panel** — Platform-wide management: users, orgs, tickets, billing, audit log

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + TypeScript + Tailwind + shadcn/ui (Base UI) |
| Backend | Fastify + TypeScript |
| Auth | Supabase Auth (JWT verified server-side) |
| Database | PostgreSQL + Prisma v7 driver adapter (pgvector for embeddings) |
| Streaming | Server-Sent Events (SSE) |
| AI | Provider-agnostic `packages/ai` (OpenAI, Anthropic, Google, Groq, OpenRouter, DeepSeek, local gateway, BYOK) |
| Embeddings | GitHub Models, OpenAI, or local `@huggingface/transformers` + `all-MiniLM-L6-v2` |
| Validation | Zod schemas shared between frontend and backend |
| Monorepo | Turborepo + pnpm workspaces |

## Getting Started

```bash
pnpm install
pnpm db:generate   # generate Prisma client
pnpm db:push       # sync schema to your database
pnpm dev           # runs api + web
```

Copy `.env.example` to `.env` (API) and fill in the required values (`DATABASE_URL`, Supabase keys). Set the `VITE_*` vars in `apps/web/.env` (see `apps/web/.env.example`). All other variables are optional — features gracefully disable when missing.

## Project Structure

```
convio/
├── apps/
│   ├── web/          ← React frontend (dashboard, admin, widget, docs)
│   └── api/          ← Fastify backend
│
├── packages/
│   ├── ai/           ← AI provider abstraction (generate/stream/embed/moderate)
│   ├── config/       ← Shared app config & plan limits
│   ├── database/     ← Prisma schema + client (lazy-initialized)
│   ├── types/        ← Shared types & RBAC permissions
│   └── validation/   ← Shared Zod schemas
│
└── docs/             ← Project documentation
```

## Documentation

- [Architecture](./ARCHITECTURE.md)
- [Structure](./docs/STRUCTURE.md)
- [Database Schema](./docs/DATABASE-SCHEMA.md)
- [API Design](./docs/API-DESIGN.md)
- [Backend Modules](./docs/BACKEND-MODULES.md)
- [Frontend Structure](./docs/FRONTEND-STRUCTURE.md)
- [Auth Flow](./docs/AUTH.md)
- [AI Integration](./docs/AI-INTEGRATION.md)
- [Multi-channel](./docs/MULTI-CHANNEL.md)
- [Real-time Chat](./docs/REALTIME-CHAT.md)
- [Theme](./docs/THEME.md)
- [shadcn Patterns](./docs/SHADCN-PATTERNS.md)

## License

MIT

---

Built by **Muhammad Bilal Hassan** ([@bilals2008](https://github.com/bilals2008))

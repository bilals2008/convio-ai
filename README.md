<div align="center">

# Convio

**The open-source platform for building, deploying and scaling AI agents across every channel.**

Multi-tenant · Multi-channel · Provider-agnostic · Real-time

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](./tsconfig.base.json)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Fastify](https://img.shields.io/badge/Fastify-Backend-000000?logo=fastify&logoColor=white)](https://fastify.dev)
[![Prisma](https://img.shields.io/badge/Prisma-v7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Turborepo](https://img.shields.io/badge/Monorepo-Turborepo%20%2B%20pnpm-EF4444?logo=turborepo&logoColor=white)](https://turbo.build)

<img src="https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/hero.avif" alt="Convio Dashboard" width="100%" />

[**Documentation**](./docs) · [**Architecture**](./ARCHITECTURE.md) · [**Getting Started**](#-getting-started) · [**Contributing**](./CONTRIBUTING.md)

</div>

---

<div align="center">

## What is Convio?

Convio is a complete platform for running production AI agents — not a demo, not a thin wrapper.

It gives you a single control plane to define agent behaviour, ground agents in your own knowledge, connect them to the channels your customers already use, and observe everything they do. The AI layer is fully provider-agnostic, so you are never locked to a single model vendor.

</div>

<div align="center">

## Highlights

</div>

| Capability | Description |
|:-----------|:------------|
| **AI Agents** | Composable agent brains — system prompts, tools, tool configs, knowledge bases and model routing |
| **Knowledge Base (RAG)** | Document and URL ingestion, chunking, embeddings, vector search and reranking |
| **Multi-channel** | One agent, many surfaces — web widget, WhatsApp, Telegram, Discord and Slack |
| **Real-time Streaming** | Token-by-token responses over SSE in both the dashboard and the embeddable widget |
| **Embeddable Widget** | Drop-in `<script>` tag with theming, quick replies and domain allow-listing |
| **Provider-agnostic AI** | OpenAI, Anthropic, Google, Groq, OpenRouter, DeepSeek, local gateway — or bring your own keys |
| **Multi-tenant** | Organizations, memberships and role-based access control out of the box |
| **Observability** | Conversations, messages, success rate, latency, token usage and per-agent analytics |
| **Security** | AES-256-GCM encrypted provider keys, JWT verification, audit logging |
| **Billing** | Subscription tiers with plan enforcement and provider-agnostic billing abstraction |
| **Admin Panel** | Platform-wide management of users, organizations, tickets, billing and audit trails |

<div align="center">

## Tech Stack

</div>

| Layer | Technology |
|:------|:-----------|
| **Frontend** | React · Vite · TypeScript · Tailwind CSS · shadcn/ui |
| **Backend** | Fastify · TypeScript |
| **Auth** | Supabase Auth — JWT verified server-side |
| **Database** | PostgreSQL · Prisma v7 driver adapter · pgvector |
| **Streaming** | Server-Sent Events (SSE) |
| **AI Runtime** | Provider-agnostic `packages/ai` — generate, stream, embed, moderate |
| **Embeddings** | GitHub Models · OpenAI · local `all-MiniLM-L6-v2` |
| **Validation** | Zod schemas shared across client and server |
| **Monorepo** | Turborepo · pnpm workspaces |

<div align="center">

## Getting Started

</div>

```bash
# 1. Install dependencies
pnpm install

# 2. Generate the Prisma client
pnpm db:generate

# 3. Sync the schema to your database
pnpm db:push

# 4. Run the API and web app together
pnpm dev
```

<div align="center">

Copy `.env.example` to `.env` for the API and set the required values (`DATABASE_URL`, Supabase keys).
Configure the `VITE_*` variables in `apps/web/.env` — see `apps/web/.env.example`.
Every other variable is optional; features degrade gracefully when a service is not configured.

</div>

<div align="center">

## Project Structure

</div>

```
convio/
├── apps/
│   ├── web/          React frontend — dashboard, admin, widget, docs
│   └── api/          Fastify backend
│
├── packages/
│   ├── ai/           AI provider abstraction (generate / stream / embed / moderate)
│   ├── config/       Shared app config and plan limits
│   ├── database/     Prisma schema and lazy-initialized client
│   ├── types/        Shared types and RBAC permissions
│   └── validation/   Shared Zod schemas
│
└── docs/             Project documentation
```

<div align="center">

## Documentation

</div>

<div align="center">

[Architecture](./ARCHITECTURE.md) · [Structure](./docs/STRUCTURE.md) · [Database Schema](./docs/DATABASE-SCHEMA.md) · [API Design](./docs/API-DESIGN.md) · [Backend Modules](./docs/BACKEND-MODULES.md) · [Frontend Structure](./docs/FRONTEND-STRUCTURE.md) · [Auth Flow](./docs/AUTH.md) · [AI Integration](./docs/AI-INTEGRATION.md) · [Multi-channel](./docs/MULTI-CHANNEL.md) · [Real-time Chat](./docs/REALTIME-CHAT.md) · [MCP](./docs/MCP.md) · [Theme](./docs/THEME.md) · [shadcn Patterns](./docs/SHADCN-PATTERNS.md)

</div>

<div align="center">

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

## License

Released under the [MIT License](./LICENSE).

---

Built by **Muhammad Bilal Hassan** ([@bilals2008](https://github.com/bilals2008))

</div>

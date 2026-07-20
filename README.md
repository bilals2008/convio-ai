# Convio

AI Chatbot & Agent Management Platform

## Features

- **Multiple AI Chatbots** — Create and manage multiple chatbots from a single dashboard
- **AI Agents** — Configure AI brains with custom prompts, tools, and knowledge bases
- **Multi-channel Deployment** — Deploy bots to Web, WhatsApp, Telegram, Discord, Slack
- **Knowledge Base (RAG)** — Upload documents and URLs for context-aware responses
- **Real-time Chat** — Live conversations with streaming AI responses
- **Analytics** — Track conversations, messages, and bot performance
- **Multi-tenant Organizations** — Team collaboration with role-based access
- **Custom Tools** — Extend AI capabilities with web search, calculators, and custom tools

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + TypeScript + Tailwind |
| UI | shadcn/ui |
| Backend | Fastify (TypeScript) |
| Auth | Supabase Auth |
| Database | Supabase PostgreSQL |
| Realtime | Supabase Realtime + SSE |
| AI | Vercel AI SDK |
| Monorepo | Turborepo + pnpm |

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Build all packages
pnpm build
```

## Project Structure

```
convio/
├── apps/
│   ├── web/          ← React frontend
│   ├── api/          ← Fastify backend
│   └── docs/         ← Documentation
│
├── packages/
│   ├── ui/           ← shadcn components
│   ├── auth/         ← Better Auth config
│   ├── database/     ← Prisma schema
│   ├── ai/           ← AI providers & tools
│   ├── validation/   ← Zod schemas
│   ├── types/        ← Shared types
│   ├── utils/        ← Helper functions
│   ├── config/       ← Shared configs
│   └── sdk/          ← Client SDK
│
└── docs/             ← Project documentation
```

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [Contributing](./CONTRIBUTING.md)
- [Database Schema](./docs/DATABASE-SCHEMA.md)
- [API Design](./docs/API-DESIGN.md)
- [AI Integration](./docs/AI-INTEGRATION.md)

## License

MIT

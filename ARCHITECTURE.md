# Architecture

## Overview

Convio is an AI Chatbot & Agent Management Platform built as a monorepo.

## Principles

1. **Bot ≠ Agent** — Bots are user-facing interfaces, Agents are AI brains
2. **Semantic Tokens** — No hardcoded colors, always use design tokens
3. **shadcn First** — Use existing components before custom UI
4. **Shared Validation** — Zod schemas shared between frontend and backend
5. **Provider Abstraction** — AI providers implement common interface

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + TypeScript + Tailwind |
| UI | shadcn/ui |
| Backend | Fastify (TypeScript) |
| Auth | Better Auth |
| Database | Supabase PostgreSQL |
| Realtime | Supabase Realtime + SSE |
| AI | Vercel AI SDK |
| Monorepo | Turborepo + pnpm |

## Key Decisions

### Bot-Agent Separation

One Agent can power multiple Bots:

```
Agent: "Customer Support Agent"
    ├── Bot: WhatsApp Support
    ├── Bot: Website Widget
    └── Bot: Telegram Helper
```

### Adapter-based Gateway

New channels = new adapter file only:

```
gateway/adapters/
├── web.ts
├── whatsapp.ts
├── telegram.ts
├── discord.ts
└── slack.ts
```

### AI Provider Abstraction

All providers implement same interface:

```typescript
interface AIProvider {
  generate(params): Promise<Result>
  stream(params): AsyncIterable<Chunk>
  embed(text): Promise<number[]>
  moderate(text): Promise<Result>
  listModels(): Promise<Model[]>
}
```

## Documentation

- [Structure](./STRUCTURE.md)
- [Theme](./THEME.md)
- [Database Schema](./DATABASE-SCHEMA.md)
- [API Design](./API-DESIGN.md)
- [Auth Flow](./AUTH.md)
- [Backend Modules](./BACKEND-MODULES.md)
- [Frontend Structure](./FRONTEND-STRUCTURE.md)
- [AI Integration](./AI-INTEGRATION.md)
- [Multi-channel](./MULTI-CHANNEL.md)
- [Real-time Chat](./REALTIME-CHAT.md)

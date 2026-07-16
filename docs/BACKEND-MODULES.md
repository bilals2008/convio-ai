# Convio — Backend Modules

## Module Structure

```
api/src/modules/
├── auth/           ← Better Auth config + middleware
├── users/          ← User profiles, settings, avatar upload
├── organizations/  ← Multi-tenant teams, invitations
├── agents/         ← AI brain config, prompts, templates
├── deployments/    ← Channel configs, widget embed code
├── conversations/  ← Chat sessions
├── messages/       ← Individual messages, streaming
├── knowledge/      ← RAG, documents, embeddings
├── analytics/      ← Reports, daily aggregates
├── billing/        ← Plans, usage (basic structure)
└── ai/             ← AI providers, tools, streaming
```

---

## Module Details

### 1. auth/

- Providers: Google + GitHub (more later)
- Better Auth + organization plugin
- Session management

### 2. users/

- Profile management
- Avatar upload (S3/R2/local)

### 3. organizations/

- Multi-tenant teams
- Invitation link generation (email later)

### 4. agents/

- Custom prompts
- Prompt templates (readymade)
- Model selection (GPT-4, Claude, etc.)

### 5. deployments/

- Channel configuration (WhatsApp, Telegram, etc.)
- JavaScript embed snippet generation

### 6. conversations/

- Chat sessions
- Human handoff (architecture ready, implementation later)

### 7. messages/

- Message history
- Streaming responses (SSE/WebSocket) from day one

### 8. knowledge/

- File upload (PDF, TXT, MD, CSV)
- URL scraping
- Vector embeddings (pgvector)

### 9. analytics/

- Daily aggregates
- Real-time (later)

### 10. deployments/

Channel configs: Web Widget → WhatsApp → Telegram → Discord → Slack

### 11. billing/

- Basic structure only
- Creem integration (checkout, subscriptions, webhooks, portal)

### 12. ai/

- providers/ (OpenAI, Anthropic, Google, OpenRouter)
- tools/
- streaming.ts
- embeddings.ts
- moderation.ts
- utils.ts

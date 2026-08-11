# Admin AI Assistant — Architecture & Implementation Plan

Internal platform-intelligence assistant for Convio admins. Not a customer chatbot. Answers natural-language questions about platform data using secure backend tools, streams responses, persists conversation history, and audits every AI action.

## 1. Feature Architecture

```
Admin (Supabase JWT + PLATFORM_ADMIN_EMAILS / AdminGrant)
   │
   ▼
POST /api/admin/assistant/stream ── SSE ──► packages/ai provider (streamText, tools)
   │                                             │
   │                                    tool_call chunks
   │                                             ▼
   │                             admin-assistant/tools.ts (server-side handlers)
   │                             ┌──────────┬──────────┬──────────────┐
   │                             │ prisma   │ admin    │ SQL (raw,    │
   │                             │ queries  │ services │ read-only)   │
   │                             └──────────┴──────────┴──────────────┘
   │                                             │
   │                                    tool_result injected
   │                                             ▼
   │                                    second stream → final answer
   │                                             │
   ▼                                             ▼
AdminMessage (persisted) ────────────────── AdminAssistantLog (audit)
```

- **Q&A loop**: user question → LLM decides which tools to call → handlers execute server-side against Prisma → results fed back → final streamed answer (markdown: summaries, tables, lists).
- **Charts/tables**: markdown tables via `remark-gfm`; real charts come from the Quick Action cards (wired to existing admin hooks), not from LLM-generated chart config (v1 scope).
- **History**: every admin has persistent conversations; list, rename-ish title, delete. Seeded title from first question.

## 2. UI Architecture

Route: `/admin/assistant` — `apps/web/src/admin/pages/assistant-page.tsx` (default export, added in `App.tsx` inside `AdminLayout` block).

Layout (page content only, admin shell stays):

```
PageHeader "AI Assistant"
┌──────────────────────────────┬──────────────────────────────────┐
│ Conversation list (sidebar)  │ Chat area                        │
│  - search                   │  messages (AiResponse markdown)  │
│  - "+ New chat"             │  tool-call chips (collapsed)     │
│  - items with title/date    │  suggested questions (empty)     │
│  - delete (dropdown)        │  textarea + send + stop          │
│  (hidden on mobile → Sheet) │                                  │
└──────────────────────────────┴──────────────────────────────────┘
```

Components (new, in `apps/web/src/admin/components/assistant/`):
- `assistant-chat.tsx` — message list + input + streaming bubble + stop button (AbortController)
- `suggested-questions.tsx` — chip buttons shown when conversation empty (pattern: `components/widget/WidgetWelcome.tsx:88-101`)
- `tool-call-chip.tsx` — inline `{type:'tool_call'}` renderer: tool name + status (running/done/error), collapsible args
- `conversation-list.tsx` — history sidebar + mobile `Sheet` drawer

Reused (all exist): `AiResponse` (`components/shared/ai-response.tsx`, markdown + copy), `message-scroller` / `message` (shadcn v4, Base UI — `render` prop, no `asChild`), `Button`, `Input`/`Textarea`, `Skeleton`, `EmptyState`, `DropdownMenu`, `ChartContainer` + recharts for quick-action charts, `PageHeader`.

Streaming consumption: copy the proven `fetch` + `getReader` + SSE `data:`/`[DONE]` loop from `components/conversations/chat-view.tsx:161-240`, with the AbortController from `components/agents/agent-chat-panel.tsx:47-140`.

Data hooks (new file `apps/web/src/admin/hooks/use-admin-assistant.ts`):
- `useAdminConversations()` — list, `queryKey ['admin','assistant','conversations']`
- `useAdminMessages(conversationId)`
- `useCreateAdminConversation()` / `useDeleteAdminConversation()` — `invalidateQueries` on change
- `useAdminAssistantStream()` — imperative hook returning `{ stream, abort }`; `queryFn` must stay pure (AGENTS.md) — streaming state is local component state, not server state

API client: add `assistant` namespace to `apps/web/src/admin/services/admin-api.ts` (`adminApi.assistant.*`).

Navigation: add `admin.assistant.read` to `NavPermission` union + `defaultPermissions` + `fullAdminPermissions` in `admin/navigation/admin-nav-items.ts:36-82`; nav item `{ icon: Bot, label: 'AI Assistant', href: '/admin/assistant', permission: 'admin.assistant.read' }` in the `Monitor` group. (No `Sparkles` icon — AGENTS.md.)

## 3. Backend Architecture

New module `apps/api/src/modules/admin-assistant/` (registered in `server.ts` like sibling modules, prefix `/api`):

| File | Responsibility |
|---|---|
| `routes.ts` | REST: list/create/get/delete conversations, list messages; SSE stream route |
| `service.ts` | chat loop: model resolution, two-phase streaming, persistence, audit |
| `tools.ts` | tool definitions (JSON Schema) + server-side handlers |
| `prompts.ts` | system prompt (role, tool guidance, output rules) |

Routes (all guarded `adminGuard = [authenticate, ensurePlatformAdmin]` — same as `modules/admin/routes.ts:89`):

```
GET    /api/admin/assistant/conversations          → paginated list (id, title, updatedAt)
POST   /api/admin/assistant/conversations          → create (title from first question)
GET    /api/admin/assistant/conversations/:id/messages → ordered messages
DELETE /api/admin/assistant/conversations/:id      → delete conversation + messages
POST   /api/admin/assistant/stream                 → SSE (body: { conversationId?, messages })
```

Stream route rate limit: `config: { rateLimit: { max: 30, timeWindow: '1 minute' } }` (pattern: `modules/messages/routes.ts:632`).

Model resolution (platform context — no org, so no BYOK): `ADMIN_ASSISTANT_MODEL` env overrides; default is OpenCode Zen's free DeepSeek (`opencode/deepseek-v4-flash-free`, key `OPENCODE_API_KEY`), then other Zen free models, then `gpt-4o-mini`/`claude-3-haiku`/`gemini-1.5-flash`; provider resolved via `getProviderForModel` from `packages/ai/src/providers/index.ts:45`.

## 4. Tool Architecture

Fixed, server-defined tool registry in `tools.ts`. Client never sees handlers, only names/descriptions during streaming. Each tool:

```ts
{ name, description, parameters: jsonSchema, handler(request, args) → { data } | { error } }
```

| Tool | Answers | Implementation |
|---|---|---|
| `revenue_summary` | Today's revenue, 30d revenue, month-over-month comparison | Prisma over `Invoice` (paid) + `Subscription` — mirrors `admin/routes.ts:1213` logic |
| `user_stats` | Signups today, total/active users, growth | Prisma over `Profile` (status, emailVerified, createdAt) |
| `org_stats` | Active orgs, highest-usage org, plan distribution | Prisma over `Organization` + `Membership` + `Agent` counts |
| `agent_stats` | Top agents by conversation count, most-used model | Prisma over `Agent`/`Conversation` groupBy |
| `conversation_stats` | Messages today, channel breakdown, resolution status | Prisma over `Conversation`/`Message` groupBy |
| `ticket_stats` | "Open tickets" = active/escalated conversations | Prisma over `Conversation` status/resolutionStatus (no Ticket model — conversations are the ticket analogue) |
| `system_health` | Conversation statuses, deployments, errors last 24h | Mirrors `admin/routes.ts:982` + `AuditLog` errors |
| `usage_limits` | Users/orgs approaching plan limits | `Message` counts vs `Plan.limits` Json |
| `audit_summary` | Recent platform activity | Prisma over `AuditLog` |

Rules:
- All queries parameterized Prisma (or read-only raw SQL like `admin/routes.ts:223-231`); no `$executeRaw` writes.
- Handler errors are returned as `tool_result` error chunks, never thrown to the client raw.
- Tool calls are **two-phase** (existing Convio pattern, `modules/ai/routes.ts:76-143`): stream with tools → collect `tool_call` → execute → second stream with results as user message → stream final answer.
- No per-tool RBAC in v1 — every admin is platform-admin; the tool set is the access control.

## 5. Data Flow

1. Admin opens `/admin/assistant` → `useAdminConversations` → sidebar list.
2. Sends question → `POST /stream` SSE with `{ conversationId, messages: [{role:'user', content}] }`.
3. Route: `authenticate` → `ensurePlatformAdmin` → rate limit → load conversation ownership (`conversation.adminId === request.userId`).
4. `service.chat()`: resolve model → `provider.stream({ model, messages, tools })` with tool defs.
5. On `tool_call` chunks: emit `{type:'tool_call'}` → execute handler → emit `{type:'tool_result'}` → append as user message.
6. Second `provider.stream()` → emit `text`/`reasoning` chunks → `done` (usage) → `[DONE]`.
7. Persist: `AdminMessage` rows (user + assistant, with usage + toolCalls Json). Update `AdminConversation.updatedAt`, title if first message.
8. Audit: `AdminAssistantLog` row (actor, action=tool name, query, success, latencyMs).
9. Client renders streaming text via `AiResponse`; `tool_call` chips update on `tool_result`.
10. Client disconnect → abort loop (pattern `modules/messages/routes.ts:290-292`), persist partial assistant message if any text arrived.

## 6. Security Model

| Layer | Control |
|---|---|
| Auth | `ensurePlatformAdmin` (env emails or non-expired `AdminGrant`) on **every** route, incl. stream |
| Ownership | conversation CRUD scoped to `conversation.adminId`; 404 on cross-admin access |
| Rate limit | 30 req/min stream, 60 req/min REST (per IP) |
| Tool access | handlers fixed server-side; no client-supplied tool names or SQL |
| Prompt injection | system prompt marks tool results as data; conversation history trimmed (last N messages) |
| Data exposure | platform-aggregate/admin-level data only; no customer org-level raw data beyond what admin endpoints already expose |
| Audit | every tool execution logged (actor, tool, query, latency, success) |
| Secrets | model keys from env only; never streamed/logged |
| Input validation | zod on route body (`validate` plugin); message content capped (e.g. 2000 chars) |

## 7. Folder Structure

```
apps/api/src/modules/admin-assistant/
  routes.ts          # REST + SSE stream, adminGuard
  service.ts         # chat loop, persistence, audit
  tools.ts           # 9 tool defs + handlers (Prisma)
  prompts.ts         # system prompt
packages/database/prisma/schema.prisma   # +3 models (below)
apps/web/src/admin/
  pages/assistant-page.tsx
  components/assistant/
    assistant-chat.tsx
    conversation-list.tsx
    suggested-questions.tsx
    tool-call-chip.tsx
  hooks/use-admin-assistant.ts
  services/admin-api.ts          # + assistant namespace
  navigation/admin-nav-items.ts  # + permission + nav item
apps/web/src/App.tsx             # + route
```

## 8. Database Interaction Strategy

New Prisma models (1 migration, then `pnpm exec prisma generate`):

```prisma
model AdminConversation {
  id        String   @id @default(cuid())
  adminId   String
  title     String   @default("New conversation")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  messages  AdminMessage[]
  @@index([adminId, updatedAt(sort: Desc)])
}

model AdminMessage {
  id             String   @id @default(cuid())
  conversationId String
  role           String   // 'user' | 'assistant'
  content        String
  toolCalls      Json?
  usage          Json?    // tokens
  error          String?
  createdAt      DateTime @default(now())
  conversation   AdminConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  @@index([conversationId, createdAt])
}

model AdminAssistantLog {
  id         String   @id @default(cuid())
  actorId    String
  action     String   // tool name or 'chat'
  query      String?
  success    Boolean
  latencyMs  Int?
  metadata   Json?
  createdAt  DateTime @default(now())
  @@index([actorId, createdAt])
}
```

- All reads via Prisma client (`packages/database/src/index.ts` lazy proxy); aggregates via `groupBy`/raw read-only SQL where the admin routes already prove the query.
- The `Analytics` daily snapshot table stays the source for long-window trends; live tables for "today" questions.

## 9. Streaming Response Architecture

SSE, matching existing Convio wire format (`reply.hijack()` pattern, `modules/messages/routes.ts:278-287`):

```
data: {"type":"tool_call","toolCall":{"name":"revenue_summary","id":"…","arguments":{…}}}
data: {"type":"tool_result","toolCall":{"name":"revenue_summary","id":"…","result":{…}}}
data: {"type":"text","content":"…"}
data: {"type":"done","usage":{…}}
data: [DONE]
```

- Chunk types identical to `packages/ai/src/index.ts:41-46` — the frontend parser already handles them.
- Heartbeat: keep-alive comment every ~15s for proxies.
- Disconnect: `reply.raw` `close`/abort → stop consuming provider stream, persist partial.
- No queue/Redis in v1 — SSE is per-connection; horizontal scale-out works since history is in Postgres and state is in the connection.

## 10. Future Scalability Plan

- **Charts from chat**: structured chart blocks (`{type:'chart'}` with recharts config) emitted by a UI-only rendering tool — needs chart-schema validation before trust.
- **Cross-admin conversations**: share/assign conversations, org-scoped answers (pass `organizationId` to tools when asked).
- **Tool RBAC**: per-permission tool gating (`admin.billing.read` → revenue tool).
- **Cost control**: per-admin daily token budget, cached tool results (30s TTL).
- **Evaluation**: record question + tool outputs for evals; fine-tuned routing (small model for classification, large for synthesis).
- **Queue for long jobs**: heavy exports (e.g. "all failed integrations") → job + notification.
- **Webhook/notification on completion** for async questions.

## Implementation Order

1. Schema + migration + `prisma generate`
2. Backend: `prompts.ts` → `tools.ts` → `service.ts` → `routes.ts` (+ register module in `server.ts`)
3. Frontend: `admin-api.ts` namespace → hooks → nav item + route → components → page
4. Quick actions: cards + follow-up chips send pre-written questions through the tool pipeline (v1; recharts-in-chat is v2)
5. Verify: `pnpm run type-check` + eslint in apps/api and apps/web; tool handlers smoke-tested against live DB

import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MessageSquareText, Search, BarChart3, Bot, Database, Radio, Zap, Key, Download, FileText, Code } from 'lucide-react'
import { DocHeading } from '@/components/docs/doc-heading'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: MessageSquareText,
    title: 'Conversation API (CRUD)',
    desc: 'Full REST endpoints for conversations. List all, get by ID, update status (close, archive), assign tags, transfer agents.',
    example: '`GET /api/conversations?status=active&agentId=abc` → Returns paginated list. `PATCH /api/conversations/:id` → `{"status":"closed","tags":["resolved"]}`',
    file: 'apps/api/src/routes/conversations/',
    impl: 'Fastify route handlers. `GET /conversations` with query params (status, agentId, dateRange, page, limit). `GET /conversations/:id` with messages. `PATCH /conversations/:id`.',
    implFile: 'routes/conversations/index.ts',
  },
  {
    icon: Search,
    title: 'Message History with Search',
    desc: 'Search through message history by content, date range, sender. Paginated with cursor-based or offset pagination.',
    example: '`GET /api/conversations/:id/messages?search=refund&before=2025-01-01&limit=50`',
    file: 'apps/api/src/routes/conversations/',
    impl: 'Prisma query with `content: { contains: search }`, cursor pagination, date filters. Return `{data, meta: {nextCursor, hasMore}}`.',
    implFile: 'routes/conversations/messages.ts',
  },
  {
    icon: BarChart3,
    title: 'Analytics Endpoints',
    desc: 'Programmatic access to analytics data. Messages over time, conversation counts, agent performance, channel breakdown.',
    example: '`GET /api/analytics/messages?from=2025-01-01&to=2025-01-31&granularity=day` → `[{date, count, channel}]`',
    file: 'apps/api/src/routes/analytics/',
    impl: 'Aggregate from `Analytics` table. Support grouping by day/week/month, filtering by channel, agent. Return structured JSON for chart libraries.',
    implFile: 'routes/analytics/index.ts',
  },
  {
    icon: Bot,
    title: 'Agent Management',
    desc: 'CRUD for agents, plus stats endpoint. Create, update, delete agents. Get agent performance metrics (messages, satisfaction, response time).',
    example: '`POST /api/agents` `{name, systemPrompt, model, temperature}` → Agent created. `GET /api/agents/:id/stats` → `{totalMessages, avgResponseTime}`',
    file: 'apps/api/src/routes/agents/',
    impl: 'Standard CRUD routes. Stats endpoint aggregates from conversations + messages tables.',
    implFile: 'routes/agents/index.ts + routes/agents/stats.ts',
  },
  {
    icon: Database,
    title: 'Knowledge Base CRUD',
    desc: 'Upload documents, list all, get by ID, update, delete, trigger re-indexing. Supports PDF, URL, text, CSV.',
    example: '`POST /api/knowledge/documents` (multipart PDF upload) → Processes → Chunks → Embeds → Ready. `DELETE /api/knowledge/documents/:id`',
    file: 'apps/api/src/routes/knowledge/',
    impl: 'Fastify multipart for file upload. Route to `processDocument()` from processor.ts. List/delete via Prisma.',
    implFile: 'routes/knowledge/index.ts',
  },
  {
    icon: Radio,
    title: 'Webhook Management',
    desc: 'Register custom webhooks for real-time events. Events: message.created, conversation.created, conversation.closed, agent.errors.',
    example: '`POST /api/webhooks` `{url, events: ["message.created"], secret}` → Convio sends POST to your URL on each new message with `{event, data, timestamp}`.',
    file: 'apps/api/src/routes/webhooks/',
    impl: 'Store webhooks in DB (`Webhook` model). On event, check matching webhooks, send POST with HMAC signature. Retry up to 3 times with backoff.',
    implFile: 'routes/webhooks/index.ts + lib/webhook-dispatcher.ts',
  },
  {
    icon: Zap,
    title: 'Bulk Messaging',
    desc: 'Send a message to multiple contacts in one API call. Rate-limited per channel. Supports WhatsApp, Discord, Telegram targets.',
    example: '`POST /api/messages/bulk` `{channel: "whatsapp", contacts: ["+1234", "+5678"], body: "📢 Server maintenance tonight at 2AM"}`',
    file: 'apps/api/src/routes/messages/',
    impl: 'Receive array of contacts. Validate rate limits. Use queue (Bull/BullMQ) for processing. Return job ID for status polling.',
    implFile: 'routes/messages/bulk.ts + lib/message-queue.ts',
  },
  {
    icon: Key,
    title: 'Scoped API Keys',
    desc: 'Generate API keys with scoped permissions: read-only, admin, messaging-only. Keys are hashed in DB, shown once. Revocable.',
    example: '`POST /api/api-keys` `{name: "CI Pipeline", scopes: ["messages:send", "analytics:read"]}` → Returns key once: `convio_sk_abc123...`',
    file: 'apps/api/src/routes/api-keys/',
    impl: 'Create `ApiKey` model (name, hashedKey, scopes, lastUsedAt). Hash with SHA-256 before storing. Verify via Fastify hook on protected routes.',
    implFile: 'routes/api-keys/index.ts + lib/api-key-auth.ts',
  },
  {
    icon: Download,
    title: 'Export/Import Conversations',
    desc: 'Export conversations as JSON or CSV for compliance, analysis, or migration. Import conversations back for data recovery.',
    example: '`GET /api/conversations/export?format=json&dateFrom=2024-01-01` → Downloads JSON file: `[{id, messages: [...], metadata: {...}}]`',
    file: 'apps/api/src/routes/conversations/',
    impl: 'Stream large exports. JSON: streaming JSON array. CSV: flat headers (id, role, content, timestamp). Use archiver for multi-file ZIP.',
    implFile: 'routes/conversations/export.ts',
  },
  {
    icon: Zap,
    title: 'Rate Limit Headers',
    desc: 'Standard `X-RateLimit-*` headers on all API responses. Clients can programmatically back off without hitting 429s.',
    example: 'Response headers: `X-RateLimit-Limit: 100`, `X-RateLimit-Remaining: 42`, `X-RateLimit-Reset: 1704067200`',
    file: 'apps/api/src/plugins/rate-limit.ts',
    impl: 'Use `@fastify/rate-limit` plugin. Configure max per route/per user. Apply `onRequest` hook to set headers. Customize response for 429.',
    implFile: 'plugins/rate-limit.ts',
  },
  {
    icon: FileText,
    title: 'OpenAPI / Swagger Spec',
    desc: 'Auto-generated OpenAPI 3.0 spec from Fastify route schemas. Serve at /swagger or /docs for easy exploration.',
    example: 'Visit `/swagger` → Beautiful Swagger UI → Browse all endpoints → Try them directly from the browser.',
    file: 'apps/api/src/plugins/swagger.ts',
    impl: 'Use `@fastify/swagger` + `@fastify/swagger-ui`. Define route schemas with `schema: { description, tags, params, response }`.',
    implFile: 'plugins/swagger.ts',
  },
  {
    icon: Code,
    title: 'SSE Streaming',
    desc: 'Server-Sent Events endpoint for streaming agent responses in real-time. Perfect for chat UIs that need token-by-token streaming.',
    example: '`GET /api/chat/stream?message=Hello&agentId=abc` → `data: {"token": "Hello"}\\n\\ndata: [DONE]`',
    file: 'apps/api/src/routes/chat/',
    impl: 'Set `Content-Type: text/event-stream`. Use `on(\'data\', chunk => reply.raw.write(\`data: \${JSON.stringify({token: chunk})}\\n\\n\`))`. Handle cancellation via `request.raw.on("close")`.',
    implFile: 'routes/chat/stream.ts',
  },
]

export default function ApiFeaturesPage() {
  return (
    <div>
      <DocHeading as="h1">API Features (Coming Soon)</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-8">
        Upcoming REST API endpoints for Convio, with implementation notes to help the team build consistently.
      </p>

      <div className="space-y-6">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <div key={feature.title} className="rounded-xl border p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-violet-500/10 mt-0.5">
                  <Icon className="size-3.5 text-violet-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold">{feature.title}</h3>
                    <code className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{feature.file}</code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
              <div className="ml-10 space-y-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1">Example</p>
                  <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">{feature.example}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1">Implementation</p>
                  <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">{feature.impl}</p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Code className="size-3" />
                  <span>Target: <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{feature.implFile}</code></span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3 mt-10 pt-6 border-t">
        <Link to="/docs/widget-features">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-3.5" />
            Back: Widget Features
          </Button>
        </Link>
        <Link to="/docs/corrective-rag">
          <Button size="sm">
            Next: RAG Improvements
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

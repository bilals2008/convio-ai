# Convio — API Design

## Base URL

```
https://api.convio.app/v1
```

## Conventions

- **Pagination:** Cursor-based (`?cursor=abc123&limit=20`)
- **Versioning:** `/v1/` prefix
- **Auth:** Better Auth session cookies
- **Response format:** `{ data, meta, error }`

## Rate Limits

| Endpoint Type | Limit |
|---------------|-------|
| Auth endpoints | 5 req/min |
| API endpoints | 100 req/min |
| Chat endpoints | 30 req/min |

---

## Auth Endpoints (Better Auth)

```
POST   /api/auth/sign-up/email
POST   /api/auth/sign-in/email
POST   /api/auth/sign-out
GET    /api/auth/session
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

## Organization Endpoints

```
GET    /organizations              ← List user's organizations
POST   /organizations              ← Create organization
GET    /organizations/:id          ← Get organization details
PATCH  /organizations/:id          ← Update organization
DELETE /organizations/:id          ← Delete organization
```

## Agent Endpoints

```
GET    /agents                     ← List agents (filtered by org)
POST   /agents                     ← Create agent
GET    /agents/:id                 ← Get agent details
PATCH  /agents/:id                 ← Update agent
DELETE /agents/:id                 ← Delete agent
POST   /agents/:id/test            ← Test agent with sample message
```

## Bot Endpoints

```
GET    /bots                       ← List bots
POST   /bots                       ← Create bot
GET    /bots/:id                   ← Get bot details
PATCH  /bots/:id                   ← Update bot
DELETE /bots/:id                   ← Delete bot
POST   /bots/:id/deploy            ← Deploy bot to channel
POST   /bots/:id/test              ← Test bot in sandbox
```

## Conversation Endpoints

```
GET    /conversations              ← List conversations
POST   /conversations              ← Start new conversation
GET    /conversations/:id          ← Get conversation
PATCH  /conversations/:id          ← Update status (close, transfer)
DELETE /conversations/:id          ← Delete conversation
```

## Message Endpoints

```
GET    /conversations/:id/messages ← List messages
POST   /conversations/:id/messages ← Send message (user or bot)
```

## Knowledge Base Endpoints

```
GET    /knowledge                  ← List knowledge bases
POST   /knowledge                  ← Create knowledge base
GET    /knowledge/:id              ← Get knowledge base
PATCH  /knowledge/:id              ← Update knowledge base
DELETE /knowledge/:id              ← Delete knowledge base
```

## Document Endpoints

```
POST   /knowledge/:id/documents    ← Upload document
DELETE /documents/:id              ← Delete document
GET    /documents/:id/status       ← Check processing status
```

## Tool Endpoints

```
GET    /tools                      ← List available tools
POST   /tools                      ← Create custom tool
GET    /tools/:id                  ← Get tool details
PATCH  /tools/:id                  ← Update tool
DELETE /tools/:id                  ← Delete tool
```

## Integration Endpoints

```
GET    /integrations               ← List integrations
POST   /integrations               ← Add integration (WhatsApp, etc.)
GET    /integrations/:id           ← Get integration details
PATCH  /integrations/:id           ← Update integration
DELETE /integrations/:id           ← Remove integration
POST   /integrations/:id/verify    ← Verify channel connection
```

## Analytics Endpoints

```
GET    /analytics/overview         ← Dashboard overview
GET    /analytics/bots/:id         ← Bot-specific analytics
GET    /analytics/conversations    ← Conversation metrics
GET    /analytics/export           ← Export CSV/PDF
```

## Chat Widget Endpoints (Public)

```
POST   /chat/:botId/message        ← Send message to bot
GET    /chat/:botId/history        ← Get chat history
POST   /chat/:botId/feedback       ← Submit feedback
```

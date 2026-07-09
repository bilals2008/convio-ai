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

## Deployment Endpoints

```
GET    /agents/:agentId/deployments            ← List deployments
POST   /agents/:agentId/deployments            ← Create deployment
GET    /agents/:agentId/deployments/:id        ← Get deployment details
PATCH  /agents/:agentId/deployments/:id        ← Update deployment
DELETE /agents/:agentId/deployments/:id        ← Remove deployment
POST   /agents/:agentId/deployments/:id/verify ← Verify channel connection
```

## Analytics Endpoints

```
GET    /analytics/overview         ← Dashboard overview
GET    /agents/:agentId/analytics  ← Agent analytics
GET    /analytics/conversations    ← Conversation metrics
GET    /analytics/export           ← Export CSV/PDF
```

## Chat Widget Endpoints (Public)

```
POST   /chat/:agentId/message      ← Send message to agent
GET    /chat/:agentId/history      ← Get chat history
POST   /chat/:agentId/feedback     ← Submit feedback
```

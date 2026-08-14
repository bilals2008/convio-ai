# Convio — MCP & OAuth Documentation

> How MCP servers work in Convio, how to configure them, and how OAuth authorization is implemented.

---

## What is MCP?

MCP (Model Context Protocol) connects AI agents to external tools and data sources (Notion, GitHub, Linear, etc.) through a standard interface. Convio agents can load and call tools from any MCP server — local (stdio) or remote (streamable HTTP).

---

## Server types & auth modes

| Type | Transport | Auth modes |
|------|-----------|------------|
| `stdio` | Local process (`command` + `args`) | `none` |
| `streamable-http` | Remote HTTP endpoint (`url`) | `none`, `header`, `oauth` |

- **`none`** — no auth; server must be public
- **`header`** — static bearer token sent as `Authorization: Bearer <apiKey>` (plus custom headers)
- **`oauth`** — full OAuth 2.1 authorization-code flow with PKCE + dynamic client registration

---

## Configuration

### 1. Add a server (Settings → MCP Servers)

| Field | Description |
|-------|-------------|
| Name | Unique per organization |
| Type | `stdio` or `streamable-http` |
| Command / Args | For stdio servers |
| URL | For HTTP servers |
| Auth type | `none` / `header` / `oauth` |
| API key | For `header` auth |
| Custom headers | Key: value lines; applied on every request |

### 2. Attach to agents

Attach servers to agents from the agent's MCP section. Attached servers expose their tools to that agent's tool router.

### 3. OAuth connect

1. Add server with auth type `oauth` → save
2. Click the shield icon in the table (or "Connect with OAuth" in test modal)
3. Browser opens the provider's consent page (Notion, GitHub, Linear…)
4. Authorize → provider redirects to `/api/mcp/oauth/callback`
5. Tokens are stored (encrypted if `MCP_OAUTH_ENCRYPTION_KEY` is set); badge shows **OAuth connected**
6. Agents authenticate tool calls with the stored tokens; refresh happens automatically via the SDK

### Reconnect / disconnect

- **Reconnect** (refresh icon): forces re-auth — current tokens are revoked first
- **Disconnect** (unlink icon): clears stored OAuth state

---

## API endpoints

### MCP servers
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/organizations/:orgId/mcp-servers` | Create (admin) |
| GET | `/api/organizations/:orgId/mcp-servers` | List |
| GET | `/api/mcp-servers/:id` | Get by id |
| PATCH | `/api/mcp-servers/:id` | Update |
| DELETE | `/api/mcp-servers/:id` | Delete |
| POST | `/api/mcp-servers/:id/test` | Test connection + list tools |
| POST | `/api/mcp-servers/:id/clear-test` | Clear test result |

### OAuth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/mcp-servers/:id/authorize` | Start flow (`{ force: true }` = re-auth). Rate limited 20/min |
| GET | `/api/mcp/oauth/callback` | Provider redirect target; exchanges code, persists tokens |
| POST | `/api/mcp-servers/:id/disconnect` | Revoke/clear tokens. Rate limited 20/min |
| GET | `/api/mcp-servers/:id/oauth-status` | `{ authorized, hasRefreshToken, tokenExpiresAt, lastError }` |

### Agent linkage
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/agents/:agentId/mcp-servers` | Attached servers |
| POST | `/api/agents/:agentId/mcp-servers/:serverId` | Attach |
| DELETE | `/api/agents/:agentId/mcp-servers/:serverId` | Detach |

---

## Implementation notes

### Files
```
apps/api/src/services/mcp/index.ts          # McpClient (SDK wrapper), transports, header sanitization
apps/api/src/services/mcp/factory.ts        # clientFromServer(server, callbackBaseUrl?)
apps/api/src/services/mcp/oauth-provider.ts # DbOAuthClientProvider (PKCE, DCR, token persistence)
apps/api/src/services/mcp/crypto.ts         # AES-256-GCM token encryption at rest
apps/api/src/modules/mcp/routes.ts          # CRUD + test + agent linkage
apps/api/src/modules/mcp/oauth-routes.ts    # authorize / callback / disconnect / oauth-status
apps/web/src/pages/settings/mcp-servers-page.tsx
apps/web/src/lib/hooks/use-mcp-oauth.ts     # useOAuthStatus / useOAuthStatuses
apps/web/src/lib/api.ts                     # mcpServers.* helpers
```

### Security
- **Token encryption at rest** — when `MCP_OAUTH_ENCRYPTION_KEY` env var is set, OAuth tokens are AES-256-GCM encrypted before storage in `McpServer.oauthState`. Without the key, tokens are stored as plaintext JSON (dev only).
- **Header sanitization** — `Authorization`, `Mcp-Session-Id`, `Content-Type`, `Host`, `Content-Length`, `Connection` cannot be overridden via custom headers.
- **Authz** — connect/disconnect require org admin (`ensureAdmin`); status/read require membership.
- **Rate limiting** — authorize/disconnect capped at 20 req/min per IP (global plugin default 100 req/min).
- **Audit trail** — authorize/disconnect/callback events logged via `fastify.auditLog` (`mcp_oauth.*` actions).

### OAuth state persistence
The OAuth client provider persists client registration, PKCE verifier, discovery metadata, and tokens into the `McpServer.oauthState` JSON column so the browser redirect round-trip can be resumed from any API instance. Token expiry (`tokenExpiresAt`) and last error (`lastError`) are also persisted for status surfacing.

---

## Testing locally

```bash
pnpm dev   # API :3000, web :5173
```

- Add server: type `streamable-http`, URL `https://mcp.notion.com/mcp`, auth type `oauth`
- `PUBLIC_URL` must be set to the API's externally reachable URL for callbacks
- `CORS_ORIGIN` first entry is the post-callback redirect base (default `http://localhost:5173`)
- DB migrations are applied manually: `pnpm exec prisma migrate deploy`
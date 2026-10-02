import type { JsonValue } from '@prisma/client/runtime/client'
import { McpClient, type McpServerConfig } from './index.js'
import { DbOAuthClientProvider } from './oauth-provider.js'
import { decryptSecret } from './crypto.js'

function defaultCallbackBaseUrl(): string {
  return process.env.PUBLIC_URL || 'http://localhost:3000'
}

export interface McpServerLike {
  id: string
  name: string
  url: string | null
  authType: string | null
  headers: JsonValue
  apiKey: string | null
  clientId: string | null
  clientSecret: string | null
}

/**
 * Build an McpClient for a stored McpServer row, wiring custom headers and the
 * persisted OAuth provider so agents and test connections use the same auth.
 */
export function clientFromServer(
  server: McpServerLike,
  callbackBaseUrl: string = defaultCallbackBaseUrl()
): McpClient {
  const config: McpServerConfig = {
    id: server.id,
    name: server.name,
    url: server.url,
    authType: server.authType,
    headers: (server.headers as Record<string, string> | null) ?? undefined,
    apiKey: server.apiKey,
  }
  if (server.authType === 'oauth') {
    // Must use the same key the OAuth routes persist tokens with, otherwise the
    // tokens are written encrypted and read back as plaintext (or vice versa).
    config.authProvider = new DbOAuthClientProvider(
      server.id,
      callbackBaseUrl,
      process.env.MCP_OAUTH_ENCRYPTION_KEY,
      {
        clientId: server.clientId || undefined,
        clientSecret: server.clientSecret
          ? decryptSecret(server.clientSecret, process.env.MCP_OAUTH_ENCRYPTION_KEY)
          : undefined,
      },
    )
  }
  return new McpClient(config)
}
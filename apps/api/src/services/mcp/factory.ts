import type { JsonValue } from '@prisma/client/runtime/client'
import { McpClient, type McpServerConfig } from './index.js'
import { DbOAuthClientProvider } from './oauth-provider.js'

function defaultCallbackBaseUrl(): string {
  return process.env.PUBLIC_URL || 'http://localhost:3000'
}

export interface McpServerLike {
  id: string
  name: string
  type: string
  command: string | null
  args: JsonValue
  url: string | null
  authType: string | null
  headers: JsonValue
  apiKey: string | null
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
    type: server.type,
    command: server.command,
    args: server.args as string[],
    url: server.url,
    authType: server.authType,
    headers: (server.headers as Record<string, string> | null) ?? undefined,
    apiKey: server.apiKey,
  }
  if (server.authType === 'oauth') {
    config.authProvider = new DbOAuthClientProvider(server.id, callbackBaseUrl)
  }
  return new McpClient(config)
}
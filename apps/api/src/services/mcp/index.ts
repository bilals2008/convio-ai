import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { UnauthorizedError } from '@modelcontextprotocol/sdk/client/auth.js'
import type { OAuthClientProvider } from '@modelcontextprotocol/sdk/client/auth.js'
import { assertSafeUrl } from '../ssrf.js'

export interface McpServerConfig {
  id: string
  name: string
  type: string
  command?: string | null
  args?: string[] | unknown
  url?: string | null
  authType?: string | null
  headers?: Record<string, string> | unknown
  apiKey?: string | null
  authProvider?: OAuthClientProvider
}

interface McpTool {
  name: string
  description?: string
  inputSchema?: Record<string, unknown>
}

const BLOCKED_HEADERS = ['authorization', 'mcp-session-id', 'content-type', 'host', 'content-length', 'connection']

function buildHttpHeaders(config: McpServerConfig): Record<string, string> {
  const headers: Record<string, string> = {}
  if (config.headers && typeof config.headers === 'object') {
    for (const [k, v] of Object.entries(config.headers as Record<string, string>)) {
      if (!k || !v) continue
      if (BLOCKED_HEADERS.includes(k.toLowerCase())) continue
      headers[k] = v
    }
  }
  if (config.authType === 'header' && config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`
  }
  return headers
}

export class McpClient {
  private client: Client
  private config: McpServerConfig
  private transport: ReturnType<McpClient['createTransport']> | null = null
  private connected = false
  private pendingAuthUrl?: string

  constructor(config: McpServerConfig) {
    this.config = config
    this.client = new Client(
      { name: 'convio-mcp', version: '1.0.0' },
      { capabilities: {} }
    )
  }

  createTransport() {
    // stdio is not supported: it executes arbitrary OS commands on the API
    // host (RCE). Any existing stdio servers fail fast with a clear message.
    if (this.config.type === 'stdio') {
      throw new Error('stdio MCP servers are not supported for security reasons — use streamable-http')
    }

    if ((this.config.type === 'sse' || this.config.type === 'streamable-http') && this.config.url) {
      const headers = buildHttpHeaders(this.config)
      return new StreamableHTTPClientTransport(new URL(this.config.url), {
        authProvider: this.config.authProvider,
        requestInit: Object.keys(headers).length ? { headers } : undefined,
      })
    }

    throw new Error(`Unsupported MCP server type: ${this.config.type}`)
  }

  /**
   * The authorization URL from the last OAuth redirect, when connect() threw
   * `UnauthorizedError` because the user must authorize.
   */
  get authorizationUrl(): string | undefined {
    return this.pendingAuthUrl
  }

  async connect(): Promise<void> {
    if (this.connected) return
    if ((this.config.type === 'sse' || this.config.type === 'streamable-http') && this.config.url) {
      await assertSafeUrl(this.config.url).catch(() => {
        throw new Error('MCP server URL points to a blocked/internal address')
      })
    }
    this.transport = this.createTransport()
    try {
      await this.client.connect(this.transport)
    } catch (err) {
      if (err instanceof UnauthorizedError && this.config.authProvider) {
        this.pendingAuthUrl = (this.config.authProvider as { pendingAuthUrl?: string }).pendingAuthUrl
        await this.disconnect().catch(() => {})
        throw err
      }
      throw err
    }
    this.connected = true
  }

  /**
   * Complete an OAuth authorization-code exchange on the active transport.
   * Call after the user returns from the provider's authorize page.
   */
  async finishAuth(authorizationCode: string): Promise<void> {
    if (!this.transport) this.transport = this.createTransport()
    const transport = this.transport as unknown as { finishAuth?: (code: string) => Promise<void> }
    if (!transport?.finishAuth) {
      throw new Error('OAuth is only supported on streamable HTTP transports')
    }
    await transport.finishAuth(authorizationCode)
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return
    try {
      await this.client.close()
    } catch {
      // ignore close errors
    }
    this.connected = false
  }

  async listTools(): Promise<McpTool[]> {
    await this.connect()
    const result = await this.client.listTools()
    return result.tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema as Record<string, unknown> | undefined,
    }))
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    await this.connect()
    const result = await this.client.callTool({ name, arguments: args })
    const content = (result.content as Array<{ type: string; text?: string }> | undefined) ?? []
    const text = content
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('\n')
    if (result.isError) {
      return { error: text || `Tool ${name} returned an error` }
    }
    return { result: text || '(empty response)' }
  }
}

export async function getMcpClient(config: McpServerConfig): Promise<McpClient> {
  const client = new McpClient(config)
  return client
}
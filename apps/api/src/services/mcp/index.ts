import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

export interface McpServerConfig {
  id: string
  name: string
  type: string
  command?: string | null
  args?: string[] | unknown
  url?: string | null
  apiKey?: string | null
}

interface McpTool {
  name: string
  description?: string
  inputSchema?: Record<string, unknown>
}

export class McpClient {
  private client: Client
  private config: McpServerConfig
  private transport: ReturnType<McpClient['createTransport']> | null = null
  private connected = false

  constructor(config: McpServerConfig) {
    this.config = config
    this.client = new Client(
      { name: 'convio-mcp', version: '1.0.0' },
      { capabilities: {} }
    )
  }

  private createTransport() {
    if (this.config.type === 'stdio' && this.config.command) {
      const args = Array.isArray(this.config.args)
        ? this.config.args.map(String)
        : []
      return new StdioClientTransport({
        command: this.config.command,
        args,
      })
    }

    if ((this.config.type === 'sse' || this.config.type === 'streamable-http') && this.config.url) {
      return new StreamableHTTPClientTransport(new URL(this.config.url))
    }

    throw new Error(`Unsupported MCP server type: ${this.config.type}`)
  }

  async connect(): Promise<void> {
    if (this.connected) return
    this.transport = this.createTransport()
    await this.client.connect(this.transport)
    this.connected = true
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

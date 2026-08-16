import { webSearch, type WebSearchResult } from './web-search.js'
import { calculate } from './calculator.js'
import { fetchUrl, type UrlFetchResult } from './url-fetcher.js'
import { getCurrentTime } from './current-time.js'
import { createDbToolHandler } from './db-tool-executor.js'
import type { JsonValue } from '@prisma/client/runtime/client'
import { clientFromServer } from '../mcp/factory.js'

export interface ToolHandler<T = unknown> {
  execute(args: Record<string, unknown>): Promise<T> | T
  schema: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

type ToolRegistry = Record<string, ToolHandler>

export const toolRegistry: ToolRegistry = {
  'web-search': {
    schema: {
      name: 'web-search',
      description: 'Search the web for current information. Use this when you need recent data, news, facts, or anything outside your training cutoff.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query',
          },
        },
        required: ['query'],
      },
    },
    async execute(args) {
      const query = args.query as string
      if (!query) return { error: 'No search query provided' }
      try {
        const results = await webSearch(query)
        return { results }
      } catch (err) {
        return { error: (err as Error).message, results: [] }
      }
    },
  },

  calculator: {
    schema: {
      name: 'calculator',
      description: 'Evaluate a mathematical expression. Supports +, -, *, /, parentheses, exponents (^), and percentages.',
      parameters: {
        type: 'object',
        properties: {
          expression: {
            type: 'string',
            description: 'The mathematical expression to evaluate (e.g., "2 + 2", "(15 * 3) / 5")',
          },
        },
        required: ['expression'],
      },
    },
    execute(args) {
      const expression = args.expression as string
      return calculate(expression)
    },
  },

  'url-fetcher': {
    schema: {
      name: 'url-fetcher',
      description: 'Fetch and extract the text content of a webpage. Returns up to 5000 characters.',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The URL to fetch content from',
          },
        },
        required: ['url'],
      },
    },
    async execute(args) {
      const url = args.url as string
      return fetchUrl(url)
    },
  },

  'current-time': {
    schema: {
      name: 'current-time',
      description: 'Get the current date and time. Optionally specify a timezone (e.g., "America/New_York", "Asia/Karachi", "Europe/London").',
      parameters: {
        type: 'object',
        properties: {
          timezone: {
            type: 'string',
            description: 'IANA timezone name (optional)',
          },
        },
      },
    },
    execute(args) {
      const timezone = args.timezone as string | undefined
      return { datetime: getCurrentTime(timezone) }
    },
  },
}

export function getToolHandler(name: string): ToolHandler | undefined {
  // Normalize: replace underscores with hyphens, lowercase
  const normalized = name.toLowerCase().replace(/_/g, '-')
  return toolRegistry[normalized]
}

export function listTools(): ToolHandler['schema'][] {
  return Object.values(toolRegistry).map((t) => t.schema)
}

interface AgentWithTools {
  widgetConfig: unknown
  tools: Array<{ tool: { id: string; name: string; description: string; type: string; config: unknown; organizationId: string } }>
  mcpServers?: Array<{ mcpServer: {
    id: string
    name: string
    type: string
    command: string | null
    args: JsonValue
    url: string | null
    authType: string | null
    headers: JsonValue
    apiKey: string | null
    enabled: boolean
  } }>
}

export async function loadAgentToolHandlers(
  agentId: string,
  db: {
    agent: {
      findUnique: (args: {
        where: { id: string }
        include: { tools: { include: { tool: boolean } }; mcpServers: { include: { mcpServer: boolean } } }
      }) => Promise<AgentWithTools | null>
    }
  }
): Promise<ToolHandler[]> {
  const agent = await db.agent.findUnique({
    where: { id: agentId },
    include: {
      tools: {
        include: { tool: true },
      },
      mcpServers: {
        include: { mcpServer: true },
      },
    },
  })
  if (!agent) return []

  const handlers: ToolHandler[] = []

  // Load built-in tools from widgetConfig.tools
  const widgetConfig = (agent.widgetConfig || {}) as Record<string, unknown>
  const builtinToolNames = (widgetConfig.tools as string[]) || []
  for (const name of builtinToolNames) {
    const handler = getToolHandler(name)
    if (handler) {
      handlers.push(handler)
    }
  }

  // Load DB tools from AgentTool join table
  for (const at of agent.tools) {
    const dbTool = at.tool as {
      id: string
      name: string
      description: string
      type: string
      config: Record<string, unknown>
      organizationId: string
    }
    const handler = createDbToolHandler(dbTool)
    if (handler) {
      handlers.push(handler)
    }
  }

  // Load MCP tools from linked MCP servers
  if (agent.mcpServers) {
    for (const link of agent.mcpServers) {
      const server = link.mcpServer
      if (!server.enabled) continue
      try {
        const client = clientFromServer(server)
        const mcpTools = await client.listTools()
        for (const tool of mcpTools) {
          handlers.push({
            schema: {
              name: `${server.name}:${tool.name}`,
              description: tool.description || `MCP tool from ${server.name}`,
              parameters: (tool.inputSchema as Record<string, unknown>) || { type: 'object', properties: {} },
            },
            async execute(args) {
              try {
                // Create a fresh client for execution (the connection may have been closed)
                const execClient = clientFromServer(server)
                const result = await execClient.callTool(tool.name, args)
                await execClient.disconnect().catch(() => {})
                return result
              } catch (err) {
                return { error: `MCP tool ${tool.name} failed: ${(err as Error).message}` }
              }
            },
          })
        }
        // Disconnect after listing tools
        await client.disconnect().catch(() => {})
      } catch (err) {
        // Skip tools from this MCP server if it fails to connect
        console.warn(`Failed to load MCP tools from ${server.name}: ${(err as Error).message}`)
      }
    }
  }

  return handlers
}

export async function loadDbToolHandlers(
  prisma: {
    tool: {
      findMany: (args: { where: { id: { in: string[] } } & Record<string, unknown> }) => Promise<Array<{ id: string; name: string; description: string; type: string; config: unknown; organizationId: string }>>
    }
  },
  toolIds: string[],
  extraWhere: Record<string, unknown> = {},
): Promise<Record<string, ToolHandler>> {
  if (toolIds.length === 0) return {}
  const dbTools = await prisma.tool.findMany({
    where: { id: { in: toolIds }, ...extraWhere },
  })
  const handlers: Record<string, ToolHandler> = {}
  for (const dbTool of dbTools) {
    const handler = createDbToolHandler({
      ...dbTool,
      config: dbTool.config as Record<string, unknown>,
    })
    if (handler) {
      handlers[handler.schema.name] = handler
    }
  }
  return handlers
}

import { webSearch, type WebSearchResult } from './web-search.js'
import { calculate } from './calculator.js'
import { fetchUrl, type UrlFetchResult } from './url-fetcher.js'
import { getCurrentTime } from './current-time.js'

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
      const results = await webSearch(query)
      return { results }
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

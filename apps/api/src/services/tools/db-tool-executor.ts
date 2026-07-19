import { webSearch } from './web-search.js'
import { calculate } from './calculator.js'
import { fetchUrl } from './url-fetcher.js'
import { getCurrentTime } from './current-time.js'

interface DbToolRecord {
  id: string
  name: string
  description: string
  type: string
  config: Record<string, unknown>
  organizationId: string
}

export function createDbToolHandler(tool: DbToolRecord): { execute(args: Record<string, unknown>): Promise<unknown> | unknown; schema: { name: string; description: string; parameters: Record<string, unknown> } } | null {
  const { name, description, type, config } = tool

  switch (type) {
    case 'search': {
      return {
        schema: {
          name,
          description: description || 'Search the web for current information.',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'The search query' },
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
      }
    }

    case 'calculator': {
      return {
        schema: {
          name,
          description: description || 'Evaluate a mathematical expression.',
          parameters: {
            type: 'object',
            properties: {
              expression: { type: 'string', description: 'The mathematical expression to evaluate' },
            },
            required: ['expression'],
          },
        },
        execute(args) {
          const expression = args.expression as string
          return calculate(expression)
        },
      }
    }

    case 'url-fetcher': {
      return {
        schema: {
          name,
          description: description || 'Fetch and extract text content from a URL.',
          parameters: {
            type: 'object',
            properties: {
              url: { type: 'string', description: 'The URL to fetch' },
            },
            required: ['url'],
          },
        },
        async execute(args) {
          const url = args.url as string
          return fetchUrl(url)
        },
      }
    }

    case 'current-time': {
      return {
        schema: {
          name,
          description: description || 'Get the current date and time.',
          parameters: {
            type: 'object',
            properties: {
              timezone: { type: 'string', description: 'IANA timezone name (optional)' },
            },
          },
        },
        execute(args) {
          const timezone = args.timezone as string | undefined
          return { datetime: getCurrentTime(timezone) }
        },
      }
    }

    case 'api': {
      const apiUrl = config.url as string | undefined
      const method = (config.method as string) || 'GET'
      const headers = (config.headers as Record<string, string>) || {}
      const bodySchema = config.bodySchema as Record<string, unknown> | undefined

      if (!apiUrl) return null

      return {
        schema: {
          name,
          description: description || 'Make an HTTP request to an external API.',
          parameters: bodySchema || {
            type: 'object',
            properties: {},
            description: 'Parameters for the API request',
          },
        },
        async execute(args) {
          try {
            const fetchOptions: RequestInit = {
              method,
              headers: {
                'Content-Type': 'application/json',
                ...headers,
              },
            }

            if (method !== 'GET' && method !== 'HEAD') {
              const body = bodySchema ? args : {}
              if (Object.keys(body as Record<string, unknown>).length > 0) {
                fetchOptions.body = JSON.stringify(body)
              }
            }

            const controller = new AbortController()
            const timeout = setTimeout(() => controller.abort(), 15000)
            fetchOptions.signal = controller.signal

            const res = await fetch(apiUrl, fetchOptions)
            clearTimeout(timeout)

            const contentType = res.headers.get('content-type') || ''
            let data: unknown
            if (contentType.includes('application/json')) {
              data = await res.json()
            } else {
              data = await res.text()
            }

            return {
              status: res.status,
              statusText: res.statusText,
              data,
            }
          } catch (err) {
            return {
              error: `API request failed: ${(err as Error).message}`,
            }
          }
        },
      }
    }

    case 'custom': {
      const webhookUrl = config.webhookUrl as string | undefined
      const parameters = config.parameters as Record<string, unknown> | undefined

      if (!webhookUrl) return null

      return {
        schema: {
          name,
          description: description || 'Custom tool via webhook.',
          parameters: parameters || {
            type: 'object',
            properties: {},
          },
        },
        async execute(args) {
          try {
            const controller = new AbortController()
            const timeout = setTimeout(() => controller.abort(), 30000)
            const res = await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(args),
              signal: controller.signal,
            })
            clearTimeout(timeout)

            const contentType = res.headers.get('content-type') || ''
            let data: unknown
            if (contentType.includes('application/json')) {
              data = await res.json()
            } else {
              data = await res.text()
            }

            return { status: res.status, data }
          } catch (err) {
            return { error: `Webhook call failed: ${(err as Error).message}` }
          }
        },
      }
    }

    default:
      return null
  }
}

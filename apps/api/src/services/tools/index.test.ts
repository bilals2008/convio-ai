import { describe, it, expect } from 'vitest'
import { getToolHandler, toolRegistry } from './index.js'
import { createDbToolHandler } from './db-tool-executor.js'

describe('Built-in tool registry', () => {
  it('has all 4 tools registered', () => {
    const names = Object.keys(toolRegistry)
    expect(names).toContain('web-search')
    expect(names).toContain('calculator')
    expect(names).toContain('url-fetcher')
    expect(names).toContain('current-time')
    expect(names.length).toBe(4)
  })

  it('getToolHandler normalizes names with underscores', () => {
    const handler = getToolHandler('web_search')
    expect(handler).toBeDefined()
    expect(handler?.schema.name).toBe('web-search')
  })

  it('getToolHandler normalizes mixed case', () => {
    const handler = getToolHandler('Web-Search')
    expect(handler).toBeDefined()
    expect(handler?.schema.name).toBe('web-search')
  })

  it('getToolHandler returns undefined for unknown tool', () => {
    expect(getToolHandler('nonexistent')).toBeUndefined()
  })

  it('getToolHandler returns undefined for empty string', () => {
    expect(getToolHandler('')).toBeUndefined()
  })
})

describe('Calculator tool', () => {
  it('adds two numbers', () => {
    const result = toolRegistry.calculator.execute({ expression: '2 + 3' })
    expect(result).toEqual({ result: 5 })
  })

  it('handles complex expressions', () => {
    const result = toolRegistry.calculator.execute({ expression: '(15 * 3) / 5 + 2' })
    expect(result).toEqual({ result: 11 })
  })

  it('handles exponents', () => {
    const result = toolRegistry.calculator.execute({ expression: '2 ^ 10' })
    expect(result).toEqual({ result: 1024 })
  })

  it('rejects invalid characters', () => {
    const result = toolRegistry.calculator.execute({ expression: '2 + alert("x")' })
    expect(result).toHaveProperty('error')
  })

  it('returns error for empty expression', () => {
    const result = toolRegistry.calculator.execute({ expression: '' })
    expect(result).toHaveProperty('error')
  })

  it('returns error when no expression provided', () => {
    const result = toolRegistry.calculator.execute({})
    expect(result).toHaveProperty('error')
  })

  it('returns error for division by zero', () => {
    const result = toolRegistry.calculator.execute({ expression: '1 / 0' })
    expect(result).toHaveProperty('error')
  })

  it('handles multiplication', () => {
    const result = toolRegistry.calculator.execute({ expression: '4 * 5' })
    expect(result).toEqual({ result: 20 })
  })
})

describe('Current-time tool', () => {
  it('returns a datetime string', () => {
    const result = toolRegistry['current-time'].execute({}) as { datetime: string }
    expect(result.datetime).toBeTruthy()
    expect(typeof result.datetime).toBe('string')
  })

  it('returns datetime containing current year', () => {
    const result = toolRegistry['current-time'].execute({}) as { datetime: string }
    const currentYear = new Date().getFullYear().toString()
    expect(result.datetime).toContain(currentYear)
  })

  it('handles valid timezone', () => {
    const result = toolRegistry['current-time'].execute({ timezone: 'Asia/Karachi' }) as { datetime: string }
    expect(result.datetime).toBeTruthy()
  })

  it('handles invalid timezone gracefully', () => {
    const result = toolRegistry['current-time'].execute({ timezone: 'Invalid/Zone' }) as { datetime: string }
    expect(result.datetime).toBeTruthy()
  })
})

describe('DB tool executor', () => {
  const baseTool = {
    id: 'test-id',
    name: 'test-tool',
    description: 'A test tool',
    organizationId: 'org-id',
  }

  describe('api type', () => {
    it('returns null when no URL is configured', () => {
      const handler = createDbToolHandler({
        ...baseTool,
        name: 'my-api',
        type: 'api',
        config: {},
      })
      expect(handler).toBeNull()
    })

    it('creates handler with proper schema when URL is configured', () => {
      const handler = createDbToolHandler({
        ...baseTool,
        name: 'my-api',
        type: 'api',
        config: { url: 'https://api.example.com/data', method: 'GET' },
      })
      expect(handler).toBeDefined()
      expect(handler!.schema.name).toBe('my-api')
      expect(handler!.schema.description).toBeTruthy()
    })

    it('returns error for unreachable API', async () => {
      const handler = createDbToolHandler({
        ...baseTool,
        name: 'bad-api',
        type: 'api',
        config: { url: 'https://nonexistent.example.com/api', method: 'GET' },
      })
      expect(handler).toBeDefined()
      const result = await handler!.execute({})
      expect(result).toHaveProperty('error')
      expect((result as { error: string }).error).toContain('API request failed')
    })
  })

  describe('custom type', () => {
    it('returns null when no webhookUrl is configured', () => {
      const handler = createDbToolHandler({
        ...baseTool,
        name: 'my-custom',
        type: 'custom',
        config: {},
      })
      expect(handler).toBeNull()
    })

    it('creates handler with proper schema', () => {
      const handler = createDbToolHandler({
        ...baseTool,
        name: 'my-custom',
        type: 'custom',
        config: {
          webhookUrl: 'https://hooks.example.com/trigger',
          parameters: {
            type: 'object',
            properties: { query: { type: 'string' } },
            required: ['query'],
          },
        },
      })
      expect(handler).toBeDefined()
      expect(handler!.schema.name).toBe('my-custom')
      expect(handler!.schema.parameters).toBeDefined()
    })
  })

  describe('search type', () => {
    it('creates handler that requires a query', async () => {
      const handler = createDbToolHandler({
        ...baseTool,
        name: 'my-search',
        type: 'search',
        config: {},
      })
      expect(handler).toBeDefined()
      expect(handler!.schema.name).toBe('my-search')
      expect(handler!.schema.parameters).toHaveProperty('required')
      expect((handler!.schema.parameters as { required: string[] }).required).toContain('query')

      const result = await handler!.execute({})
      expect(result).toHaveProperty('error')
    })
  })

  describe('calculator type', () => {
    it('maps to calculator behavior', async () => {
      const handler = createDbToolHandler({
        ...baseTool,
        name: 'my-calc',
        type: 'calculator',
        config: {},
      })
      expect(handler).toBeDefined()
      const result = await handler!.execute({ expression: '2 + 2' })
      expect(result).toEqual({ result: 4 })
    })
  })

  describe('current-time type', () => {
    it('maps to current-time behavior', async () => {
      const handler = createDbToolHandler({
        ...baseTool,
        name: 'my-time',
        type: 'current-time',
        config: {},
      })
      expect(handler).toBeDefined()
      const result = await handler!.execute({}) as { datetime: string }
      expect(result.datetime).toBeTruthy()
    })
  })

  describe('url-fetcher type', () => {
    it('creates handler that requires a URL', async () => {
      const handler = createDbToolHandler({
        ...baseTool,
        name: 'my-fetcher',
        type: 'url-fetcher',
        config: {},
      })
      expect(handler).toBeDefined()
      expect(handler!.schema.name).toBe('my-fetcher')

      const result = await handler!.execute({})
      expect(result).toHaveProperty('error')
    })
  })

  describe('unknown type', () => {
    it('returns null for unknown type', () => {
      const handler = createDbToolHandler({
        ...baseTool,
        name: 'unknown',
        type: 'unknown-type',
        config: {},
      })
      expect(handler).toBeNull()
    })
  })
})

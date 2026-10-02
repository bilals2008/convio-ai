import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  findProfiles: vi.fn(),
  findAgent: vi.fn(),
  getMembership: vi.fn(),
}))

vi.mock('@convio/database', () => ({
  prisma: {
    conversation: { findMany: mocks.findMany },
    profile: { findMany: mocks.findProfiles },
    agent: { findUnique: mocks.findAgent },
  },
  Prisma: {},
}))

import conversationsRoutes from './routes.js'

describe('conversation list pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.findProfiles.mockResolvedValue([])
  })

  it('requests one extra row and scopes the list to the selected organization', async () => {
    const rows = Array.from({ length: 21 }, (_, index) => ({
      id: `conversation-${index}`,
      userId: null,
      contactName: null,
      agentId: 'agent-1',
      channel: 'web',
      status: 'active',
      updatedAt: new Date(2026, 0, index + 1),
      agent: { id: 'agent-1', name: 'Agent', avatar: null },
      messages: [],
    }))
    mocks.findMany.mockResolvedValue(rows)

    const handlers = new Map<string, (request: never) => Promise<unknown>>()
    const fastify = {
      authenticate: vi.fn(),
      getMembership: mocks.getMembership,
      get: vi.fn((path: string, _options: unknown, handler: (request: never) => Promise<unknown>) => {
        handlers.set(path, handler)
      }),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    }

    await conversationsRoutes(fastify as never)
    const handler = handlers.get('/conversations')
    expect(handler).toBeDefined()

    const result = await handler!({
      userId: 'user-1',
      query: { organizationId: 'org-1', limit: 20 },
    } as never) as { data: unknown[]; nextCursor: string | null }

    expect(mocks.getMembership).toHaveBeenCalledWith('user-1', 'org-1')
    expect(mocks.findMany).toHaveBeenCalledWith(expect.objectContaining({
      take: 21,
      where: { agent: { organizationId: 'org-1' } },
    }))
    expect(result.data).toHaveLength(20)
    expect(result.nextCursor).toBe('conversation-19')
  })

  it('uses the same identity fallback for agent-scoped conversation lists', async () => {
    mocks.findAgent.mockResolvedValue({ organizationId: 'org-1' })
    mocks.findMany.mockResolvedValue([
      { id: 'conversation-1', userId: 'missing-profile', contactName: 'Returning visitor', contactPhone: null, channel: 'web', agentId: 'agent-1', status: 'active', updatedAt: new Date(), messages: [] },
    ])

    const handlers = new Map<string, (request: never) => Promise<unknown>>()
    const fastify = {
      authenticate: vi.fn(),
      getMembership: mocks.getMembership,
      get: vi.fn((path: string, _options: unknown, handler: (request: never) => Promise<unknown>) => {
        handlers.set(path, handler)
      }),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    }

    await conversationsRoutes(fastify as never)
    const handler = handlers.get('/agents/:agentId/conversations')
    const result = await handler!({
      userId: 'user-1',
      params: { agentId: 'agent-1' },
      query: { limit: 20 },
    } as never) as { data: Array<{ userName?: string; displayName: string }> }

    expect(result.data[0]).toMatchObject({ userName: 'Returning visitor', displayName: 'Returning visitor' })
  })

  it('resolves identity from profile, contact, and privacy-safe channel fallbacks', async () => {
    mocks.findMany.mockResolvedValue([
      { id: 'named', userId: 'profile-1', contactName: null, contactPhone: null, channel: 'web', agentId: 'agent-1', status: 'active', updatedAt: new Date(), agent: { id: 'agent-1', name: 'Agent', avatar: null }, messages: [] },
      { id: 'contact', userId: 'missing-profile', contactName: '  Known contact  ', contactPhone: null, channel: 'whatsapp', agentId: 'agent-1', status: 'active', updatedAt: new Date(), agent: { id: 'agent-1', name: 'Agent', avatar: null }, messages: [] },
      { id: 'blank-profile', userId: 'profile-blank', contactName: 'Profile fallback', contactPhone: null, channel: 'web', agentId: 'agent-1', status: 'active', updatedAt: new Date(), agent: { id: 'agent-1', name: 'Agent', avatar: null }, messages: [] },
      { id: 'whatsapp', userId: null, contactName: ' ', contactPhone: '+1 (415) 555-0198', channel: 'whatsapp', agentId: 'agent-1', status: 'active', updatedAt: new Date(), agent: { id: 'agent-1', name: 'Agent', avatar: null }, messages: [] },
      { id: 'website', userId: null, contactName: null, contactPhone: null, channel: 'web', agentId: 'agent-1', status: 'active', updatedAt: new Date(), agent: { id: 'agent-1', name: 'Agent', avatar: null }, messages: [] },
    ])
    mocks.findProfiles.mockResolvedValue([
      { id: 'profile-1', name: '  Sam Lee  ' },
      { id: 'profile-blank', name: '   ' },
    ])

    const handlers = new Map<string, (request: never) => Promise<unknown>>()
    const fastify = {
      authenticate: vi.fn(),
      getMembership: mocks.getMembership,
      get: vi.fn((path: string, _options: unknown, handler: (request: never) => Promise<unknown>) => {
        handlers.set(path, handler)
      }),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    }

    await conversationsRoutes(fastify as never)
    const handler = handlers.get('/conversations')
    const result = await handler!({
      userId: 'user-1',
      query: { organizationId: 'org-1', limit: 20 },
    } as never) as { data: Array<{ id: string; userName?: string; displayName: string }> }

    expect(result.data.map(({ id, userName, displayName }) => ({ id, userName, displayName }))).toEqual([
      { id: 'named', userName: 'Sam Lee', displayName: 'Sam Lee' },
      { id: 'contact', userName: 'Known contact', displayName: 'Known contact' },
      { id: 'blank-profile', userName: 'Profile fallback', displayName: 'Profile fallback' },
      { id: 'whatsapp', userName: undefined, displayName: 'WhatsApp · •••• 0198' },
      { id: 'website', userName: undefined, displayName: 'Website visitor' },
    ])
  })
})

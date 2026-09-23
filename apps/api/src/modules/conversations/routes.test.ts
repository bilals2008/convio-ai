import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  findProfiles: vi.fn(),
  getMembership: vi.fn(),
}))

vi.mock('@convio/database', () => ({
  prisma: {
    conversation: { findMany: mocks.findMany },
    profile: { findMany: mocks.findProfiles },
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
})

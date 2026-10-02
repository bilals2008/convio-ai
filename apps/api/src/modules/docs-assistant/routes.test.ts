import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  retrieveDocs: vi.fn(),
  resolveDocsModel: vi.fn(),
  getDocsIndexStatus: vi.fn(),
  getDocsAssistantConfig: vi.fn(),
  saveDocsAssistantConfig: vi.fn(),
  toCitations: vi.fn(),
  listModels: vi.fn(),
}))

vi.mock('@convio/database', () => ({
  prisma: { docsAssistantConfig: { findUnique: mocks.findUnique } },
}))

vi.mock('../../services/docs-corpus.js', () => ({
  getDocsIndexStatus: mocks.getDocsIndexStatus,
  retrieveDocs: mocks.retrieveDocs,
  toCitations: mocks.toCitations,
}))

vi.mock('./service.js', () => ({
  getDocsAssistantConfig: mocks.getDocsAssistantConfig,
  resolveDocsModel: mocks.resolveDocsModel,
  saveDocsAssistantConfig: mocks.saveDocsAssistantConfig,
}))

vi.mock('../../services/encryption.js', () => ({
  decryptSecret: vi.fn(),
  getEncryptionKey: vi.fn(),
}))

vi.mock('@convio/ai/providers', () => ({
  getProviderById: vi.fn(() => ({ listModels: mocks.listModels })),
}))

import docsAssistantRoutes from './routes.js'

function makeResponse() {
  const writes: string[] = []
  const raw = {
    writableEnded: false,
    writeHead: vi.fn(),
    flushHeaders: vi.fn(),
    write: vi.fn((chunk: string) => writes.push(chunk)),
    end: vi.fn(() => {
      raw.writableEnded = true
    }),
    once: vi.fn(),
  }
  const reply = {
    hijack: vi.fn(),
    raw,
    code: vi.fn().mockReturnThis(),
    send: vi.fn(),
  }
  return { reply, raw, writes }
}

async function getRouteHandlers() {
  const handlers = new Map<string, (request: unknown, reply: unknown) => Promise<unknown>>()
  const fastify = {
    optionalAuth: vi.fn(),
    authenticate: vi.fn(),
    authenticateSensitive: vi.fn(),
    ensurePlatformAdmin: vi.fn(),
    config: { CORS_ORIGIN: '*' },
    post: vi.fn((path: string, _options: unknown, routeHandler: (request: unknown, reply: unknown) => Promise<unknown>) => {
      handlers.set(path, routeHandler)
    }),
    get: vi.fn(),
    put: vi.fn(),
  }
  await docsAssistantRoutes(fastify as never)
  return handlers
}

describe('docs assistant casual messages', () => {
  beforeEach(() => vi.clearAllMocks())

  it.each(['hi', ' Hello! ', 'hey there', 'good morning', 'thanks', 'Thank you so much.'])(
    'answers standalone casual message %s without retrieval or model setup',
    async (question) => {
      const handlers = await getRouteHandlers()
      const handler = handlers.get('/docs/assistant/stream')!
      const { reply, writes, raw } = makeResponse()

      await handler({ body: { question }, headers: {}, raw: { once: vi.fn() } }, reply)

      expect(mocks.retrieveDocs).not.toHaveBeenCalled()
      expect(mocks.resolveDocsModel).not.toHaveBeenCalled()
      expect(reply.hijack).toHaveBeenCalledOnce()
      expect(raw.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({
        'Content-Type': 'text/event-stream',
      }))
      expect(writes.slice(0, -1).map((event) => JSON.parse(event.slice(6).trim()))).toEqual([
        { type: 'sources', sources: [] },
        { type: 'text', content: 'Hi! What can I help you with in Convio?' },
        { type: 'done' },
      ])
      expect(writes.at(-1)).toBe('data: [DONE]\n\n')
      expect(raw.end).toHaveBeenCalledOnce()
    },
  )

  it('retrieves docs when a greeting is followed by a Convio question', async () => {
    const handlers = await getRouteHandlers()
    const handler = handlers.get('/docs/assistant/stream')!
    const { reply } = makeResponse()
    mocks.resolveDocsModel.mockResolvedValue({ provider: { stream: vi.fn() }, model: 'test-model' })
    mocks.retrieveDocs.mockResolvedValue([])
    mocks.toCitations.mockReturnValue([])

    await handler({
      body: { question: 'Hi, how do I connect WhatsApp?' },
      headers: {},
      raw: { once: vi.fn() },
    }, reply)

    expect(mocks.retrieveDocs).toHaveBeenCalledWith('Hi, how do I connect WhatsApp?', { currentSlug: undefined })
    expect(mocks.resolveDocsModel).toHaveBeenCalledOnce()
  })

  it('lists models from the selected provider using the supplied draft key', async () => {
    const handlers = await getRouteHandlers()
    const handler = handlers.get('/admin/docs-assistant/models')!
    mocks.listModels.mockResolvedValue([
      { id: 'model-current', name: 'Current model', provider: 'openrouter', maxTokens: 1000 },
    ])

    const result = await handler({ body: { provider: 'openrouter', apiKey: 'draft-secret' } }, makeResponse().reply)

    expect(mocks.listModels).toHaveBeenCalledWith('draft-secret')
    expect(result).toEqual({ data: [{ id: 'model-current', name: 'Current model' }] })
  })
})

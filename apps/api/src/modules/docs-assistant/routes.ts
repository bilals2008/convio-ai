import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { Usage } from '@convio/ai'
import { z } from 'zod'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { getCorsHeaders } from '../../plugins/cors.js'
import { createRequestSignal } from '../../services/concurrency.js'
import {
  getDocsIndexStatus,
  retrieveDocs,
  toCitations,
  type DocsSource,
} from '../../services/docs-corpus.js'
import {
  getDocsAssistantConfig,
  resolveDocsModel,
  saveDocsAssistantConfig,
} from './service.js'
import { getProviderById } from '@convio/ai/providers'
import { decryptSecret, getEncryptionKey } from '../../services/encryption.js'
import {
  buildDocsSystemPrompt,
  buildHistoryMessages,
  DOCS_NOT_FOUND_MESSAGE,
} from './prompts.js'

const isDev = process.env.NODE_ENV !== 'production'

const SUPPORTED_PROVIDERS = [
  'openai',
  'anthropic',
  'google',
  'groq',
  'openrouter',
  'mistral',
  'together',
  'deepseek',
  'perplexity',
  'agnes',
  'opencode',
  'local',
] as const

const TEST_ENDPOINTS: Record<string, string> = {
  openai: 'https://api.openai.com/v1/models',
  anthropic: 'https://api.anthropic.com/v1/models',
  google: 'https://generativelanguage.googleapis.com/v1beta/models',
  groq: 'https://api.groq.com/openai/v1/models',
  openrouter: 'https://openrouter.ai/api/v1/models',
  mistral: 'https://api.mistral.ai/v1/models',
  together: 'https://api.together.xyz/v1/models',
  deepseek: 'https://api.deepseek.com/v1/models',
  perplexity: 'https://api.perplexity.ai/models',
  agnes: 'https://apihub.agnes-ai.com/v1/models',
  opencode: 'https://opencode.ai/zen/v1/models',
}

async function testProviderKey(provider: string, apiKey: string) {
  const url = TEST_ENDPOINTS[provider]
  if (!url) return { ok: false, message: `No automatic test available for ${provider}` }

  let headers: Record<string, string> = {}
  let target = url
  if (provider === 'google') {
    target = `${url}?key=${encodeURIComponent(apiKey)}`
  } else if (provider === 'anthropic') {
    headers = { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }
  } else {
    headers = { Authorization: `Bearer ${apiKey}` }
  }

  try {
    const res = await fetch(target, { headers, signal: AbortSignal.timeout(10_000) })
    if (res.ok) return { ok: true, message: 'Key is valid' }
    if (res.status === 404) return { ok: false, message: 'Cannot verify automatically for this provider' }
    return { ok: false, message: `Provider rejected the key (HTTP ${res.status})` }
  } catch {
    return { ok: false, message: 'Provider unreachable. Try again.' }
  }
}

const configBodySchema = z.object({
  provider: z.enum(SUPPORTED_PROVIDERS as unknown as [string, ...string[]]),
  model: z.string().min(1).max(200),
  apiKey: z.string().min(1).max(500).optional(),
})

const streamBodySchema = z.object({
  question: z.string().min(1).max(1000),
  slug: z.string().max(200).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(4000),
      }),
    )
    .max(8)
    .optional(),
})

type WireChunk =
  | { type: 'sources'; sources: DocsSource[] }
  | { type: 'text'; content: string }
  | { type: 'reasoning'; content: string }
  | { type: 'done'; usage?: Usage }
  | { type: 'error'; content: string }

const CASUAL_MESSAGES = new Set([
  'hi',
  'hi there',
  'hello',
  'hello there',
  'hey',
  'hey there',
  'howdy',
  'good morning',
  'good afternoon',
  'good evening',
  'thanks',
  'thank you',
  'thanks a lot',
  'thank you so much',
])

function isCasualMessage(question: string): boolean {
  const normalized = question.toLowerCase().trim().replace(/[.!?,]+$/g, '').replace(/\s+/g, ' ')
  return CASUAL_MESSAGES.has(normalized)
}

function startSse(reply: FastifyReply, fastify: FastifyInstance, request: FastifyRequest) {
  reply.hijack()
  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
    ...getCorsHeaders(fastify.config.CORS_ORIGIN, request),
  })
  reply.raw.flushHeaders()

  return {
    write: (payload: WireChunk) => reply.raw.write(`data: ${JSON.stringify(payload)}\n\n`),
    finish: () => {
      if (reply.raw.writableEnded) return
      reply.raw.write('data: [DONE]\n\n')
      reply.raw.end()
    },
  }
}

export default async function docsAssistantRoutes(fastify: FastifyInstance) {
  // Public: docs are open to everyone, so the assistant is too. It is kept
  // inexpensive and anonymous — no conversation persistence, no personal data —
  // and gated by the per-IP rate limiter plus tight input caps below.
  fastify.post(
    '/docs/assistant/stream',
    {
      preHandler: [fastify.optionalAuth, validate({ body: streamBodySchema })],
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
    },
    async (request, reply) => {
      const { question, slug, history } = request.body as z.infer<typeof streamBodySchema>

      if (isCasualMessage(question)) {
        const sse = startSse(reply, fastify, request)
        sse.write({ type: 'sources', sources: [] })
        sse.write({ type: 'text', content: 'Hi! What can I help you with in Convio?' })
        sse.write({ type: 'done' })
        sse.finish()
        return
      }

      let resolved
      try {
        resolved = await resolveDocsModel()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Assistant is not configured'
        return reply.code(503).send({ error: message })
      }

      const sources = await retrieveDocs(question, { currentSlug: slug }).catch(() => [])
      const citations = toCitations(sources)

      const sse = startSse(reply, fastify, request)
      const { write, finish } = sse

      write({ type: 'sources', sources: citations })

      // No relevant context: answer the refusal locally instead of spending a
      // model call on a question the docs simply don't cover.
      if (sources.length === 0) {
        write({ type: 'text', content: DOCS_NOT_FOUND_MESSAGE })
        write({ type: 'done' })
        finish()
        return
      }

      const signal = createRequestSignal((cb) => request.raw.once('close', cb))

      try {
        const stream = resolved.provider.stream({
          model: resolved.model,
          messages: [
            { role: 'system', content: buildDocsSystemPrompt(sources) },
            ...buildHistoryMessages(history ?? [], question),
          ],
          temperature: 0.2,
          maxTokens: 1024,
          apiKey: resolved.apiKey,
          signal,
        })

        let usage: Usage | undefined
        for await (const chunk of stream) {
          if (chunk.type === 'text' && chunk.content) {
            write({ type: 'text', content: chunk.content })
          } else if (chunk.type === 'reasoning' && chunk.content) {
            write({ type: 'reasoning', content: chunk.content })
          } else if (chunk.type === 'done') {
            usage = chunk.usage
            break
          }
        }

        write({ type: 'done', usage })
      } catch (err) {
        const raw = err instanceof Error ? err.message : 'Generation failed'
        const content = isDev ? raw : 'Generation failed. Please try again.'
        write({ type: 'error', content })
      } finally {
        finish()
      }
    },
  )

  fastify.get(
    '/docs/assistant/status',
    { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } },
    async () => {
      const status = await getDocsIndexStatus()
      return { data: status }
    },
  )

  const adminGuard = { preHandler: [fastify.authenticateSensitive, fastify.ensurePlatformAdmin] }

  // Admin panel config: which provider + model + key answer docs questions.
  fastify.get('/admin/docs-assistant/config', adminGuard, async () => {
    return { data: await getDocsAssistantConfig() }
  })

  fastify.post(
    '/admin/docs-assistant/models',
    { preHandler: [fastify.authenticateSensitive, fastify.ensurePlatformAdmin, validate({ body: z.object({ provider: z.enum(SUPPORTED_PROVIDERS as unknown as [string, ...string[]]), apiKey: z.string().max(500).optional() }) })], config: { rateLimit: { max: 20, timeWindow: '1 minute' } } },
    async (request, reply) => {
      const { provider: providerId, apiKey } = request.body as { provider: string; apiKey?: string }
      const provider = getProviderById(providerId)
      if (!provider) return reply.code(400).send({ error: 'Unsupported provider' })

      let key = apiKey
      if (!key) {
        const config = await prisma.docsAssistantConfig.findUnique({ where: { id: 'default' } })
        if (config?.provider === providerId && config.apiKey) {
          key = decryptSecret(config.apiKey, getEncryptionKey())
        }
      }

      try {
        const models = await provider.listModels(key)
        return { data: models.map(({ id, name }) => ({ id, name })) }
      } catch {
        return reply.code(502).send({ error: 'Unable to load models from this provider' })
      }
    },
  )

  fastify.put(
    '/admin/docs-assistant/config',
    { preHandler: [fastify.authenticateSensitive, fastify.ensurePlatformAdmin, validate({ body: configBodySchema })] },
    async (request) => {
      const body = request.body as z.infer<typeof configBodySchema>
      return {
        data: await saveDocsAssistantConfig({
          provider: body.provider,
          model: body.model,
          apiKey: body.apiKey,
          updatedById: request.userId,
        }),
      }
    },
  )

  fastify.post(
    '/admin/docs-assistant/config/test',
    { preHandler: [fastify.authenticateSensitive, fastify.ensurePlatformAdmin, validate({ body: configBodySchema })] },
    async (request) => {
      const { provider, apiKey } = request.body as z.infer<typeof configBodySchema>

      let key = apiKey
      if (!key) {
        const config = await prisma.docsAssistantConfig.findUnique({ where: { id: 'default' } })
        if (config?.apiKey) key = decryptSecret(config.apiKey, getEncryptionKey())
      }
      if (!key) return { data: { ok: false, message: 'No API key set' } }

      return { data: await testProviderKey(provider, key) }
    },
  )
}

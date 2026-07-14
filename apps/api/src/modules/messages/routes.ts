import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { AppError } from '../../plugins/error.js'
import { getProviderForModel } from '@convio/ai/providers'
import { getCorsHeaders } from '../../plugins/cors.js'
import { retrieveContext } from '../../services/processor.js'
import { z } from 'zod'

const convParamsSchema = z.object({
  id: z.string().uuid(),
})

const messageParamsSchema = z.object({
  id: z.string().uuid(),
})

const messagesQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
})

const createMessageBodySchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(10000),
  stream: z.boolean().optional(),
})

const updateMessageBodySchema = z.object({
  content: z.string().min(1).max(10000).optional(),
  metadata: z.record(z.unknown()).optional(),
})

const widgetMessageBodySchema = z.object({
  content: z.string().min(1).max(10000),
})

async function getConversationOrgId(conversationId: string): Promise<string> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { agent: { select: { organizationId: true } } },
  })

  if (!conversation) {
    throw new AppError(404, 'Conversation not found')
  }

  return conversation.agent.organizationId
}

export default async function messagesRoutes(fastify: FastifyInstance) {
  // POST /api/conversations/:id/messages — Add message (protected, member only)
  fastify.post('/conversations/:id/messages', {
    preHandler: [
      fastify.authenticate,
      validate({ params: convParamsSchema, body: createMessageBodySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { role, content } = request.body as { role: 'user' | 'assistant'; content: string }

    const orgId = await getConversationOrgId(id)
    await fastify.getMembership(request.userId!, orgId)

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: { conversationId: id, role, content, status: 'sent' },
      }),
      prisma.conversation.update({
        where: { id },
        data: { status: 'active' },
      }),
    ])

    return { data: message }
  })

  // POST /api/conversations/:id/messages/stream — Generate AI response via SSE
  fastify.post('/conversations/:id/messages/stream', {
    preHandler: [
      fastify.authenticate,
      validate({ params: convParamsSchema, body: createMessageBodySchema }),
    ],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { content } = request.body as { role: string; content: string; stream?: boolean }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: {
        agent: {
          select: {
            organizationId: true,
            model: true,
            systemPrompt: true,
            temperature: true,
            maxTokens: true,
            providerKeyId: true,
            knowledgeBaseId: true,
          },
        },
      },
    })

    if (!conversation) throw new AppError(404, 'Conversation not found')

    const orgId = conversation.agent.organizationId
    await fastify.getMembership(request.userId!, orgId)

    const agent = conversation.agent

    if (!agent) {
      throw new AppError(400, 'Conversation has no agent configured')
    }

    if (!agent.model) {
      throw new AppError(400, 'Agent has no model configured')
    }

    const historyPromise = prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { role: true, content: true },
    })

    const contextPromise = agent.knowledgeBaseId
      ? retrieveContext(content, agent.knowledgeBaseId).catch((err: unknown) => {
          request.log.warn({ err }, 'RAG retrieval failed, falling back to base prompt')
          return null
        })
      : Promise.resolve(null)
    const providerKeyPromise = agent.providerKeyId
      ? prisma.providerKey.findFirst({
          where: { id: agent.providerKeyId, organizationId: agent.organizationId },
          select: { apiKey: true },
        })
      : Promise.resolve(null)

    const [historyDesc, context, providerKey] = await Promise.all([
      historyPromise,
      contextPromise,
      providerKeyPromise,
    ])
    const history = historyDesc.reverse()
    const systemContext = context
      ? `${agent.systemPrompt}\n\n## Retrieved knowledge (RAG)\nUse the following source excerpts to answer. Prefer this context over general knowledge when relevant. If the context does not contain the answer, say you do not have that information in the knowledge base.\n\n${context}`
      : agent.systemPrompt

    const aiMessages = [
      { role: 'system' as const, content: systemContext },
      ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ]

    let provider
    try {
      provider = getProviderForModel(agent.model)
    } catch {
      throw new AppError(400, `No provider configured for model: ${agent.model}`)
    }

    const apiKey = providerKey?.apiKey

    reply.hijack()

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      ...getCorsHeaders(fastify.config.CORS_ORIGIN, request),
    })
    reply.raw.flushHeaders()

    let clientDisconnected = false
    request.raw.once('close', () => {
      clientDisconnected = true
    })

    let fullResponse = ''

    try {
      const stream = provider.stream({
        model: agent.model,
        messages: aiMessages,
        temperature: agent.temperature ?? 0.7,
        maxTokens: agent.maxTokens ?? 2048,
        apiKey,
      })

      for await (const chunk of stream) {
        if (clientDisconnected) break
        if (chunk.type === 'reasoning' && chunk.content) {
          reply.raw.write(`data: ${JSON.stringify({ type: 'reasoning', content: chunk.content })}\n\n`)
        } else if (chunk.content) {
          fullResponse += chunk.content
          reply.raw.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`)
        }
        if (chunk.type === 'done') break
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'AI generation failed'
      if (!clientDisconnected) {
        reply.raw.write(`data: ${JSON.stringify({ error: msg })}\n\n`)
        reply.raw.write('data: [DONE]\n\n')
        reply.raw.end()
      }
      return
    }

    if (fullResponse) {
      await prisma.message.create({
        data: { conversationId: id, role: 'assistant', content: fullResponse, status: 'sent' },
      })

      try {
        fastify.supabase.channel(`conversation:${id}`).send({
          type: 'broadcast',
          event: 'message',
          payload: {},
        })
      } catch {}
    }

    if (!clientDisconnected) {
      reply.raw.write('data: [DONE]\n\n')
      reply.raw.end()
    }
  })

  // GET /api/conversations/:id/messages — List messages (protected, member only, paginated, oldest-first)
  fastify.get('/conversations/:id/messages', {
    preHandler: [
      fastify.authenticate,
      validate({ params: convParamsSchema, query: messagesQuerySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { cursor, limit } = request.query as { cursor?: string; limit: number }

    const orgId = await getConversationOrgId(id)
    await fastify.getMembership(request.userId!, orgId)

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'asc' },
    })

    const hasNextPage = messages.length > limit
    const items = hasNextPage ? messages.slice(0, limit) : messages

    return {
      data: items,
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    }
  })

  // PATCH /api/messages/:id — Edit message content or metadata (protected, admin only)
  fastify.patch('/messages/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: messageParamsSchema, body: updateMessageBodySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        conversation: { include: { agent: { select: { organizationId: true } } } },
      },
    })

    if (!message) throw new AppError(404, 'Message not found')

    await fastify.ensureAdmin(request.userId!, message.conversation.agent.organizationId)

    const updated = await prisma.message.update({
      where: { id },
      data: request.body as any,
    })

    return { data: updated }
  })

  // DELETE /api/messages/:id — Delete message (protected, admin only)
  fastify.delete('/messages/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: messageParamsSchema }),
    ],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        conversation: { include: { agent: { select: { organizationId: true } } } },
      },
    })

    if (!message) throw new AppError(404, 'Message not found')

    await fastify.ensureAdmin(request.userId!, message.conversation.agent.organizationId)

    await prisma.message.delete({ where: { id } })
    reply.code(204).send()
  })

  // POST /api/widget/conversations/:id/messages — Widget message (public, rate-limited)
  fastify.post('/widget/conversations/:id/messages', {
    preHandler: [validate({ params: convParamsSchema, body: widgetMessageBodySchema })],
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { content } = request.body as { content: string }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: {
        agent: {
          select: {
            organizationId: true,
            status: true,
            model: true,
            systemPrompt: true,
            temperature: true,
            maxTokens: true,
            providerKeyId: true,
            knowledgeBaseId: true,
          },
        },
      },
    })

    if (!conversation || conversation.agent.status !== 'active') {
      throw new AppError(404, 'Conversation not found or agent is not active')
    }

    await prisma.$transaction([
      prisma.message.create({ data: { conversationId: id, role: 'user', content, status: 'sent' } }),
      prisma.conversation.update({ where: { id }, data: { status: 'active' } }),
    ])

    const agent = conversation.agent
    if (!agent || !agent.model) {
      return { data: { response: 'I am not configured to respond yet.' } }
    }

    let provider
    try {
      provider = getProviderForModel(agent.model)
    } catch {
      return { data: { response: 'AI provider is not available.' } }
    }

    const historyPromise = prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { role: true, content: true },
    })
    const contextPromise = agent.knowledgeBaseId
      ? retrieveContext(content, agent.knowledgeBaseId).catch(() => null)
      : Promise.resolve(null)
    const providerKeyPromise = agent.providerKeyId
      ? prisma.providerKey.findFirst({
          where: { id: agent.providerKeyId, organizationId: agent.organizationId },
          select: { apiKey: true },
        })
      : Promise.resolve(null)
    const [historyDesc, context, providerKey] = await Promise.all([
      historyPromise,
      contextPromise,
      providerKeyPromise,
    ])
    const history = historyDesc.reverse()
    const apiKey = providerKey?.apiKey
    const systemContext = context
      ? `${agent.systemPrompt}\n\n## Retrieved knowledge (RAG)\nUse the following source excerpts to answer. Prefer this context over general knowledge when relevant. If the context does not contain the answer, say you do not have that information in the knowledge base.\n\n${context}`
      : agent.systemPrompt

    const aiMessages = [
      { role: 'system' as const, content: systemContext },
      ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ]

    try {
      const response = await provider.generate({
        model: agent.model,
        messages: aiMessages,
        temperature: agent.temperature ?? 0.7,
        maxTokens: agent.maxTokens ?? 2048,
        apiKey,
      })

      await prisma.message.create({
        data: { conversationId: id, role: 'assistant', content: response.content, status: 'sent' },
      })

      return { data: { response: response.content } }
    } catch {
      return { data: { response: 'Sorry, something went wrong. Please try again.' } }
    }
  })
}

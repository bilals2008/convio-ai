import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { AppError } from '../../plugins/error.js'
import { getProviderForModel } from '@convio/ai/providers'
import { getCorsHeaders } from '../../plugins/cors.js'
import { retrieveContext, markDocumentQueriesSuccess } from '../../services/processor.js'
import { moderateForOrg, type ModerationFlag } from '../../services/moderation.js'
import { checkMessageLimit } from '../../services/billing.js'
import { loadAgentToolHandlers } from '../../services/tools/index.js'
import { computeCost } from '@convio/ai/pricing'
import { z } from 'zod'

// User-facing message shown when a message is blocked by moderation.
const MODERATION_REFUSAL = 'Your message could not be processed because it violates this workspace’s content policy. Please rephrase and try again.'

// Compact flag summary for audit-log metadata (avoid storing raw matched text at length).
function summarizeFlags(flags: ModerationFlag[]) {
  return flags.map((f) => ({ type: f.type, severity: f.severity, label: f.label }))
}

// Run moderation for an org and decide whether the message may proceed.
// A message is allowed unless moderation is enabled, failed, and blocking is on.
async function moderateMessage(organizationId: string, content: string) {
  const result = await moderateForOrg(organizationId, content)
  const blocked = result.enabled && !result.passed && result.blockOnViolation
  const flagged = result.enabled && !result.passed
  return {
    allowed: !blocked,
    flagged,
    result,
    message: MODERATION_REFUSAL,
  }
}

async function logModerationViolation(
  fastify: FastifyInstance,
  params: { organizationId: string; conversationId: string; channel: string; actorId?: string; flags: ModerationFlag[]; blocked?: boolean },
) {
  await fastify.auditLog({
    organizationId: params.organizationId,
    actorId: params.actorId,
    action: 'moderation.violation',
    entityType: 'conversation',
    entityId: params.conversationId,
    metadata: { channel: params.channel, blocked: params.blocked ?? true, flags: summarizeFlags(params.flags) },
  })
}

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
  responseTimeMs: z.number().int().min(0).optional(),
  inputTokens: z.number().int().min(0).optional(),
  outputTokens: z.number().int().min(0).optional(),
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
    const { role, content, responseTimeMs, inputTokens, outputTokens } = request.body as {
      role: 'user' | 'assistant'; content: string; responseTimeMs?: number; inputTokens?: number; outputTokens?: number
    }

    const orgId = await getConversationOrgId(id)
    await fastify.getMembership(request.userId!, orgId)

    const limitCheck = await checkMessageLimit(orgId)
    if (!limitCheck.allowed) {
      throw new AppError(402,
        `Monthly message limit (${limitCheck.limit.toLocaleString()}) reached. You've used ${limitCheck.current.toLocaleString()} messages this month. Upgrade your plan to continue.`,
        'PLAN_LIMIT_EXCEEDED',
      )
    }

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        role,
        content,
        status: 'sent',
        responseTimeMs: responseTimeMs ?? null,
        inputTokens: inputTokens ?? null,
        outputTokens: outputTokens ?? null,
      },
    })
    await prisma.conversation.update({
      where: { id },
      data: { status: 'active' },
    })

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
            id: true,
            organizationId: true,
            model: true,
            systemPrompt: true,
            temperature: true,
            maxTokens: true,
            providerKeyId: true,
            knowledgeBaseId: true,
            widgetConfig: true,
          },
        },
      },
    })

    if (!conversation) throw new AppError(404, 'Conversation not found')

    const orgId = conversation.agent.organizationId
    await fastify.getMembership(request.userId!, orgId)

    const limitCheck = await checkMessageLimit(orgId)
    if (!limitCheck.allowed) {
      throw new AppError(402,
        `Monthly message limit (${limitCheck.limit.toLocaleString()}) reached. You've used ${limitCheck.current.toLocaleString()} messages this month. Upgrade your plan to continue.`,
        'PLAN_LIMIT_EXCEEDED',
      )
    }

    const agent = conversation.agent

    if (!agent) {
      throw new AppError(400, 'Conversation has no agent configured')
    }

    if (!agent.model) {
      throw new AppError(400, 'Agent has no model configured')
    }

    // Moderate the incoming user message before spending any tokens.
    const moderation = await moderateForOrg(orgId, content)
    if (moderation.enabled && !moderation.passed) {
      await fastify.auditLog({
        organizationId: orgId,
        actorId: request.userId,
        action: 'moderation.violation',
        entityType: 'conversation',
        entityId: id,
        metadata: { channel: 'stream', blocked: moderation.blockOnViolation, flags: summarizeFlags(moderation.flags) },
      })

      if (moderation.blockOnViolation) {
        reply.hijack()
        reply.raw.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no',
          ...getCorsHeaders(fastify.config.CORS_ORIGIN, request),
        })
        reply.raw.flushHeaders()
        reply.raw.write(`data: ${JSON.stringify({ content: MODERATION_REFUSAL })}\n\n`)
        reply.raw.write(`data: ${JSON.stringify({ type: 'moderation', flags: summarizeFlags(moderation.flags) })}\n\n`)
        reply.raw.write('data: [DONE]\n\n')
        reply.raw.end()
        return
      }
    }

    const historyPromise = prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { role: true, content: true },
    })

    const lastUserMsgForQuery = await prisma.message.findFirst({
      where: { conversationId: id, role: 'user' },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    })
    const messageId = lastUserMsgForQuery?.id

    const contextPromise = agent.knowledgeBaseId
      ? retrieveContext(content, agent.knowledgeBaseId, 5, true, messageId).catch((err: unknown) => {
          request.log.warn({ err }, 'RAG retrieval failed, falling back to base prompt')
          return null
        })
      : Promise.resolve(null)
    const providerKeyPromise = agent.providerKeyId
      ? prisma.providerKey.findFirst({
          where: { id: agent.providerKeyId, organizationId: agent.organizationId },
          select: { apiKey: true, provider: true },
        })
      : Promise.resolve(null)
    const toolsPromise = loadAgentToolHandlers(agent.id, prisma)

    const [historyDesc, context, providerKey, toolHandlers] = await Promise.all([
      historyPromise,
      contextPromise,
      providerKeyPromise,
      toolsPromise,
    ])
    const history = historyDesc.reverse()
    const systemContext = context
      ? `${agent.systemPrompt}\n\n## Retrieved knowledge (RAG)\nUse the following source excerpts to answer. Prefer this context over general knowledge when relevant. If the context does not contain the answer, say you do not have that information in the knowledge base.\n\n${context}`
      : agent.systemPrompt

    const aiMessages = [
      { role: 'system' as const, content: systemContext },
      ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ]

    const toolDefs = toolHandlers.map((h) => ({
      name: h.schema.name,
      description: h.schema.description,
      parameters: h.schema.parameters,
    }))

    const apiKey = providerKey?.apiKey

    let provider
    try {
      provider = getProviderForModel(agent.model, providerKey?.provider)
    } catch {
      throw new AppError(400, `No provider configured for model: ${agent.model}`)
    }

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
    let totalInputTokens = 0
    let totalOutputTokens = 0

    try {
      const stream = provider.stream({
        model: agent.model,
        messages: aiMessages,
        temperature: agent.temperature ?? 0.7,
        maxTokens: agent.maxTokens ?? 2048,
        apiKey,
        tools: toolDefs.length > 0 ? toolDefs : undefined,
      })

      let firstResponseText = ''
      const toolCallsFromStream: { tool: string; args: Record<string, unknown> }[] = []

      for await (const chunk of stream) {
        if (clientDisconnected) break
        if (chunk.type === 'reasoning' && chunk.content) {
          reply.raw.write(`data: ${JSON.stringify({ type: 'reasoning', content: chunk.content })}\n\n`)
        } else if (chunk.type === 'text' && chunk.content) {
          firstResponseText += chunk.content
          reply.raw.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`)
        } else if (chunk.type === 'tool_call' && chunk.toolCall) {
          toolCallsFromStream.push({ tool: chunk.toolCall.name, args: chunk.toolCall.arguments })
          reply.raw.write(`data: ${JSON.stringify({ type: 'tool_call', tool: chunk.toolCall.name, args: chunk.toolCall.arguments })}\n\n`)
        } else if (chunk.content) {
          firstResponseText += chunk.content
          reply.raw.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`)
        }
        if (chunk.type === 'done') {
          if (chunk.usage) {
            totalInputTokens += chunk.usage.promptTokens || 0
            totalOutputTokens += chunk.usage.completionTokens || 0
          }
          break
        }
      }

      // Execute tools and make second AI call for summarization
      if (toolCallsFromStream.length > 0) {
        const results: { tool: string; result: unknown }[] = []
        for (const tc of toolCallsFromStream) {
          const handler = toolHandlers.find((h) => h.schema.name === tc.tool)
          if (handler) {
            const result = await handler.execute(tc.args)
            reply.raw.write(`data: ${JSON.stringify({ type: 'tool_result', tool: tc.tool, result })}\n\n`)
            results.push({ tool: tc.tool, result })
          }
        }

        const resultsSummary = results
          .map((r) => `${r.tool} returned:\n${JSON.stringify(r.result, null, 2)}`)
          .join('\n\n')

        const finalStream = provider.stream({
          model: agent.model,
          messages: [
            ...aiMessages,
            { role: 'assistant', content: firstResponseText || 'I will look that up for you.' },
            { role: 'user', content: `The following tools returned these results:\n\n${resultsSummary}\n\nProvide a clear, helpful response in plain text. Do NOT use any tools or output JSON.` },
          ],
          temperature: agent.temperature ?? 0.7,
          maxTokens: agent.maxTokens ?? 2048,
          apiKey,
        })
        for await (const chunk of finalStream) {
          if (clientDisconnected) break
          if (chunk.type === 'text' && chunk.content) {
            fullResponse += chunk.content
            reply.raw.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`)
          }
          if (chunk.type === 'done' && chunk.usage) {
            totalInputTokens += chunk.usage.promptTokens || 0
            totalOutputTokens += chunk.usage.completionTokens || 0
          }
        }
      } else {
        fullResponse = firstResponseText
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
      const lastUserMsg = await prisma.message.findFirst({
        where: { conversationId: id, role: 'user' },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      })
      const responseTimeMs = lastUserMsg ? Date.now() - lastUserMsg.createdAt.getTime() : null

      await prisma.message.create({
        data: {
          conversationId: id,
          role: 'assistant',
          content: fullResponse,
          status: 'sent',
          responseTimeMs,
          inputTokens: totalInputTokens || null,
          outputTokens: totalOutputTokens || null,
          cost: computeCost(agent.model, totalInputTokens || 0, totalOutputTokens || 0),
        },
      })

      if (messageId) {
        markDocumentQueriesSuccess(messageId).catch(() => {})
      }

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

    if (!conversation || conversation.agent.status === 'archived') {
      throw new AppError(404, 'Conversation not found or agent is unavailable')
    }

    // Moderate the inbound message before storing it or calling the AI.
    const widgetModeration = await moderateMessage(conversation.agent.organizationId, content)
    if (!widgetModeration.allowed) {
      await logModerationViolation(fastify, {
        organizationId: conversation.agent.organizationId,
        conversationId: id,
        channel: 'widget',
        flags: widgetModeration.result.flags,
      })
      return { data: { response: widgetModeration.message } }
    }

    await prisma.message.create({ data: { conversationId: id, role: 'user', content, status: 'sent' } })
    await prisma.conversation.update({ where: { id }, data: { status: 'active' } })

    const agent = conversation.agent
    if (!agent || !agent.model) {
      return { data: { response: 'I am not configured to respond yet.' } }
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
          select: { apiKey: true, provider: true },
        })
      : Promise.resolve(null)
    const [historyDesc, context, providerKey] = await Promise.all([
      historyPromise,
      contextPromise,
      providerKeyPromise,
    ])
    const history = historyDesc.reverse()
    const apiKey = providerKey?.apiKey

    let provider
    try {
      provider = getProviderForModel(agent.model, providerKey?.provider)
    } catch {
      return { data: { response: 'AI provider is not available.' } }
    }

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

      const lastUserMsg = await prisma.message.findFirst({
        where: { conversationId: id, role: 'user' },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      })
      const responseTimeMs = lastUserMsg ? Date.now() - lastUserMsg.createdAt.getTime() : null

      await prisma.message.create({
        data: {
          conversationId: id,
          role: 'assistant',
          content: response.content,
          status: 'sent',
          responseTimeMs,
          inputTokens: response.usage?.promptTokens ?? null,
          outputTokens: response.usage?.completionTokens ?? null,
          cost: computeCost(agent.model, response.usage?.promptTokens ?? 0, response.usage?.completionTokens ?? 0),
        },
      })

      return { data: { response: response.content } }
    } catch {
      return { data: { response: 'Sorry, something went wrong. Please try again.' } }
    }
  })

  // POST /api/widget/conversations/:id/messages/stream — Widget AI response via SSE (public, rate-limited)
  fastify.post('/widget/conversations/:id/messages/stream', {
    preHandler: [validate({ params: convParamsSchema, body: widgetMessageBodySchema })],
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { content } = request.body as { content: string }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: {
        agent: {
          select: {
            id: true,
            organizationId: true,
            status: true,
            model: true,
            systemPrompt: true,
            temperature: true,
            maxTokens: true,
            providerKeyId: true,
            knowledgeBaseId: true,
            widgetConfig: true,
          },
        },
      },
    })

    if (!conversation || conversation.agent.status === 'archived') {
      throw new AppError(404, 'Conversation not found or agent is unavailable')
    }

    const widgetModeration = await moderateMessage(conversation.agent.organizationId, content)
    if (!widgetModeration.allowed) {
      await logModerationViolation(fastify, {
        organizationId: conversation.agent.organizationId,
        conversationId: id,
        channel: 'widget',
        flags: widgetModeration.result.flags,
      })
      return { data: { response: widgetModeration.message } }
    }

    await prisma.message.create({ data: { conversationId: id, role: 'user', content, status: 'sent' } })
    await prisma.conversation.update({ where: { id }, data: { status: 'active' } })

    const agent = conversation.agent
    if (!agent || !agent.model) {
      return { data: { response: 'I am not configured to respond yet.' } }
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
          select: { apiKey: true, provider: true },
        })
      : Promise.resolve(null)
    const toolsPromise = loadAgentToolHandlers(agent.id, prisma)

    const [historyDesc, context, providerKey, toolHandlers] = await Promise.all([
      historyPromise,
      contextPromise,
      providerKeyPromise,
      toolsPromise,
    ])
    const history = historyDesc.reverse()
    const apiKey = providerKey?.apiKey

    let provider
    try {
      provider = getProviderForModel(agent.model, providerKey?.provider)
    } catch {
      return { data: { response: 'AI provider is not available.' } }
    }

    const systemContext = context
      ? `${agent.systemPrompt}\n\n## Retrieved knowledge (RAG)\nUse the following source excerpts to answer. Prefer this context over general knowledge when relevant. If the context does not contain the answer, say you do not have that information in the knowledge base.\n\n${context}`
      : agent.systemPrompt

    const aiMessages = [
      { role: 'system' as const, content: systemContext },
      ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ]

    const toolDefs = toolHandlers.map((h) => ({
      name: h.schema.name,
      description: h.schema.description,
      parameters: h.schema.parameters,
    }))

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
    request.raw.once('close', () => { clientDisconnected = true })

    let fullResponse = ''
    let totalInputTokens = 0
    let totalOutputTokens = 0

    try {
      const stream = provider.stream({
        model: agent.model,
        messages: aiMessages,
        temperature: agent.temperature ?? 0.7,
        maxTokens: agent.maxTokens ?? 2048,
        apiKey,
        tools: toolDefs.length > 0 ? toolDefs : undefined,
      })

      let firstResponseText = ''
      const toolCallsFromStream: { tool: string; args: Record<string, unknown> }[] = []

      for await (const chunk of stream) {
        if (clientDisconnected) break
        if (chunk.type === 'reasoning') continue
        if (chunk.type === 'text' && chunk.content) {
          firstResponseText += chunk.content
          reply.raw.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`)
        } else if (chunk.type === 'tool_call' && chunk.toolCall) {
          toolCallsFromStream.push({ tool: chunk.toolCall.name, args: chunk.toolCall.arguments })
        } else if (chunk.content) {
          firstResponseText += chunk.content
          reply.raw.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`)
        }
        if (chunk.type === 'done') {
          if (chunk.usage) {
            totalInputTokens += chunk.usage.promptTokens || 0
            totalOutputTokens += chunk.usage.completionTokens || 0
          }
          break
        }
      }

      // Execute tools and make second AI call for summarization
      if (toolCallsFromStream.length > 0) {
        const results: { tool: string; result: unknown }[] = []
        for (const tc of toolCallsFromStream) {
          const handler = toolHandlers.find((h) => h.schema.name === tc.tool)
          if (handler) {
            const result = await handler.execute(tc.args)
            results.push({ tool: tc.tool, result })
          }
        }

        const resultsSummary = results
          .map((r) => `${r.tool} returned:\n${JSON.stringify(r.result, null, 2)}`)
          .join('\n\n')

        const finalStream = provider.stream({
          model: agent.model,
          messages: [
            ...aiMessages,
            { role: 'assistant', content: firstResponseText || 'I will look that up for you.' },
            { role: 'user', content: `The following tools returned these results:\n\n${resultsSummary}\n\nProvide a clear, helpful response in plain text. Do NOT use any tools or output JSON.` },
          ],
          temperature: agent.temperature ?? 0.7,
          maxTokens: agent.maxTokens ?? 2048,
          apiKey,
        })
        for await (const chunk of finalStream) {
          if (clientDisconnected) break
          if (chunk.type === 'text' && chunk.content) {
            fullResponse += chunk.content
            reply.raw.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`)
          }
          if (chunk.type === 'done' && chunk.usage) {
            totalInputTokens += chunk.usage.promptTokens || 0
            totalOutputTokens += chunk.usage.completionTokens || 0
          }
        }
      } else {
        fullResponse = firstResponseText
      }
    } catch {
      if (!clientDisconnected) {
        reply.raw.write(`data: ${JSON.stringify({ error: 'Sorry, something went wrong. Please try again.' })}\n\n`)
        reply.raw.write('data: [DONE]\n\n')
        reply.raw.end()
      }
      return
    }

    if (fullResponse) {
      const lastUserMsg = await prisma.message.findFirst({
        where: { conversationId: id, role: 'user' },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      })
      const responseTimeMs = lastUserMsg ? Date.now() - lastUserMsg.createdAt.getTime() : null

      await prisma.message.create({
        data: {
          conversationId: id,
          role: 'assistant',
          content: fullResponse,
          status: 'sent',
          responseTimeMs,
          inputTokens: totalInputTokens || null,
          outputTokens: totalOutputTokens || null,
          cost: computeCost(agent.model, totalInputTokens || 0, totalOutputTokens || 0),
        },
      })
    }

    if (!clientDisconnected) {
      reply.raw.write('data: [DONE]\n\n')
      reply.raw.end()
    }
  })
}

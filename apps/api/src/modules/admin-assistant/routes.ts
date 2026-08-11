import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '@convio/database'
import { z } from 'zod'
import { getCorsHeaders } from '../../plugins/cors.js'
import { validate } from '../../plugins/validate.js'
import { buildSystemPrompt } from './prompts.js'
import { adminTools, chartForTool } from './tools.js'
import {
  auditAssistantAction,
  executeToolCalls,
  getDailyTokenBudget,
  getDailyTokenUsage,
  isToolAllowed,
  resolveAssistantModel,
  saveExchange,
  toolResultsSummary,
} from './service.js'
import type { Message, StreamChunk, ToolCall, Usage } from '@convio/ai'
import type { AdminChartSpec } from './tools.js'

const streamBodySchema = z.object({
  content: z.string().min(1).max(2000),
  conversationId: z.string().uuid().optional(),
})

const conversationParamsSchema = z.object({ id: z.string().uuid() })

const HISTORY_LIMIT = 20

type WireChunk =
  | (StreamChunk & { conversationId?: string })
  | { type: 'error'; content: string }
  | { type: 'chart'; chart: AdminChartSpec }

function writeChunk(reply: FastifyReply, payload: WireChunk): void {
  reply.raw.write(`data: ${JSON.stringify(payload)}\n\n`)
}

export default async function adminAssistantRoutes(fastify: FastifyInstance) {
  const adminGuard = { preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin] }

  // GET /api/admin/assistant/conversations — conversation history for this admin
  fastify.get('/admin/assistant/conversations', adminGuard, async (request) => {
    const items = await prisma.adminConversation.findMany({
      where: { adminId: request.userId! },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    })
    return {
      data: items.map((c) => ({
        id: c.id,
        title: c.title,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        messageCount: c._count.messages,
      })),
    }
  })

  // POST /api/admin/assistant/conversations — start a new conversation
  fastify.post('/admin/assistant/conversations', adminGuard, async (request) => {
    const created = await prisma.adminConversation.create({
      data: { adminId: request.userId! },
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    })
    return { data: created }
  })

  // GET /api/admin/assistant/conversations/:id/messages — full history of one conversation
  fastify.get(
    '/admin/assistant/conversations/:id/messages',
    {
      preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ params: conversationParamsSchema })],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const conversation = await prisma.adminConversation.findFirst({
        where: { id, adminId: request.userId! },
        include: { messages: { orderBy: { createdAt: 'asc' }, take: 200 } },
      })
      if (!conversation) return reply.code(404).send({ error: 'Conversation not found' })
      return { data: conversation.messages }
    },
  )

  // DELETE /api/admin/assistant/conversations/:id
  fastify.delete(
    '/admin/assistant/conversations/:id',
    {
      preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ params: conversationParamsSchema })],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const { count } = await prisma.adminConversation.deleteMany({
        where: { id, adminId: request.userId! },
      })
      if (count === 0) return reply.code(404).send({ error: 'Conversation not found' })
      return { data: { ok: true } }
    },
  )

  // GET /api/admin/assistant/logs — recent assistant audit entries for this admin
  fastify.get('/admin/assistant/logs', adminGuard, async (request) => {
    const items = await prisma.adminAssistantLog.findMany({
      where: { actorId: request.userId! },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        action: true,
        query: true,
        success: true,
        latencyMs: true,
        metadata: true,
        createdAt: true,
      },
    })
    return { data: items }
  })

  // POST /api/admin/assistant/stream — SSE streaming chat
  fastify.post(
    '/admin/assistant/stream',
    {
      preHandler: [
        fastify.authenticate,
        fastify.ensurePlatformAdmin,
        validate({ body: streamBodySchema }),
      ],
      config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { content, conversationId } = request.body as { content: string; conversationId?: string }
      const adminId = request.userId!
      const startedAt = Date.now()

      let history: Message[] = []
      const conversation = conversationId
        ? await prisma.adminConversation.findFirst({
            where: { id: conversationId, adminId },
            include: { messages: { orderBy: { createdAt: 'asc' }, take: HISTORY_LIMIT } },
          })
        : null
      if (conversationId && !conversation) {
        return reply.code(404).send({ error: 'Conversation not found' })
      }
      if (conversation) {
        history = conversation.messages
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .slice(-16)
          .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      }

      const budget = getDailyTokenBudget()
      const usedTokens = await getDailyTokenUsage(adminId)
      if (usedTokens >= budget) {
        return reply.code(429).send({
          error: `Daily assistant token budget reached (${usedTokens.toLocaleString()} / ${budget.toLocaleString()} tokens). Resets tomorrow.`,
        })
      }

      let provider: ReturnType<typeof resolveAssistantModel>['provider']
      let model: string
      let apiKey: string | undefined
      try {
        const resolved = resolveAssistantModel()
        provider = resolved.provider
        model = resolved.model
        apiKey = resolved.apiKey
      } catch (err) {
        return reply.code(500).send({ error: (err as Error).message })
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

      let aborted = false
      request.raw.once('close', () => {
        aborted = true
      })

      const systemMessages: Message[] = [
        { role: 'system', content: buildSystemPrompt() },
        ...history,
        { role: 'user', content },
      ]

      const toolDefs = adminTools
        .filter((t) => isToolAllowed(t.requires))
        .map((t) => ({
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        }))

      let assistantContent = ''
      let assistantError: string | undefined
      let usage: Usage | undefined
      const toolCalls: ToolCall[] = []

      try {
        const stream = provider.stream({
          model,
          messages: systemMessages,
          temperature: 0.2,
          maxTokens: 2048,
          apiKey,
          tools: toolDefs,
        })
        let phase1Text = ''
        for await (const chunk of stream) {
          if (aborted) break
          if (chunk.type === 'tool_call' && chunk.toolCall) {
            toolCalls.push(chunk.toolCall)
            writeChunk(reply, chunk)
          } else if (chunk.type === 'text' && chunk.content) {
            phase1Text += chunk.content
            if (toolCalls.length === 0) {
              assistantContent += chunk.content
              writeChunk(reply, chunk)
            }
          } else if (chunk.type === 'done') {
            usage = chunk.usage
          }
        }

        if (toolCalls.length > 0) {
          const executed = await executeToolCalls(toolCalls)
          for (let i = 0; i < executed.length; i++) {
            const call = toolCalls[i]
            writeChunk(reply, {
              type: 'tool_result',
              toolCall: {
                id: call.id,
                name: executed[i].name,
                arguments: call.arguments,
                result: executed[i].error ? { error: executed[i].error } : executed[i].result,
              },
            })
          }
          for (const exec of executed) {
            if (exec.error || exec.result === undefined) continue
            const chart = chartForTool(exec.name, exec.result)
            if (chart) writeChunk(reply, { type: 'chart', chart })
          }

          const finalStream = provider.stream({
            model,
            messages: [
              ...systemMessages,
              {
                role: 'assistant',
                content:
                  phase1Text.trim().length > 0 ? phase1Text : 'I will look that up for you.',
              },
              {
                role: 'user',
                content: `The following tools returned results:\n\n${toolResultsSummary(executed)}\n\nProvide a clear answer using only this data. Do NOT call any tools.`,
              },
            ],
            temperature: 0.2,
            maxTokens: 4096,
            apiKey,
          })
          for await (const chunk of finalStream) {
            if (aborted) break
            if (chunk.type === 'text' && chunk.content) {
              assistantContent += chunk.content
              writeChunk(reply, chunk)
            } else if (chunk.type === 'done') {
              usage = chunk.usage
            }
          }
        }
      } catch (err) {
        const raw = err instanceof Error ? err.message : 'Generation failed'
        assistantError = process.env.NODE_ENV === 'production' ? 'Generation failed.' : raw
        writeChunk(reply, { type: 'error', content: assistantError })
      }

      if (!aborted && !assistantError) {
        let savedId: string | undefined
        try {
          const saved = await saveExchange({
            conversationId,
            adminId,
            userContent: content,
            assistantContent,
            toolCalls,
            usage,
          })
          savedId = saved.conversationId
        } catch {
          // persistence failure is logged, stream still completes
        }
        writeChunk(reply, { type: 'done', usage, conversationId: savedId })
        reply.raw.write('data: [DONE]\n\n')
        await auditAssistantAction({
          actorId: adminId,
          action: 'admin.assistant.chat',
          query: content,
          success: true,
          latencyMs: Date.now() - startedAt,
          metadata: {
            conversationId: savedId ?? conversationId,
            tools: toolCalls.map((t) => t.name),
          },
        })
      }

      if (assistantError) {
        await auditAssistantAction({
          actorId: adminId,
          action: 'admin.assistant.chat',
          query: content,
          success: false,
          latencyMs: Date.now() - startedAt,
          metadata: { error: assistantError.slice(0, 500) },
        })
      }

      reply.raw.end()
    },
  )
}
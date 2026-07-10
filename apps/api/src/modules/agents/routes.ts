import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { createAgentSchema, updateAgentSchema } from '@convio/validation'
import { AppError } from '../../plugins/error.js'
import { getProviderForModel } from '@convio/ai/providers'
import { getCorsHeaders } from '../../plugins/cors.js'
import { z } from 'zod'

const orgParamsSchema = z.object({
  orgId: z.string().uuid(),
})

const agentParamsSchema = z.object({
  id: z.string().uuid(),
})

const agentToolParamsSchema = z.object({
  id: z.string().uuid(),
  toolId: z.string().uuid(),
})

const agentsQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
})

const addToolSchema = z.object({
  toolId: z.string().uuid(),
})

const testAgentSchema = z.object({
  message: z.string().min(1).max(12000),
})

const testStreamSchema = z.object({
  model: z.string().min(1),
  systemPrompt: z.string().min(1),
  message: z.string().min(1).max(12000),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(512000).default(2048),
  reasoningEffort: z.enum(['none', 'low', 'medium', 'high', 'xhigh']).optional(),
  providerKeyId: z.string().uuid().optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(12000),
  })).max(30).optional().default([]),
})

const createAgentBodySchema = createAgentSchema.extend({
  knowledgeBaseId: z.string().uuid().optional(),
})

const updateAgentBodySchema = updateAgentSchema

export default async function agentsRoutes(fastify: FastifyInstance) {
  // POST /api/organizations/:orgId/agents — Create agent (member only)
  fastify.post('/organizations/:orgId/agents', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema, body: createAgentBodySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }

    await fastify.getMembership(request.userId!, orgId)

    const body = request.body as Record<string, unknown>
    const { knowledgeBaseId, reasoningEffort, ...rest } = body

    const agent = await prisma.agent.create({
      data: {
        ...rest,
        knowledgeBaseId: knowledgeBaseId || null,
        organizationId: orgId,
        createdById: request.userId,
      } as any,
    })

    return { data: agent }
  })

  // GET /api/organizations/:orgId/agents — List agents (member only, cursor pagination)
  fastify.get('/organizations/:orgId/agents', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema, query: agentsQuerySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { cursor, limit } = request.query as { cursor?: string; limit: number }

    await fastify.getMembership(request.userId!, orgId)

    const agents = await prisma.agent.findMany({
      where: { organizationId: orgId },
      include: { tools: true, knowledgeBase: { select: { id: true, name: true } } },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    })

    const hasNextPage = agents.length > limit
    const items = hasNextPage ? agents.slice(0, limit) : agents

    return {
      data: items,
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    }
  })

  // GET /api/agents/:id — Get agent by ID (member only, includes deployments)
  fastify.get('/agents/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        tools: true,
        knowledgeBase: { select: { id: true, name: true } },
        deployments: true,
      },
    })

    if (!agent) throw new AppError(404, 'Agent not found')

    await fastify.getMembership(request.userId!, agent.organizationId)

    return { data: agent }
  })

  // PATCH /api/agents/:id — Update agent (member only)
  fastify.patch('/agents/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema, body: updateAgentBodySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const existing = await prisma.agent.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, 'Agent not found')

    await fastify.getMembership(request.userId!, existing.organizationId)

    const body = request.body as Record<string, unknown>
    const { knowledgeBaseId, reasoningEffort, ...rest } = body

    const agent = await prisma.agent.update({
      where: { id },
      data: { ...rest, knowledgeBaseId: knowledgeBaseId !== undefined ? (knowledgeBaseId || null) : undefined } as any,
    })

    return { data: agent }
  })

  // DELETE /api/agents/:id — Delete agent (admin only)
  fastify.delete('/agents/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema }),
    ],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const existing = await prisma.agent.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, 'Agent not found')

    await fastify.ensureAdmin(request.userId!, existing.organizationId)

    await prisma.agent.delete({ where: { id } })
    reply.code(204).send()
  })

  // POST /api/agents/:id/tools — Attach tool to agent (admin only)
  fastify.post('/agents/:id/tools', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema, body: addToolSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { toolId } = request.body as { toolId: string }

    const agent = await prisma.agent.findUnique({ where: { id } })
    if (!agent) throw new AppError(404, 'Agent not found')

    await fastify.ensureAdmin(request.userId!, agent.organizationId)

    const tool = await prisma.tool.findUnique({ where: { id: toolId } })
    if (!tool || tool.organizationId !== agent.organizationId) {
      throw new AppError(404, 'Tool not found in this organization')
    }

    const existingLink = await prisma.agentTool.findUnique({
      where: { agentId_toolId: { agentId: id, toolId } },
    })

    if (existingLink) {
      throw new AppError(409, 'Tool is already attached to this agent', 'CONFLICT')
    }

    const link = await prisma.agentTool.create({
      data: { agentId: id, toolId },
    })

    return { data: link }
  })

  // DELETE /api/agents/:id/tools/:toolId — Detach tool from agent (admin only)
  fastify.delete('/agents/:id/tools/:toolId', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentToolParamsSchema }),
    ],
  }, async (request, reply) => {
    const { id, toolId } = request.params as { id: string; toolId: string }

    const agent = await prisma.agent.findUnique({ where: { id } })
    if (!agent) throw new AppError(404, 'Agent not found')

    await fastify.ensureAdmin(request.userId!, agent.organizationId)

    const existingLink = await prisma.agentTool.findUnique({
      where: { agentId_toolId: { agentId: id, toolId } },
    })

    if (!existingLink) {
      throw new AppError(404, 'Tool is not attached to this agent')
    }

    await prisma.agentTool.delete({
      where: { agentId_toolId: { agentId: id, toolId } },
    })

    reply.code(204).send()
  })

  // POST /api/agents/:id/test — Test agent with sample message (member only)
  fastify.post('/agents/:id/test', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema, body: testAgentSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { message } = request.body as { message: string }

    const agent = await prisma.agent.findUnique({
      where: { id },
      include: { tools: true },
    })
    if (!agent) throw new AppError(404, 'Agent not found')

    await fastify.getMembership(request.userId!, agent.organizationId)

    let apiKey: string | undefined
    if (agent.providerKeyId) {
      const providerKey = await prisma.providerKey.findUnique({
        where: { id: agent.providerKeyId },
      })
      if (providerKey && providerKey.organizationId === agent.organizationId) {
        apiKey = providerKey.apiKey
      }
    }

    let provider
    try {
      provider = getProviderForModel(agent.model)
    } catch {
      throw new AppError(400, `No provider configured for model: ${agent.model}`)
    }

    const response = await provider.generate({
      model: agent.model,
      messages: [
        { role: 'system', content: agent.systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: agent.temperature ?? 0.7,
      maxTokens: agent.maxTokens ?? 2048,
      reasoningEffort: (agent as any).reasoningEffort || undefined,
      apiKey,
    })

    return {
      data: {
        response: response.content,
        usage: response.usage,
      },
    }
  })

  // POST /api/agents/test-stream — Test agent config with SSE streaming (authenticated)
  fastify.post('/agents/test-stream', {
    preHandler: [
      fastify.authenticate,
      validate({ body: testStreamSchema }),
    ],
  }, async (request, reply) => {
    const {
      model,
      systemPrompt,
      message,
      temperature,
      maxTokens,
      reasoningEffort,
      providerKeyId,
      history,
    } = request.body as z.infer<typeof testStreamSchema>

    const providerKey = providerKeyId
      ? await prisma.providerKey.findFirst({
          where: {
            id: providerKeyId,
            organization: { memberships: { some: { userId: request.userId! } } },
          },
          select: { apiKey: true },
        })
      : null
    const apiKey = providerKey?.apiKey

    const corsHeaders = getCorsHeaders(fastify.config.CORS_ORIGIN, request)

    reply.hijack()

    let provider
    try {
      provider = getProviderForModel(model)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown provider error'
      reply.raw.writeHead(400, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        ...corsHeaders,
      })
      reply.raw.write(`data: ${JSON.stringify({ error: msg })}\n\n`)
      reply.raw.write('data: [DONE]\n\n')
      reply.raw.end()
      return
    }

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: 'user' as const, content: message },
    ]

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      ...corsHeaders,
    })
    reply.raw.flushHeaders()

    let clientDisconnected = false
    request.raw.once('close', () => {
      clientDisconnected = true
    })

    try {
      const stream = provider.stream({
        model,
        messages,
        temperature,
        maxTokens,
        reasoningEffort: reasoningEffort || undefined,
        apiKey,
      })

      let finalUsage: { promptTokens?: number; completionTokens?: number; totalTokens?: number } | undefined

      for await (const chunk of stream) {
        if (clientDisconnected) break
        if (chunk.type === 'reasoning') {
          reply.raw.write(`data: ${JSON.stringify({ type: 'reasoning', content: chunk.content })}\n\n`)
        } else if (chunk.type === 'text' && chunk.content) {
          reply.raw.write(`data: ${JSON.stringify({ type: 'text', content: chunk.content })}\n\n`)
        } else if (chunk.type === 'done') {
          finalUsage = chunk.usage
          break
        }
      }

      if (finalUsage) {
        reply.raw.write(`data: ${JSON.stringify({ type: 'usage', usage: finalUsage })}\n\n`)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Stream generation failed'
      reply.raw.write(`data: ${JSON.stringify({ error: msg })}\n\n`)
    }

    if (!clientDisconnected) {
      reply.raw.write('data: [DONE]\n\n')
      reply.raw.end()
    }
  })

  // PATCH /api/agents/:id/status — Change agent status (admin only, validates transitions)
  fastify.patch('/agents/:id/status', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema, body: z.object({ status: z.enum(['draft', 'active', 'paused', 'archived']) }) }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { status } = request.body as { status: string }

    const existing = await prisma.agent.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, 'Agent not found')

    await fastify.ensureAdmin(request.userId!, existing.organizationId)

    const agent = await prisma.agent.update({
      where: { id },
      data: { status },
    })

    return { data: agent }
  })

  // GET /api/agents/:id/embed — Get embed snippet (member only)
  fastify.get('/agents/:id/embed', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const existing = await prisma.agent.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, 'Agent not found')

    await fastify.getMembership(request.userId!, existing.organizationId)

    const baseUrl = process.env.CORS_ORIGIN || 'http://localhost:5173'
    const snippet = `<script src="${baseUrl}/widget.js" data-agent-id="${id}"></script>\n<div id="convio-widget" data-agent-id="${id}"></div>`

    return { data: { snippet } }
  })
}

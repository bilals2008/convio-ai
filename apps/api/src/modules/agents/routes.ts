import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { createAgentSchema, updateAgentSchema } from '@convio/validation'
import { AppError } from '../../plugins/error.js'
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
  message: z.string().min(1),
})

type MembershipRole = 'owner' | 'admin' | 'member' | 'viewer'

async function getMembership(userId: string, orgId: string): Promise<{ role: MembershipRole }> {
  const membership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  })
  if (!membership) {
    throw new AppError(403, 'You do not belong to this organization', 'FORBIDDEN')
  }
  return { role: membership.role as MembershipRole }
}

async function requireAdmin(userId: string, orgId: string) {
  const { role } = await getMembership(userId, orgId)
  if (role !== 'admin' && role !== 'owner') {
    throw new AppError(403, 'Admin access required', 'FORBIDDEN')
  }
}

export default async function agentsRoutes(fastify: FastifyInstance) {
  // POST /api/organizations/:orgId/agents — Create agent (member only)
  fastify.post('/organizations/:orgId/agents', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema, body: createAgentSchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }

    await getMembership(request.userId!, orgId)

    const body = request.body as { name: string; description?: string; model: string; systemPrompt: string; temperature?: number; maxTokens?: number }

    const agent = await prisma.agent.create({
      data: { ...body, organizationId: orgId },
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

    await getMembership(request.userId!, orgId)

    const agents = await prisma.agent.findMany({
      where: { organizationId: orgId },
      include: { tools: true },
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

  // GET /api/agents/:id — Get agent by ID (member only)
  fastify.get('/agents/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const agent = await prisma.agent.findUnique({
      where: { id },
      include: { tools: true },
    })

    if (!agent) throw new AppError(404, 'Agent not found')

    await getMembership(request.userId!, agent.organizationId)

    return { data: agent }
  })

  // PATCH /api/agents/:id — Update agent (member only)
  fastify.patch('/agents/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema, body: updateAgentSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const existing = await prisma.agent.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, 'Agent not found')

    await getMembership(request.userId!, existing.organizationId)

    const agent = await prisma.agent.update({
      where: { id },
      data: request.body as any,
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

    await requireAdmin(request.userId!, existing.organizationId)

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

    await requireAdmin(request.userId!, agent.organizationId)

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

    await requireAdmin(request.userId!, agent.organizationId)

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

    const agent = await prisma.agent.findUnique({ where: { id } })
    if (!agent) throw new AppError(404, 'Agent not found')

    await getMembership(request.userId!, agent.organizationId)

    return { data: { response: `Echo: ${message} (Agent: ${agent.name})` } }
  })
}

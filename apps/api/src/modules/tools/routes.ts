import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { createToolSchema, updateToolSchema } from '@convio/validation'
import { AppError } from '../../plugins/error.js'
import { listTools } from '../../services/tools/index.js'
import { z } from 'zod'

const orgParamsSchema = z.object({
  orgId: z.string().uuid(),
})

const toolParamsSchema = z.object({
  id: z.string().uuid(),
})

// organizationId comes from the URL param, so it's not required in the body
const createToolBodySchema = createToolSchema.omit({ organizationId: true })
const updateToolBodySchema = updateToolSchema.omit({ organizationId: true })

export default async function toolsRoutes(fastify: FastifyInstance) {
  // GET /api/tools/built-in — List built-in AI tools (no auth, used by test-stream)
  fastify.get('/tools/built-in', async () => {
    return { data: listTools() }
  })

  // POST /api/organizations/:orgId/tools — Create tool (admin only)
  fastify.post('/organizations/:orgId/tools', {
    preHandler: [
      fastify.authenticate,
      fastify.requireAdmin,
      validate({ params: orgParamsSchema, body: createToolBodySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }

    const body = request.body as z.infer<typeof createToolBodySchema>

    const tool = await prisma.tool.create({
      data: {
        ...body,
        config: body.config as any,
        organizationId: orgId,
      },
    })

    return { data: tool }
  })

  // GET /api/organizations/:orgId/tools — List tools (member only)
  fastify.get('/organizations/:orgId/tools', {
    preHandler: [
      fastify.authenticate,
      fastify.requireMembership,
      validate({ params: orgParamsSchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }

    const tools = await prisma.tool.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    })

    return { data: tools }
  })

  // GET /api/tools/:id — Get tool by ID (member only)
  fastify.get('/tools/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: toolParamsSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const tool = await prisma.tool.findUnique({
      where: { id },
      include: { agents: true },
    })
    if (!tool) throw new AppError(404, 'Tool not found')

    await fastify.getMembership(request.userId!, tool.organizationId)

    return { data: tool }
  })

  // PATCH /api/tools/:id — Update tool (admin only)
  fastify.patch('/tools/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: toolParamsSchema, body: updateToolBodySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const existing = await prisma.tool.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, 'Tool not found')

    await fastify.ensureAdmin(request.userId!, existing.organizationId)

    const body = request.body as z.infer<typeof updateToolBodySchema>

    const tool = await prisma.tool.update({
      where: { id },
      data: {
        ...body,
        config: body.config !== undefined ? (body.config as any) : undefined,
      },
    })

    return { data: tool }
  })

  // DELETE /api/tools/:id — Delete tool (admin only, cascades AgentTool links)
  fastify.delete('/tools/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: toolParamsSchema }),
    ],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const existing = await prisma.tool.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, 'Tool not found')

    await fastify.ensureAdmin(request.userId!, existing.organizationId)

    // Remove AgentTool links first (AgentTool.tool relation has no cascade)
    await prisma.agentTool.deleteMany({ where: { toolId: id } })
    await prisma.tool.delete({ where: { id } })

    reply.code(204).send()
  })
}

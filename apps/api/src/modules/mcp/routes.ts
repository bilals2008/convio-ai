import type { FastifyInstance } from 'fastify'
import { prisma, Prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { createMcpServerSchema, updateMcpServerSchema } from '@convio/validation'
import { AppError } from '../../plugins/error.js'
import { clientFromServer } from '../../services/mcp/factory.js'
import { z } from 'zod'

const orgParamsSchema = z.object({ orgId: z.string().uuid() })
const mcpParamsSchema = z.object({ id: z.string().uuid() })
const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional(),
  search: z.string().max(100).optional(),
  type: z.enum(['sse', 'streamable-http']).optional(),
  status: z.enum(['enabled', 'disabled', 'connected', 'failed']).optional(),
})

export default async function mcpRoutes(fastify: FastifyInstance) {
  // POST /api/organizations/:orgId/mcp-servers — Create MCP server
  fastify.post('/organizations/:orgId/mcp-servers', {
    preHandler: [fastify.authenticate, fastify.requireAdmin, validate({ params: orgParamsSchema, body: createMcpServerSchema })],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const body = request.body as z.infer<typeof createMcpServerSchema>
    try {
      const server = await prisma.mcpServer.create({
        data: {
          ...body,
          args: body.args as any,
          headers: (body.headers ?? {}) as any,
          organizationId: orgId,
        },
      })
      return { data: server }
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new AppError(409, 'An MCP server with this name already exists in this organization')
      }
      throw err
    }
  })

  // GET /api/organizations/:orgId/mcp-servers — List MCP servers
  // Pass `page` to get a paginated envelope { items, total, page, pageSize, totalPages };
  // without it, returns a plain array (agent pickers etc.).
  fastify.get('/organizations/:orgId/mcp-servers', {
    preHandler: [fastify.authenticate, fastify.requireMembership, validate({ params: orgParamsSchema, query: listQuerySchema })],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { page, pageSize, search, type, status } = request.query as z.infer<typeof listQuerySchema>

    const where: Prisma.McpServerWhereInput = { organizationId: orgId }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } },
        { command: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (type) where.type = type
    if (status === 'enabled') where.enabled = true
    else if (status === 'disabled') where.enabled = false
    else if (status === 'connected') where.lastTestResult = { path: ['connected'], equals: true }
    else if (status === 'failed') where.lastTestResult = { path: ['connected'], equals: false }

    const orderBy = { createdAt: 'desc' as const }

    if (page) {
      const size = pageSize ?? 12
      const [items, total] = await prisma.$transaction([
        prisma.mcpServer.findMany({ where, orderBy, skip: (page - 1) * size, take: size }),
        prisma.mcpServer.count({ where }),
      ])
      return { data: { items, total, page, pageSize: size, totalPages: Math.max(1, Math.ceil(total / size)) } }
    }

    const servers = await prisma.mcpServer.findMany({ where, orderBy })
    return { data: servers }
  })

  // GET /api/mcp-servers/:id — Get MCP server
  fastify.get('/mcp-servers/:id', {
    preHandler: [fastify.authenticate, validate({ params: mcpParamsSchema })],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const server = await prisma.mcpServer.findUnique({ where: { id } })
    if (!server) throw new AppError(404, 'MCP server not found')
    await fastify.getMembership(request.userId!, server.organizationId)
    return { data: server }
  })

  // PATCH /api/mcp-servers/:id — Update MCP server
  fastify.patch('/mcp-servers/:id', {
    preHandler: [fastify.authenticate, validate({ params: mcpParamsSchema, body: updateMcpServerSchema })],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const existing = await prisma.mcpServer.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, 'MCP server not found')
    await fastify.ensureAdmin(request.userId!, existing.organizationId)
    const body = request.body as z.infer<typeof updateMcpServerSchema>
    try {
      const server = await prisma.mcpServer.update({
        where: { id },
        data: {
          ...body,
          args: body.args !== undefined ? (body.args as any) : undefined,
          headers: body.headers !== undefined ? (body.headers as any) : undefined,
          oauthState: body.authType !== 'oauth' ? Prisma.DbNull : undefined,
        },
      })
      return { data: server }
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new AppError(409, 'An MCP server with this name already exists in this organization')
      }
      throw err
    }
  })

  // DELETE /api/mcp-servers/:id — Delete MCP server
  fastify.delete('/mcp-servers/:id', {
    preHandler: [fastify.authenticate, validate({ params: mcpParamsSchema })],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const existing = await prisma.mcpServer.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, 'MCP server not found')
    await fastify.ensureAdmin(request.userId!, existing.organizationId)
    await prisma.agentMcpServer.deleteMany({ where: { mcpServerId: id } })
    await prisma.mcpServer.delete({ where: { id } })
    reply.code(204).send()
  })

  // POST /api/mcp-servers/:id/test — Test MCP server connection
  fastify.post('/mcp-servers/:id/test', {
    preHandler: [fastify.authenticate, validate({ params: mcpParamsSchema })],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const existing = await prisma.mcpServer.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, 'MCP server not found')
    await fastify.getMembership(request.userId!, existing.organizationId)

    const client = clientFromServer(existing, fastify.config.PUBLIC_URL)

    let testResult
    try {
      const tools = await client.listTools()
      await client.disconnect()
      testResult = { connected: true, tools: tools.map((t) => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })) }
    } catch (err) {
      await client.disconnect().catch(() => {})
      const url = client.authorizationUrl
      testResult = url
        ? { connected: false, needsAuth: true, redirectUrl: url, error: (err as Error).message }
        : { connected: false, error: (err as Error).message }
    }

    await prisma.mcpServer.update({
      where: { id },
      data: {
        lastTestResult: testResult as any,
        lastTestedAt: new Date(),
      },
    })

    return { data: testResult }
  })

  // POST /api/mcp-servers/:id/clear-test — Clear test result
  fastify.post('/mcp-servers/:id/clear-test', {
    preHandler: [fastify.authenticate, validate({ params: mcpParamsSchema })],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const existing = await prisma.mcpServer.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, 'MCP server not found')
    await fastify.ensureAdmin(request.userId!, existing.organizationId)
    await prisma.mcpServer.update({
      where: { id },
      data: { lastTestResult: null as any, lastTestedAt: null },
    })
    return { data: null }
  })

  // POST /api/agents/:agentId/mcp-servers/:serverId — Link MCP server to agent
  fastify.post('/agents/:agentId/mcp-servers/:serverId', {
    preHandler: [fastify.authenticate, validate({ params: z.object({ agentId: z.string().uuid(), serverId: z.string().uuid() }) })],
  }, async (request) => {
    const { agentId, serverId } = request.params as { agentId: string; serverId: string }
    const agent = await prisma.agent.findUnique({ where: { id: agentId } })
    if (!agent) throw new AppError(404, 'Agent not found')
    await fastify.ensureAdmin(request.userId!, agent.organizationId)
    const server = await prisma.mcpServer.findUnique({ where: { id: serverId } })
    if (!server || server.organizationId !== agent.organizationId) throw new AppError(404, 'MCP server not found in this organization')
    const link = await prisma.agentMcpServer.upsert({
      where: { agentId_mcpServerId: { agentId, mcpServerId: serverId } },
      create: { agentId, mcpServerId: serverId },
      update: {},
    })
    return { data: link }
  })

  // DELETE /api/agents/:agentId/mcp-servers/:serverId — Unlink MCP server from agent
  fastify.delete('/agents/:agentId/mcp-servers/:serverId', {
    preHandler: [fastify.authenticate, validate({ params: z.object({ agentId: z.string().uuid(), serverId: z.string().uuid() }) })],
  }, async (request, reply) => {
    const { agentId, serverId } = request.params as { agentId: string; serverId: string }
    const agent = await prisma.agent.findUnique({ where: { id: agentId } })
    if (!agent) throw new AppError(404, 'Agent not found')
    await fastify.ensureAdmin(request.userId!, agent.organizationId)
    await prisma.agentMcpServer.deleteMany({
      where: { agentId, mcpServerId: serverId },
    })
    reply.code(204).send()
  })

  // GET /api/agents/:agentId/mcp-servers — List MCP servers linked to agent
  fastify.get('/agents/:agentId/mcp-servers', {
    preHandler: [fastify.authenticate, validate({ params: z.object({ agentId: z.string().uuid() }) })],
  }, async (request) => {
    const { agentId } = request.params as { agentId: string }
    const agent = await prisma.agent.findUnique({ where: { id: agentId } })
    if (!agent) throw new AppError(404, 'Agent not found')
    await fastify.getMembership(request.userId!, agent.organizationId)
    const links = await prisma.agentMcpServer.findMany({
      where: { agentId },
      include: { mcpServer: true },
    })
    return { data: links.map((l) => l.mcpServer) }
  })
}

import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { createAgentSchema, updateAgentSchema } from '@convio/validation'
import { AppError } from '../../plugins/error.js'

export default async function agentsRoutes(fastify: FastifyInstance) {
  fastify.get('/agents', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const agents = await prisma.agent.findMany({
      where: { organizationId: (request.query as any).orgId },
      include: { tools: true },
    })
    return { data: agents }
  })

  fastify.post('/agents', {
    preHandler: [fastify.authenticate, validate({ body: createAgentSchema })],
  }, async (request) => {
    const agent = await prisma.agent.create({ data: request.body as any })
    return { data: agent }
  })

  fastify.get('/agents/:id', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { id } = request.params as any
    const agent = await prisma.agent.findUnique({ where: { id }, include: { tools: true } })
    if (!agent) throw new AppError(404, 'Agent not found')
    return { data: agent }
  })

  fastify.patch('/agents/:id', {
    preHandler: [fastify.authenticate, validate({ body: updateAgentSchema })],
  }, async (request) => {
    const { id } = request.params as any
    const agent = await prisma.agent.update({ where: { id }, data: request.body as any })
    return { data: agent }
  })

  fastify.delete('/agents/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as any
    await prisma.agent.delete({ where: { id } })
    reply.code(204).send()
  })

  fastify.post('/agents/:id/test', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { id } = request.params as any
    const { message } = request.body as any
    const agent = await prisma.agent.findUnique({ where: { id } })
    if (!agent) throw new AppError(404, 'Agent not found')
    return { data: { response: `Echo: ${message} (Agent: ${agent.name})` } }
  })
}

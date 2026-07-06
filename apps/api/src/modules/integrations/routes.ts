import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { AppError } from '../../plugins/error.js'

export default async function integrationsRoutes(fastify: FastifyInstance) {
  fastify.get('/integrations', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const integrations = await prisma.integration.findMany({
      where: { bot: { organizationId: (request.query as any).orgId } },
    })
    return { data: integrations }
  })

  fastify.post('/integrations', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const integration = await prisma.integration.create({ data: request.body as any })
    return { data: integration }
  })

  fastify.get('/integrations/:id', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { id } = request.params as any
    const integration = await prisma.integration.findUnique({ where: { id } })
    if (!integration) throw new AppError(404, 'Integration not found')
    return { data: integration }
  })

  fastify.patch('/integrations/:id', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { id } = request.params as any
    const integration = await prisma.integration.update({ where: { id }, data: request.body as any })
    return { data: integration }
  })

  fastify.delete('/integrations/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as any
    await prisma.integration.delete({ where: { id } })
    reply.code(204).send()
  })
}

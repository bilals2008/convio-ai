import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { createKnowledgeBaseSchema, updateKnowledgeBaseSchema } from '@convio/validation'
import { AppError } from '../../plugins/error.js'

export default async function knowledgeRoutes(fastify: FastifyInstance) {
  fastify.get('/knowledge', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const kbs = await prisma.knowledgeBase.findMany({
      where: { organizationId: (request.query as any).orgId },
    })
    return { data: kbs }
  })

  fastify.post('/knowledge', {
    preHandler: [fastify.authenticate, validate({ body: createKnowledgeBaseSchema })],
  }, async (request) => {
    const kb = await prisma.knowledgeBase.create({ data: request.body as any })
    return { data: kb }
  })

  fastify.get('/knowledge/:id', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { id } = request.params as any
    const kb = await prisma.knowledgeBase.findUnique({
      where: { id },
      include: { documents: true },
    })
    if (!kb) throw new AppError(404, 'Knowledge base not found')
    return { data: kb }
  })

  fastify.patch('/knowledge/:id', {
    preHandler: [fastify.authenticate, validate({ body: updateKnowledgeBaseSchema })],
  }, async (request) => {
    const { id } = request.params as any
    const kb = await prisma.knowledgeBase.update({ where: { id }, data: request.body as any })
    return { data: kb }
  })

  fastify.delete('/knowledge/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as any
    await prisma.knowledgeBase.delete({ where: { id } })
    reply.code(204).send()
  })

  // Documents
  fastify.post('/knowledge/:kbId/documents', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { kbId } = request.params as any
    const doc = await prisma.document.create({
      data: { ...request.body as any, knowledgeBaseId: kbId },
    })
    return { data: doc }
  })

  fastify.get('/documents/:id/status', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { id } = request.params as any
    const doc = await prisma.document.findUnique({ where: { id } })
    if (!doc) throw new AppError(404, 'Document not found')
    return { data: { id: doc.id, name: doc.name, status: doc.status } }
  })

  fastify.delete('/documents/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as any
    await prisma.document.delete({ where: { id } })
    reply.code(204).send()
  })
}

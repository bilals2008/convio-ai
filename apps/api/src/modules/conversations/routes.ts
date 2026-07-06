import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { createConversationSchema, updateConversationSchema } from '@convio/validation'
import { AppError } from '../../plugins/error.js'

export default async function conversationsRoutes(fastify: FastifyInstance) {
  fastify.get('/conversations', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const conversations = await prisma.conversation.findMany({
      where: { bot: { organizationId: (request.query as any).orgId } },
      include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } },
      orderBy: { updatedAt: 'desc' },
    })
    return { data: conversations }
  })

  fastify.post('/conversations', {
    preHandler: [fastify.authenticate, validate({ body: createConversationSchema })],
  }, async (request) => {
    const conversation = await prisma.conversation.create({ data: request.body as any })
    return { data: conversation }
  })

  fastify.get('/conversations/:id', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { id } = request.params as any
    const conversation = await prisma.conversation.findUnique({ where: { id } })
    if (!conversation) throw new AppError(404, 'Conversation not found')
    return { data: conversation }
  })

  fastify.patch('/conversations/:id', {
    preHandler: [fastify.authenticate, validate({ body: updateConversationSchema })],
  }, async (request) => {
    const { id } = request.params as any
    const conversation = await prisma.conversation.update({ where: { id }, data: request.body as any })
    return { data: conversation }
  })

  fastify.delete('/conversations/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as any
    await prisma.conversation.delete({ where: { id } })
    reply.code(204).send()
  })
}

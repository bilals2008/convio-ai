import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { createMessageSchema } from '@convio/validation'
import { AppError } from '../../plugins/error.js'

export default async function messagesRoutes(fastify: FastifyInstance) {
  fastify.get('/conversations/:conversationId/messages', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { conversationId } = request.params as any
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    })
    return { data: messages }
  })

  fastify.post('/conversations/:conversationId/messages', {
    preHandler: [fastify.authenticate, validate({ body: createMessageSchema })],
  }, async (request) => {
    const { conversationId } = request.params as any
    const message = await prisma.message.create({
      data: { ...request.body as any, conversationId },
    })
    return { data: message }
  })
}

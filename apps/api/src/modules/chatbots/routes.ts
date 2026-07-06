import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { createBotSchema, updateBotSchema } from '@convio/validation'
import { AppError } from '../../plugins/error.js'

export default async function chatbotsRoutes(fastify: FastifyInstance) {
  fastify.get('/bots', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const bots = await prisma.bot.findMany({
      where: { organizationId: (request.query as any).orgId },
      include: { agent: true },
    })
    return { data: bots }
  })

  fastify.post('/bots', {
    preHandler: [fastify.authenticate, validate({ body: createBotSchema })],
  }, async (request) => {
    const bot = await prisma.bot.create({ data: request.body as any })
    return { data: bot }
  })

  fastify.get('/bots/:id', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { id } = request.params as any
    const bot = await prisma.bot.findUnique({ where: { id }, include: { agent: true } })
    if (!bot) throw new AppError(404, 'Bot not found')
    return { data: bot }
  })

  fastify.patch('/bots/:id', {
    preHandler: [fastify.authenticate, validate({ body: updateBotSchema })],
  }, async (request) => {
    const { id } = request.params as any
    const bot = await prisma.bot.update({ where: { id }, data: request.body as any })
    return { data: bot }
  })

  fastify.delete('/bots/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as any
    await prisma.bot.delete({ where: { id } })
    reply.code(204).send()
  })

  fastify.get('/bots/:id/embed', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { id } = request.params as any
    const bot = await prisma.bot.findUnique({ where: { id } })
    if (!bot) throw new AppError(404, 'Bot not found')
    const snippet = `<script src="${process.env.CORS_ORIGIN || 'http://localhost:5173'}/widget.js" data-bot-id="${bot.id}"></script>`
    return { data: { snippet } }
  })
}

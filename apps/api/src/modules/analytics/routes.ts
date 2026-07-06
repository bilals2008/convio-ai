import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'

export default async function analyticsRoutes(fastify: FastifyInstance) {
  fastify.get('/analytics/overview', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const orgId = (request.query as any).orgId
    const bots = await prisma.bot.count({ where: { organizationId: orgId } })
    const conversations = await prisma.conversation.count({
      where: { bot: { organizationId: orgId } },
    })
    const messages = await prisma.message.count({
      where: { conversation: { bot: { organizationId: orgId } } },
    })
    return { data: { bots, conversations, messages } }
  })

  fastify.get('/analytics/bots/:id', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { id } = request.params as any
    const conversations = await prisma.conversation.count({ where: { botId: id } })
    const messages = await prisma.message.count({
      where: { conversation: { botId: id } },
    })
    return { data: { botId: id, conversations, messages } }
  })

  fastify.get('/analytics/conversations', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const orgId = (request.query as any).orgId
    const stats = await prisma.conversation.groupBy({
      by: ['channel'],
      where: { bot: { organizationId: orgId } },
      _count: { id: true },
    })
    return { data: stats.map((s) => ({ channel: s.channel, count: s._count.id })) }
  })
}

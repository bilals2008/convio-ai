import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { AppError } from '../../plugins/error.js'
import { z } from 'zod'

const dateRegex = /^\d{4}-\d{2}-\d{2}$/
const dateSchema = z.string().regex(dateRegex, 'Date must be YYYY-MM-DD')

const orgParamsSchema = z.object({
  orgId: z.string().uuid(),
})

const botParamsSchema = z.object({
  botId: z.string().uuid(),
})

const dateRangeQuerySchema = z.object({
  from: dateSchema.optional(),
  to: dateSchema.optional(),
})

const topBotsQuerySchema = z.object({
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
})

const snapshotBodySchema = z.object({
  date: dateSchema,
  totalConversations: z.number().int().min(0).default(0),
  totalMessages: z.number().int().min(0).default(0),
  uniqueUsers: z.number().int().min(0).default(0),
  avgResponseTime: z.number().min(0).default(0),
  satisfactionScore: z.number().min(0).max(5).optional(),
})

function getDefaultDateRange(from?: string, to?: string) {
  const now = new Date()
  const toDate = to ? new Date(to) : now
  const fromDate = from ? new Date(from) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  return { fromDate, toDate }
}

export default async function analyticsRoutes(fastify: FastifyInstance) {
  // GET /api/organizations/:orgId/analytics — Org-wide aggregate analytics
  fastify.get('/organizations/:orgId/analytics', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema, query: dateRangeQuerySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { from, to } = request.query as { from?: string; to?: string }

    await fastify.getMembership(request.userId!, orgId)

    const { fromDate, toDate } = getDefaultDateRange(from, to)

    const analyticsRecords = await prisma.analytics.findMany({
      where: {
        bot: { organizationId: orgId },
        date: { gte: fromDate, lte: toDate },
      },
      orderBy: { date: 'asc' },
    })

    const totals = analyticsRecords.reduce(
      (acc, r) => ({
        totalConversations: acc.totalConversations + r.totalConversations,
        totalMessages: acc.totalMessages + r.totalMessages,
        uniqueUsers: acc.uniqueUsers + r.uniqueUsers,
        avgResponseTime: analyticsRecords.length > 0
          ? acc.avgResponseTime + r.avgResponseTime
          : acc.avgResponseTime,
      }),
      { totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0 },
    )

    const dailyCounts = new Map<string, number>()
    const dailyBreakdown = analyticsRecords.reduce<Record<string, {
      date: string
      totalConversations: number
      totalMessages: number
      uniqueUsers: number
      avgResponseTime: number
    }>>((acc, r) => {
      const key = r.date.toISOString().slice(0, 10)
      if (!acc[key]) {
        acc[key] = { date: key, totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0 }
        dailyCounts.set(key, 0)
      }
      acc[key].totalConversations += r.totalConversations
      acc[key].totalMessages += r.totalMessages
      acc[key].uniqueUsers += r.uniqueUsers
      acc[key].avgResponseTime += r.avgResponseTime
      dailyCounts.set(key, dailyCounts.get(key)! + 1)
      return acc
    }, {})

    return {
      data: {
        totalConversations: totals.totalConversations,
        totalMessages: totals.totalMessages,
        uniqueUsers: totals.uniqueUsers,
        avgResponseTime: analyticsRecords.length > 0
          ? Math.round((totals.avgResponseTime / analyticsRecords.length) * 100) / 100
          : 0,
        dailyBreakdown: Object.values(dailyBreakdown).map((d) => {
          const count = dailyCounts.get(d.date) || 1
          return {
            ...d,
            avgResponseTime: Math.round((d.avgResponseTime / count) * 100) / 100,
          }
        }),
      },
    }
  })

  // GET /api/bots/:botId/analytics — Single bot aggregate analytics
  fastify.get('/bots/:botId/analytics', {
    preHandler: [
      fastify.authenticate,
      validate({ params: botParamsSchema, query: dateRangeQuerySchema }),
    ],
  }, async (request) => {
    const { botId } = request.params as { botId: string }
    const { from, to } = request.query as { from?: string; to?: string }

    const bot = await prisma.bot.findUnique({ where: { id: botId } })
    if (!bot) throw new AppError(404, 'Bot not found')

    await fastify.getMembership(request.userId!, bot.organizationId)

    const { fromDate, toDate } = getDefaultDateRange(from, to)

    const records = await prisma.analytics.findMany({
      where: { botId, date: { gte: fromDate, lte: toDate } },
      orderBy: { date: 'asc' },
    })

    const totals = records.reduce(
      (acc, r) => ({
        totalConversations: acc.totalConversations + r.totalConversations,
        totalMessages: acc.totalMessages + r.totalMessages,
        uniqueUsers: acc.uniqueUsers + r.uniqueUsers,
        avgResponseTime: acc.avgResponseTime + r.avgResponseTime,
        satisfactionScores: r.satisfactionScore != null
          ? [...acc.satisfactionScores, r.satisfactionScore]
          : acc.satisfactionScores,
      }),
      {
        totalConversations: 0,
        totalMessages: 0,
        uniqueUsers: 0,
        avgResponseTime: 0,
        satisfactionScores: [] as number[],
      },
    )

    const dailyBreakdown = records.map((r) => ({
      date: r.date.toISOString().slice(0, 10),
      totalConversations: r.totalConversations,
      totalMessages: r.totalMessages,
      uniqueUsers: r.uniqueUsers,
      avgResponseTime: r.avgResponseTime,
    }))

    return {
      data: {
        totalConversations: totals.totalConversations,
        totalMessages: totals.totalMessages,
        uniqueUsers: totals.uniqueUsers,
        avgResponseTime: records.length > 0
          ? Math.round((totals.avgResponseTime / records.length) * 100) / 100
          : 0,
        satisfactionScore: totals.satisfactionScores.length > 0
          ? Math.round((totals.satisfactionScores.reduce((s, v) => s + v, 0) / totals.satisfactionScores.length) * 100) / 100
          : null,
        dailyBreakdown,
      },
    }
  })

  // GET /api/bots/:botId/analytics/daily — Daily breakdown for charts
  fastify.get('/bots/:botId/analytics/daily', {
    preHandler: [
      fastify.authenticate,
      validate({ params: botParamsSchema, query: dateRangeQuerySchema }),
    ],
  }, async (request) => {
    const { botId } = request.params as { botId: string }
    const { from, to } = request.query as { from?: string; to?: string }

    const bot = await prisma.bot.findUnique({ where: { id: botId } })
    if (!bot) throw new AppError(404, 'Bot not found')

    await fastify.getMembership(request.userId!, bot.organizationId)

    const { fromDate, toDate } = getDefaultDateRange(from, to)

    const records = await prisma.analytics.findMany({
      where: { botId, date: { gte: fromDate, lte: toDate } },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        totalConversations: true,
        totalMessages: true,
        uniqueUsers: true,
        avgResponseTime: true,
      },
    })

    return {
      data: records.map((r) => ({
        date: r.date.toISOString().slice(0, 10),
        totalConversations: r.totalConversations,
        totalMessages: r.totalMessages,
        uniqueUsers: r.uniqueUsers,
        avgResponseTime: r.avgResponseTime,
      })),
    }
  })

  // GET /api/organizations/:orgId/analytics/top-bots — Top performing bots
  fastify.get('/organizations/:orgId/analytics/top-bots', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema, query: topBotsQuerySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { from, to, limit } = request.query as { from?: string; to?: string; limit: number }

    await fastify.getMembership(request.userId!, orgId)

    const { fromDate, toDate } = getDefaultDateRange(from, to)

    const records = await prisma.analytics.groupBy({
      by: ['botId'],
      where: {
        bot: { organizationId: orgId },
        date: { gte: fromDate, lte: toDate },
      },
      _sum: {
        totalConversations: true,
        totalMessages: true,
      },
      _avg: {
        avgResponseTime: true,
      },
      orderBy: {
        _sum: { totalConversations: 'desc' },
      },
      take: limit,
    })

    const botIds = records.map((r) => r.botId)
    const bots = botIds.length > 0
      ? await prisma.bot.findMany({
          where: { id: { in: botIds } },
          select: { id: true, name: true },
        })
      : []

    const botMap = new Map(bots.map((b) => [b.id, b.name]))

    return {
      data: records.map((r) => ({
        botId: r.botId,
        botName: botMap.get(r.botId) || 'Unknown',
        totalConversations: r._sum.totalConversations || 0,
        totalMessages: r._sum.totalMessages || 0,
        avgResponseTime: r._avg.avgResponseTime
          ? Math.round(r._avg.avgResponseTime * 100) / 100
          : 0,
      })),
    }
  })

  // POST /api/bots/:botId/analytics/snapshot — Upsert daily analytics snapshot
  fastify.post('/bots/:botId/analytics/snapshot', {
    preHandler: [
      fastify.authenticate,
      validate({ params: botParamsSchema, body: snapshotBodySchema }),
    ],
  }, async (request) => {
    const { botId } = request.params as { botId: string }
    const { date, totalConversations, totalMessages, uniqueUsers, avgResponseTime, satisfactionScore } =
      request.body as {
        date: string
        totalConversations: number
        totalMessages: number
        uniqueUsers: number
        avgResponseTime: number
        satisfactionScore?: number
      }

    const bot = await prisma.bot.findUnique({ where: { id: botId } })
    if (!bot) throw new AppError(404, 'Bot not found')

    await fastify.getMembership(request.userId!, bot.organizationId)

    const targetDate = new Date(date)

    const existing = await prisma.analytics.findUnique({
      where: { botId_date: { botId, date: targetDate } },
    })

    let result
    if (existing) {
      result = await prisma.analytics.update({
        where: { botId_date: { botId, date: targetDate } },
        data: {
          totalConversations: existing.totalConversations + totalConversations,
          totalMessages: existing.totalMessages + totalMessages,
          uniqueUsers: existing.uniqueUsers + uniqueUsers,
          avgResponseTime: existing.avgResponseTime > 0
            ? Math.round(((existing.avgResponseTime + avgResponseTime) / 2) * 100) / 100
            : avgResponseTime,
          satisfactionScore: satisfactionScore ?? existing.satisfactionScore,
        },
      })
    } else {
      result = await prisma.analytics.create({
        data: {
          botId,
          date: targetDate,
          totalConversations,
          totalMessages,
          uniqueUsers,
          avgResponseTime,
          satisfactionScore,
        },
      })
    }

    return { data: result }
  })
}

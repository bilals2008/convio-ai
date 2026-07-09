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

const agentParamsSchema = z.object({
  agentId: z.string().uuid(),
})

const dateRangeQuerySchema = z.object({
  from: dateSchema.optional(),
  to: dateSchema.optional(),
})

const topAgentsQuerySchema = z.object({
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

    const rangeMs = toDate.getTime() - fromDate.getTime()
    const prevFromDate = new Date(fromDate.getTime() - rangeMs)
    const prevToDate = new Date(fromDate.getTime() - 1)

    const analyticsRecords = await prisma.analytics.findMany({
      where: {
        agent: { organizationId: orgId },
        date: { gte: fromDate, lte: toDate },
      },
      orderBy: { date: 'asc' },
    })

    const prevAnalyticsRecords = await prisma.analytics.findMany({
      where: {
        agent: { organizationId: orgId },
        date: { gte: prevFromDate, lte: prevToDate },
      },
    })

    const calcTotals = (records: typeof analyticsRecords) =>
      records.reduce(
        (acc, r) => ({
          totalConversations: acc.totalConversations + r.totalConversations,
          totalMessages: acc.totalMessages + r.totalMessages,
          uniqueUsers: acc.uniqueUsers + r.uniqueUsers,
          avgResponseTime: records.length > 0 ? acc.avgResponseTime + r.avgResponseTime : 0,
        }),
        { totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0 },
      )

    let totals = calcTotals(analyticsRecords)
    let prevTotals = calcTotals(prevAnalyticsRecords)

    let dailyBreakdownData: { date: string; totalConversations: number; totalMessages: number; uniqueUsers: number; avgResponseTime: number }[] = []

    if (analyticsRecords.length === 0) {
      const agentWhere = { agent: { organizationId: orgId } }

      const [realtimeConversations, realtimeMessages, realtimeUsers, prevConversations, prevMessages] = await Promise.all([
        prisma.conversation.count({
          where: { ...agentWhere, createdAt: { gte: fromDate, lte: toDate } },
        }),
        prisma.message.count({
          where: { conversation: agentWhere, createdAt: { gte: fromDate, lte: toDate } },
        }),
        prisma.conversation.groupBy({
          by: ['userId'],
          where: { ...agentWhere, createdAt: { gte: fromDate, lte: toDate }, userId: { not: null } },
          _count: { id: true },
        }),
        prisma.conversation.count({
          where: { ...agentWhere, createdAt: { gte: prevFromDate, lte: prevToDate } },
        }),
        prisma.message.count({
          where: { conversation: agentWhere, createdAt: { gte: prevFromDate, lte: prevToDate } },
        }),
      ])

      totals = {
        totalConversations: realtimeConversations,
        totalMessages: realtimeMessages,
        uniqueUsers: realtimeUsers.length,
        avgResponseTime: 0,
      }
      prevTotals = {
        totalConversations: prevConversations,
        totalMessages: prevMessages,
        uniqueUsers: 0,
        avgResponseTime: 0,
      }

      const convByDate = await prisma.conversation.groupBy({
        by: ['createdAt'],
        where: { ...agentWhere, createdAt: { gte: fromDate, lte: toDate } },
        _count: { id: true },
      })

      const msgByDate = await prisma.$queryRaw<{ date: Date; count: bigint }[]>`
        SELECT DATE(m."createdAt") as date, COUNT(*)::int as count
        FROM "Message" m
        JOIN "Conversation" c ON c."id" = m."conversationId"
        JOIN "Agent" a ON a."id" = c."agentId"
        WHERE a."organizationId" = ${orgId}
          AND m."createdAt" >= ${fromDate}
          AND m."createdAt" <= ${toDate}
        GROUP BY DATE(m."createdAt")
        ORDER BY date ASC
      `

      const msgMap = new Map(msgByDate.map((r) => [r.date.toISOString().slice(0, 10), Number(r.count)]))

      const dailyMap = new Map<string, { date: string; totalConversations: number; totalMessages: number; uniqueUsers: number; avgResponseTime: number }>()
      for (const r of convByDate) {
        const key = r.createdAt.toISOString().slice(0, 10)
        if (!dailyMap.has(key)) {
          dailyMap.set(key, { date: key, totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0 })
        }
        dailyMap.get(key)!.totalConversations += r._count.id
      }
      for (const [date, count] of msgMap) {
        if (!dailyMap.has(date)) {
          dailyMap.set(date, { date, totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0 })
        }
        dailyMap.get(date)!.totalMessages += count
      }
      dailyBreakdownData = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))
    }

    const recordCount = analyticsRecords.length || 1

    const avgResponseTime = recordCount > 0 ? Math.round((totals.avgResponseTime / recordCount) * 100) / 100 : 0
    const prevAvgResponseTime = prevTotals.avgResponseTime > 0 ? Math.round((prevTotals.avgResponseTime / (prevAnalyticsRecords.length || 1)) * 100) / 100 : 0

    function pctChange(current: number, previous: number) {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 1000) / 10
    }

    const dailyCounts = new Map<string, number>()
    const dailyBreakdownFromSnapshots = analyticsRecords.reduce<Record<string, {
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

    const finalDaily = dailyBreakdownData.length > 0
      ? dailyBreakdownData
      : Object.values(dailyBreakdownFromSnapshots).map((d) => ({
          ...d,
          avgResponseTime: Math.round((d.avgResponseTime / (dailyCounts.get(d.date) || 1)) * 100) / 100,
        }))

    const channelBreakdownResult = await prisma.conversation.groupBy({
      by: ['channel'],
      where: {
        agent: { organizationId: orgId },
        createdAt: { gte: fromDate, lte: toDate },
      },
      _count: { id: true },
    })

    const channelBreakdown = channelBreakdownResult.map((c) => ({
      channel: c.channel,
      count: c._count.id,
    }))

    return {
      data: {
        totalConversations: totals.totalConversations,
        totalMessages: totals.totalMessages,
        uniqueUsers: totals.uniqueUsers,
        avgResponseTime,
        conversationsChange: pctChange(totals.totalConversations, prevTotals.totalConversations),
        messagesChange: pctChange(totals.totalMessages, prevTotals.totalMessages),
        usersChange: pctChange(totals.uniqueUsers, prevTotals.uniqueUsers),
        responseTimeChange: prevAvgResponseTime > 0 ? -pctChange(avgResponseTime, prevAvgResponseTime) : 0,
        channelBreakdown,
        dailyBreakdown: finalDaily,
      },
    }
  })

  // GET /api/agents/:agentId/analytics — Single agent aggregate analytics
  fastify.get('/agents/:agentId/analytics', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema, query: dateRangeQuerySchema }),
    ],
  }, async (request) => {
    const { agentId } = request.params as { agentId: string }
    const { from, to } = request.query as { from?: string; to?: string }

    const agent = await prisma.agent.findUnique({ where: { id: agentId } })
    if (!agent) throw new AppError(404, 'Agent not found')

    await fastify.getMembership(request.userId!, agent.organizationId)

    const { fromDate, toDate } = getDefaultDateRange(from, to)

    const rangeMs = toDate.getTime() - fromDate.getTime()
    const prevFromDate = new Date(fromDate.getTime() - rangeMs)
    const prevToDate = new Date(fromDate.getTime() - 1)

    const records = await prisma.analytics.findMany({
      where: { agentId, date: { gte: fromDate, lte: toDate } },
      orderBy: { date: 'asc' },
    })

    const prevRecords = await prisma.analytics.findMany({
      where: { agentId, date: { gte: prevFromDate, lte: prevToDate } },
    })

    const calcTotals = (recs: typeof records) =>
      recs.reduce(
        (acc, r) => ({
          totalConversations: acc.totalConversations + r.totalConversations,
          totalMessages: acc.totalMessages + r.totalMessages,
          uniqueUsers: acc.uniqueUsers + r.uniqueUsers,
          avgResponseTime: recs.length > 0 ? acc.avgResponseTime + r.avgResponseTime : 0,
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

    const totals = calcTotals(records)
    const prevTotals = calcTotals(prevRecords)

    const recordCount = records.length
    const prevRecordCount = prevRecords.length

    const avgResponseTime = recordCount > 0 ? Math.round((totals.avgResponseTime / recordCount) * 100) / 100 : 0
    const prevAvgResponseTime = prevRecordCount > 0 ? Math.round((prevTotals.avgResponseTime / prevRecordCount) * 100) / 100 : 0

    function pctChange(current: number, previous: number) {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 1000) / 10
    }

    let dailyBreakdown = records.map((r) => ({
      date: r.date.toISOString().slice(0, 10),
      totalConversations: r.totalConversations,
      totalMessages: r.totalMessages,
      uniqueUsers: r.uniqueUsers,
      avgResponseTime: r.avgResponseTime,
    }))

    if (dailyBreakdown.length === 0) {
      const convByDate = await prisma.conversation.groupBy({
        by: ['createdAt'],
        where: { agentId, createdAt: { gte: fromDate, lte: toDate } },
        _count: { id: true },
      })

      const msgByDate = await prisma.$queryRaw<{ date: Date; count: bigint }[]>`
        SELECT DATE(m."createdAt") as date, COUNT(*)::int as count
        FROM "Message" m
        JOIN "Conversation" c ON c."id" = m."conversationId"
        WHERE c."agentId" = ${agentId}
          AND m."createdAt" >= ${fromDate}
          AND m."createdAt" <= ${toDate}
        GROUP BY DATE(m."createdAt")
        ORDER BY date ASC
      `

      const msgMap = new Map(msgByDate.map((r) => [r.date.toISOString().slice(0, 10), Number(r.count)]))
      const dailyMap = new Map<string, { date: string; totalConversations: number; totalMessages: number; uniqueUsers: number; avgResponseTime: number }>()

      for (const r of convByDate) {
        const key = r.createdAt.toISOString().slice(0, 10)
        if (!dailyMap.has(key)) {
          dailyMap.set(key, { date: key, totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0 })
        }
        dailyMap.get(key)!.totalConversations += r._count.id
      }
      for (const [date, count] of msgMap) {
        if (!dailyMap.has(date)) {
          dailyMap.set(date, { date, totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0 })
        }
        dailyMap.get(date)!.totalMessages += count
      }
      dailyBreakdown = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))
    }

    const channelBreakdownResult = await prisma.conversation.groupBy({
      by: ['channel'],
      where: { agentId, createdAt: { gte: fromDate, lte: toDate } },
      _count: { id: true },
    })

    const channelBreakdown = channelBreakdownResult.map((c) => ({
      channel: c.channel,
      count: c._count.id,
    }))

    return {
      data: {
        totalConversations: totals.totalConversations,
        totalMessages: totals.totalMessages,
        uniqueUsers: totals.uniqueUsers,
        avgResponseTime,
        conversationsChange: pctChange(totals.totalConversations, prevTotals.totalConversations),
        messagesChange: pctChange(totals.totalMessages, prevTotals.totalMessages),
        usersChange: pctChange(totals.uniqueUsers, prevTotals.uniqueUsers),
        responseTimeChange: -pctChange(avgResponseTime, prevAvgResponseTime),
        satisfactionScore: totals.satisfactionScores.length > 0
          ? Math.round((totals.satisfactionScores.reduce((s, v) => s + v, 0) / totals.satisfactionScores.length) * 100) / 100
          : null,
        channelBreakdown,
        dailyBreakdown,
      },
    }
  })

  // GET /api/agents/:agentId/analytics/daily — Daily breakdown for charts
  fastify.get('/agents/:agentId/analytics/daily', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema, query: dateRangeQuerySchema }),
    ],
  }, async (request) => {
    const { agentId } = request.params as { agentId: string }
    const { from, to } = request.query as { from?: string; to?: string }

    const agent = await prisma.agent.findUnique({ where: { id: agentId } })
    if (!agent) throw new AppError(404, 'Agent not found')

    await fastify.getMembership(request.userId!, agent.organizationId)

    const { fromDate, toDate } = getDefaultDateRange(from, to)

    const records = await prisma.analytics.findMany({
      where: { agentId, date: { gte: fromDate, lte: toDate } },
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

  // GET /api/organizations/:orgId/analytics/top-agents — Top performing agents
  fastify.get('/organizations/:orgId/analytics/top-agents', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema, query: topAgentsQuerySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { from, to, limit } = request.query as { from?: string; to?: string; limit: number }

    await fastify.getMembership(request.userId!, orgId)

    const { fromDate, toDate } = getDefaultDateRange(from, to)

    const records = await prisma.analytics.groupBy({
      by: ['agentId'],
      where: {
        agent: { organizationId: orgId },
        date: { gte: fromDate, lte: toDate },
      },
      _sum: {
        totalConversations: true,
        totalMessages: true,
      },
      _avg: {
        avgResponseTime: true,
        satisfactionScore: true,
      },
      orderBy: {
        _sum: { totalConversations: 'desc' },
      },
      take: limit,
    })

    if (records.length > 0) {
      const agentIds = records.map((r) => r.agentId)
      const agents = agentIds.length > 0
        ? await prisma.agent.findMany({
            where: { id: { in: agentIds } },
            select: { id: true, name: true },
          })
        : []
      const agentMap = new Map(agents.map((b) => [b.id, b.name]))

      return {
        data: records.map((r) => ({
          agentId: r.agentId,
          agentName: agentMap.get(r.agentId) || 'Unknown',
          totalConversations: r._sum.totalConversations || 0,
          totalMessages: r._sum.totalMessages || 0,
          avgResponseTime: r._avg.avgResponseTime
            ? Math.round(r._avg.avgResponseTime * 100) / 100
            : 0,
          satisfactionScore: r._avg.satisfactionScore
            ? Math.round(r._avg.satisfactionScore * 100) / 100
            : null,
        })),
      }
    }

    const liveAgents = await prisma.agent.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true },
    })

    const liveAgentData = await Promise.all(
      liveAgents.map(async (agent) => {
        const [convCount, msgCount] = await Promise.all([
          prisma.conversation.count({
            where: { agentId: agent.id, createdAt: { gte: fromDate, lte: toDate } },
          }),
          prisma.message.count({
            where: { conversation: { agentId: agent.id }, createdAt: { gte: fromDate, lte: toDate } },
          }),
        ])
        return {
          agentId: agent.id,
          agentName: agent.name,
          totalConversations: convCount,
          totalMessages: msgCount,
          avgResponseTime: 0,
          satisfactionScore: null,
        }
      }),
    )

    liveAgentData.sort((a, b) => b.totalConversations - a.totalConversations)

    return {
      data: liveAgentData.slice(0, limit),
    }
  })

  // POST /api/agents/:agentId/analytics/snapshot — Upsert daily analytics snapshot
  fastify.post('/agents/:agentId/analytics/snapshot', {
    preHandler: [
      fastify.authenticate,
      validate({ params: agentParamsSchema, body: snapshotBodySchema }),
    ],
  }, async (request) => {
    const { agentId } = request.params as { agentId: string }
    const { date, totalConversations, totalMessages, uniqueUsers, avgResponseTime, satisfactionScore } =
      request.body as {
        date: string
        totalConversations: number
        totalMessages: number
        uniqueUsers: number
        avgResponseTime: number
        satisfactionScore?: number
      }

    const agent = await prisma.agent.findUnique({ where: { id: agentId } })
    if (!agent) throw new AppError(404, 'Agent not found')

    await fastify.getMembership(request.userId!, agent.organizationId)

    const targetDate = new Date(date)

    const existing = await prisma.analytics.findUnique({
      where: { agentId_date: { agentId, date: targetDate } },
    })

    let result
    if (existing) {
      result = await prisma.analytics.update({
        where: { agentId_date: { agentId, date: targetDate } },
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
          agentId,
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

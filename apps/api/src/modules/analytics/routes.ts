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

    const [agents] = await Promise.all([
      prisma.agent.findMany({
        where: { organizationId: orgId },
        select: { id: true },
      }),
    ])
    const agentIds = agents.map((a) => a.id)

    const rangeMs = toDate.getTime() - fromDate.getTime()
    const prevFromDate = new Date(fromDate.getTime() - rangeMs)
    const prevToDate = new Date(fromDate.getTime() - 1)

    const [analyticsRecords, prevAnalyticsRecords] = await Promise.all([
      prisma.analytics.findMany({
        where: { agentId: { in: agentIds }, date: { gte: fromDate, lte: toDate } },
        orderBy: { date: 'asc' },
        take: 365,
      }),
      prisma.analytics.findMany({
        where: { agentId: { in: agentIds }, date: { gte: prevFromDate, lte: prevToDate } },
        take: 365,
      }),
    ])

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
    let realtimeInputTokens = 0
    let realtimeOutputTokens = 0

    const [responseTimeResult, prevResponseTimeResult, tokenResult] = await Promise.all([
      prisma.$queryRaw<{ avg: number | null }[]>`
        SELECT AVG("response_time_ms") as avg
        FROM "Message" m
        JOIN "Conversation" c ON c."id" = m."conversationId"
        WHERE c."agentId" = ANY(${agentIds})
          AND m."role" = 'assistant'
          AND m."response_time_ms" IS NOT NULL
          AND m."createdAt" >= ${fromDate}
          AND m."createdAt" <= ${toDate}
      `,
      prisma.$queryRaw<{ avg: number | null }[]>`
        SELECT AVG("response_time_ms") as avg
        FROM "Message" m
        JOIN "Conversation" c ON c."id" = m."conversationId"
        WHERE c."agentId" = ANY(${agentIds})
          AND m."role" = 'assistant'
          AND m."response_time_ms" IS NOT NULL
          AND m."createdAt" >= ${prevFromDate}
          AND m."createdAt" <= ${prevToDate}
      `,
      prisma.$queryRaw<{ input: bigint | null; output: bigint | null }[]>`
        SELECT SUM("input_tokens") as input, SUM("output_tokens") as output
        FROM "Message" m
        JOIN "Conversation" c ON c."id" = m."conversationId"
        WHERE c."agentId" = ANY(${agentIds})
          AND m."role" = 'assistant'
          AND m."createdAt" >= ${fromDate}
          AND m."createdAt" <= ${toDate}
      `,
    ])

    const realAvgRT = responseTimeResult[0]?.avg
      ? Math.round((responseTimeResult[0].avg / 1000) * 100) / 100
      : 0
    const prevRealAvgRT = prevResponseTimeResult[0]?.avg
      ? Math.round((prevResponseTimeResult[0].avg / 1000) * 100) / 100
      : 0

    const inputTokens = tokenResult[0]?.input ? Number(tokenResult[0].input) : 0
    const outputTokens = tokenResult[0]?.output ? Number(tokenResult[0].output) : 0
    realtimeInputTokens = inputTokens
    realtimeOutputTokens = outputTokens

    if (analyticsRecords.length === 0 || totals.totalConversations === 0) {
      const [realtimeConversations, realtimeMessages, realtimeUsers, prevConversations, prevMessages] = await Promise.all([
        prisma.conversation.count({
          where: { agentId: { in: agentIds }, createdAt: { gte: fromDate, lte: toDate } },
        }),
        prisma.message.count({
          where: { conversation: { agentId: { in: agentIds } }, createdAt: { gte: fromDate, lte: toDate } },
        }),
        prisma.conversation.groupBy({
          by: ['userId'],
          where: { agentId: { in: agentIds }, createdAt: { gte: fromDate, lte: toDate }, userId: { not: null } },
          _count: { id: true },
        }),
        prisma.conversation.count({
          where: { agentId: { in: agentIds }, createdAt: { gte: prevFromDate, lte: prevToDate } },
        }),
        prisma.message.count({
          where: { conversation: { agentId: { in: agentIds } }, createdAt: { gte: prevFromDate, lte: prevToDate } },
        }),
      ])

      totals = {
        totalConversations: realtimeConversations,
        totalMessages: realtimeMessages,
        uniqueUsers: realtimeUsers.length,
        avgResponseTime: realAvgRT,
      }
      prevTotals = {
        totalConversations: prevConversations,
        totalMessages: prevMessages,
        uniqueUsers: 0,
        avgResponseTime: prevRealAvgRT,
      }

      const [convByDate, msgByDate, rtByDate, dailyTokens] = await Promise.all([
        prisma.conversation.groupBy({
          by: ['createdAt'],
          where: { agentId: { in: agentIds }, createdAt: { gte: fromDate, lte: toDate } },
          _count: { id: true },
          orderBy: { createdAt: 'asc' },
          take: 365,
        }),
        prisma.$queryRaw<{ date: Date; count: bigint }[]>`
          SELECT DATE(m."createdAt") as date, COUNT(*)::int as count
          FROM "Message" m
          JOIN "Conversation" c ON c."id" = m."conversationId"
          WHERE c."agentId" = ANY(${agentIds})
            AND m."createdAt" >= ${fromDate}
            AND m."createdAt" <= ${toDate}
          GROUP BY DATE(m."createdAt")
          ORDER BY date ASC
        `,
        prisma.$queryRaw<{ date: Date; avg: number | null }[]>`
          SELECT DATE(m."createdAt") as date, AVG(m."response_time_ms") as avg
          FROM "Message" m
          JOIN "Conversation" c ON c."id" = m."conversationId"
          WHERE c."agentId" = ANY(${agentIds})
            AND m."role" = 'assistant'
            AND m."response_time_ms" IS NOT NULL
            AND m."createdAt" >= ${fromDate}
            AND m."createdAt" <= ${toDate}
          GROUP BY DATE(m."createdAt")
          ORDER BY date ASC
        `,
        prisma.$queryRaw<{ date: Date; input: bigint | null; output: bigint | null }[]>`
          SELECT DATE(m."createdAt") as date, SUM(m."input_tokens") as input, SUM(m."output_tokens") as output
          FROM "Message" m
          JOIN "Conversation" c ON c."id" = m."conversationId"
          WHERE c."agentId" = ANY(${agentIds})
            AND m."role" = 'assistant'
            AND m."createdAt" >= ${fromDate}
            AND m."createdAt" <= ${toDate}
          GROUP BY DATE(m."createdAt")
          ORDER BY date ASC
        `,
      ])

      const msgMap = new Map(msgByDate.map((r) => [r.date.toISOString().slice(0, 10), Number(r.count)]))
      const dailyTokenMap = new Map(dailyTokens.map((r) => [r.date.toISOString().slice(0, 10), { input: Number(r.input || 0), output: Number(r.output || 0) }]))

      const dailyMap = new Map<string, { date: string; totalConversations: number; totalMessages: number; uniqueUsers: number; avgResponseTime: number; inputTokens: number; outputTokens: number }>()
      for (const r of convByDate) {
        const key = r.createdAt.toISOString().slice(0, 10)
        if (!dailyMap.has(key)) {
          dailyMap.set(key, { date: key, totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0, inputTokens: 0, outputTokens: 0 })
        }
        dailyMap.get(key)!.totalConversations += r._count.id
      }
      for (const [date, count] of msgMap) {
        if (!dailyMap.has(date)) {
          dailyMap.set(date, { date, totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0, inputTokens: 0, outputTokens: 0 })
        }
        dailyMap.get(date)!.totalMessages += count
      }
      for (const r of rtByDate) {
        const key = r.date.toISOString().slice(0, 10)
        if (!dailyMap.has(key)) {
          dailyMap.set(key, { date: key, totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0, inputTokens: 0, outputTokens: 0 })
        }
        dailyMap.get(key)!.avgResponseTime = r.avg ? Math.round((r.avg / 1000) * 100) / 100 : 0
      }
      for (const [date, tokens] of dailyTokenMap) {
        if (!dailyMap.has(date)) {
          dailyMap.set(date, { date, totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0, inputTokens: 0, outputTokens: 0 })
        }
        dailyMap.get(date)!.inputTokens = tokens.input
        dailyMap.get(date)!.outputTokens = tokens.output
      }
      dailyBreakdownData = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))
    }

    const avgResponseTime = realAvgRT
    const prevAvgResponseTime = prevRealAvgRT

    const successRateResult = await prisma.$queryRaw<{ with_replies: bigint }[]>`
      SELECT COUNT(*)::int as with_replies
      FROM (
        SELECT DISTINCT m."conversationId"
        FROM "Message" m
        JOIN "Conversation" c ON c."id" = m."conversationId"
        WHERE c."agentId" = ANY(${agentIds})
          AND m."role" = 'assistant'
          AND m."createdAt" >= ${fromDate}
          AND m."createdAt" <= ${toDate}
      ) sub
    `
    const successRate = totals.totalConversations > 0
      ? Math.round((Number(successRateResult[0]?.with_replies || 0) / totals.totalConversations) * 100)
      : 0

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
        agentId: { in: agentIds },
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
        totalInputTokens: realtimeInputTokens,
        totalOutputTokens: realtimeOutputTokens,
        successRate,
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

    const [records, prevRecords] = await Promise.all([
      prisma.analytics.findMany({
        where: { agentId, date: { gte: fromDate, lte: toDate } },
        orderBy: { date: 'asc' },
        take: 365,
      }),
      prisma.analytics.findMany({
        where: { agentId, date: { gte: prevFromDate, lte: prevToDate } },
        take: 365,
      }),
    ])

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

    let totals = calcTotals(records)
    const prevTotals = calcTotals(prevRecords)

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

    let realtimeInputTokens = 0
    let realtimeOutputTokens = 0

    if (dailyBreakdown.length === 0 || totals.totalConversations === 0) {
      const [convByDate, msgByDate, responseTimeResult, tokenResult, dailyTokens, rtByDate] = await Promise.all([
        prisma.conversation.groupBy({
          by: ['createdAt'],
          where: { agentId, createdAt: { gte: fromDate, lte: toDate } },
          _count: { id: true },
        }),
        prisma.$queryRaw<{ date: Date; count: bigint }[]>`
          SELECT DATE(m."createdAt") as date, COUNT(*)::int as count
          FROM "Message" m
          JOIN "Conversation" c ON c."id" = m."conversationId"
          WHERE c."agentId" = ${agentId}
            AND m."createdAt" >= ${fromDate}
            AND m."createdAt" <= ${toDate}
          GROUP BY DATE(m."createdAt")
          ORDER BY date ASC
        `,
        prisma.$queryRaw<{ avg: number | null }[]>`
          SELECT AVG("response_time_ms") as avg
          FROM "Message" m
          JOIN "Conversation" c ON c."id" = m."conversationId"
          WHERE c."agentId" = ${agentId}
            AND m."role" = 'assistant'
            AND m."response_time_ms" IS NOT NULL
            AND m."createdAt" >= ${fromDate}
            AND m."createdAt" <= ${toDate}
        `,
        prisma.$queryRaw<{ input: bigint | null; output: bigint | null }[]>`
          SELECT SUM("input_tokens") as input, SUM("output_tokens") as output
          FROM "Message" m
          JOIN "Conversation" c ON c."id" = m."conversationId"
          WHERE c."agentId" = ${agentId}
            AND m."role" = 'assistant'
            AND m."createdAt" >= ${fromDate}
            AND m."createdAt" <= ${toDate}
        `,
        prisma.$queryRaw<{ date: Date; input: bigint | null; output: bigint | null }[]>`
          SELECT DATE(m."createdAt") as date, SUM(m."input_tokens") as input, SUM(m."output_tokens") as output
          FROM "Message" m
          JOIN "Conversation" c ON c."id" = m."conversationId"
          WHERE c."agentId" = ${agentId}
            AND m."role" = 'assistant'
            AND m."createdAt" >= ${fromDate}
            AND m."createdAt" <= ${toDate}
          GROUP BY DATE(m."createdAt")
          ORDER BY date ASC
        `,
        prisma.$queryRaw<{ date: Date; avg: number | null }[]>`
          SELECT DATE(m."createdAt") as date, AVG(m."response_time_ms") as avg
          FROM "Message" m
          JOIN "Conversation" c ON c."id" = m."conversationId"
          WHERE c."agentId" = ${agentId}
            AND m."role" = 'assistant'
            AND m."response_time_ms" IS NOT NULL
            AND m."createdAt" >= ${fromDate}
            AND m."createdAt" <= ${toDate}
          GROUP BY DATE(m."createdAt")
          ORDER BY date ASC
        `,
      ])

      const realAvgRT = responseTimeResult[0]?.avg
        ? Math.round((responseTimeResult[0].avg / 1000) * 100) / 100
        : 0
      realtimeInputTokens = tokenResult[0]?.input ? Number(tokenResult[0].input) : 0
      realtimeOutputTokens = tokenResult[0]?.output ? Number(tokenResult[0].output) : 0

      const msgMap = new Map(msgByDate.map((r) => [r.date.toISOString().slice(0, 10), Number(r.count)]))
      const dailyTokenMap = new Map(dailyTokens.map((r) => [r.date.toISOString().slice(0, 10), { input: Number(r.input || 0), output: Number(r.output || 0) }]))
      const dailyMap = new Map<string, { date: string; totalConversations: number; totalMessages: number; uniqueUsers: number; avgResponseTime: number; inputTokens: number; outputTokens: number }>()

      for (const r of convByDate) {
        const key = r.createdAt.toISOString().slice(0, 10)
        if (!dailyMap.has(key)) {
          dailyMap.set(key, { date: key, totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0, inputTokens: 0, outputTokens: 0 })
        }
        dailyMap.get(key)!.totalConversations += r._count.id
      }
      for (const [date, count] of msgMap) {
        if (!dailyMap.has(date)) {
          dailyMap.set(date, { date, totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0, inputTokens: 0, outputTokens: 0 })
        }
        dailyMap.get(date)!.totalMessages += count
      }
      for (const [date, tokens] of dailyTokenMap) {
        if (!dailyMap.has(date)) {
          dailyMap.set(date, { date, totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0, inputTokens: 0, outputTokens: 0 })
        }
        dailyMap.get(date)!.inputTokens = tokens.input
        dailyMap.get(date)!.outputTokens = tokens.output
      }
      for (const r of rtByDate) {
        const key = r.date.toISOString().slice(0, 10)
        if (!dailyMap.has(key)) {
          dailyMap.set(key, { date: key, totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0, inputTokens: 0, outputTokens: 0 })
        }
        dailyMap.get(key)!.avgResponseTime = r.avg ? Math.round((r.avg / 1000) * 100) / 100 : 0
      }
      dailyBreakdown = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))

      totals = dailyBreakdown.reduce(
        (acc, d) => ({
          ...acc,
          totalConversations: acc.totalConversations + d.totalConversations,
          totalMessages: acc.totalMessages + d.totalMessages,
          uniqueUsers: acc.uniqueUsers + d.uniqueUsers,
          avgResponseTime: realAvgRT,
        }),
        { totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0, satisfactionScores: [] as number[] },
      )
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

    const agentSuccessRateResult = await prisma.$queryRaw<{ with_replies: bigint }[]>`
      SELECT COUNT(*)::int as with_replies
      FROM (
        SELECT DISTINCT m."conversationId"
        FROM "Message" m
        JOIN "Conversation" c ON c."id" = m."conversationId"
        WHERE c."agentId" = ${agentId}
          AND m."role" = 'assistant'
          AND m."createdAt" >= ${fromDate}
          AND m."createdAt" <= ${toDate}
      ) sub
    `
    const agentSuccessRate = totals.totalConversations > 0
      ? Math.round((Number(agentSuccessRateResult[0]?.with_replies || 0) / totals.totalConversations) * 100)
      : 0

    const realAvgResponseTime = totals.avgResponseTime
    const prevRealAvgResponseTime = prevTotals.avgResponseTime

    return {
      data: {
        totalConversations: totals.totalConversations,
        totalMessages: totals.totalMessages,
        uniqueUsers: totals.uniqueUsers,
        avgResponseTime: realAvgResponseTime,
        successRate: agentSuccessRate,
        conversationsChange: pctChange(totals.totalConversations, prevTotals.totalConversations),
        messagesChange: pctChange(totals.totalMessages, prevTotals.totalMessages),
        usersChange: pctChange(totals.uniqueUsers, prevTotals.uniqueUsers),
        responseTimeChange: -pctChange(realAvgResponseTime, prevRealAvgResponseTime),
        satisfactionScore: totals.satisfactionScores.length > 0
          ? Math.round((totals.satisfactionScores.reduce((s, v) => s + v, 0) / totals.satisfactionScores.length) * 100) / 100
          : null,
        totalInputTokens: realtimeInputTokens,
        totalOutputTokens: realtimeOutputTokens,
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
      take: 365,
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

    const allAgents = await prisma.agent.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true },
    })
    const agentIds = allAgents.map((a) => a.id)

    const records = await prisma.analytics.groupBy({
      by: ['agentId'],
      where: {
        agentId: { in: agentIds },
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
      const agentMap = new Map(allAgents.map((b) => [b.id, b.name]))

      return {
        data: records.map((r) => ({
          agentId: r.agentId,
          agentName: agentMap.get(r.agentId) || 'Unknown',
          totalConversations: r._sum.totalConversations || 0,
          totalMessages: r._sum.totalMessages || 0,
          avgResponseTime: r._avg.avgResponseTime
            ? Math.round(r._avg.avgResponseTime * 100) / 100
            : 0,
          successRate: null,
          satisfactionScore: r._avg.satisfactionScore
            ? Math.round(r._avg.satisfactionScore * 100) / 100
            : null,
        })),
      }
    }

    const [convCounts, msgCounts, tokenCounts, rtCounts, srCounts] = await Promise.all([
      prisma.conversation.groupBy({
        by: ['agentId'],
        where: { agentId: { in: agentIds }, createdAt: { gte: fromDate, lte: toDate } },
        _count: { id: true },
      }),
      prisma.$queryRaw<{ agent_id: string; count: bigint }[]>`
        SELECT c."agentId" as agent_id, COUNT(*)::int as count
        FROM "Message" m
        JOIN "Conversation" c ON c."id" = m."conversationId"
        WHERE c."agentId" = ANY(${agentIds})
          AND m."createdAt" >= ${fromDate}
          AND m."createdAt" <= ${toDate}
        GROUP BY c."agentId"
      `,
      prisma.$queryRaw<{ agent_id: string; input: bigint | null; output: bigint | null }[]>`
        SELECT c."agentId" as agent_id, SUM(m."input_tokens") as input, SUM(m."output_tokens") as output
        FROM "Message" m
        JOIN "Conversation" c ON c."id" = m."conversationId"
        WHERE c."agentId" = ANY(${agentIds})
          AND m."role" = 'assistant'
          AND m."createdAt" >= ${fromDate}
          AND m."createdAt" <= ${toDate}
        GROUP BY c."agentId"
      `,
      prisma.$queryRaw<{ agent_id: string; avg: number | null }[]>`
        SELECT c."agentId" as agent_id, AVG(m."response_time_ms") as avg
        FROM "Message" m
        JOIN "Conversation" c ON c."id" = m."conversationId"
        WHERE c."agentId" = ANY(${agentIds})
          AND m."role" = 'assistant'
          AND m."response_time_ms" IS NOT NULL
          AND m."createdAt" >= ${fromDate}
          AND m."createdAt" <= ${toDate}
        GROUP BY c."agentId"
      `,
      prisma.$queryRaw<{ agent_id: string; with_replies: bigint }[]>`
        SELECT c."agentId" as agent_id, COUNT(DISTINCT m."conversationId")::int as with_replies
        FROM "Message" m
        JOIN "Conversation" c ON c."id" = m."conversationId"
        WHERE c."agentId" = ANY(${agentIds})
          AND m."role" = 'assistant'
          AND m."createdAt" >= ${fromDate}
          AND m."createdAt" <= ${toDate}
        GROUP BY c."agentId"
      `,
    ])

    const convMap = new Map(convCounts.map((c) => [c.agentId, c._count.id]))
    const msgMap = new Map(msgCounts.map((r) => [r.agent_id, Number(r.count)]))
    const tokenMap = new Map(tokenCounts.map((r) => [r.agent_id, { input: Number(r.input || 0), output: Number(r.output || 0) }]))
    const rtMap = new Map(rtCounts.map((r) => [r.agent_id, r.avg ? Math.round((r.avg / 1000) * 100) / 100 : 0]))
    const srMap = new Map(srCounts.map((r) => [r.agent_id, Number(r.with_replies)]))

    const liveAgentData = allAgents.map((agent) => {
      const tokens = tokenMap.get(agent.id) || { input: 0, output: 0 }
      const totalConversations = convMap.get(agent.id) || 0
      const withReplies = srMap.get(agent.id) || 0
      return {
        agentId: agent.id,
        agentName: agent.name,
        totalConversations,
        totalMessages: msgMap.get(agent.id) || 0,
        avgResponseTime: rtMap.get(agent.id) || 0,
        successRate: totalConversations > 0 ? Math.round((withReplies / totalConversations) * 100) : 0,
        satisfactionScore: null,
        totalInputTokens: tokens.input,
        totalOutputTokens: tokens.output,
      }
    })

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

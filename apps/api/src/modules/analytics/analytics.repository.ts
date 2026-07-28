import { prisma } from '@convio/database'

export function getDefaultDateRange(from?: string, to?: string) {
  const now = new Date()
  const toDate = to ? new Date(to + 'T23:59:59.999Z') : now
  const fromDate = from ? new Date(from) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  return { fromDate, toDate }
}

// ── Org-wide ──

export async function getOrgAgentIds(orgId: string) {
  const agents = await prisma.agent.findMany({
    where: { organizationId: orgId },
    select: { id: true },
  })
  return agents.map((a) => a.id)
}

export async function getAnalyticsSnapshots(
  agentIds: string[],
  fromDate: Date,
  toDate: Date,
) {
  return prisma.analytics.findMany({
    where: { agentId: { in: agentIds }, date: { gte: fromDate, lte: toDate } },
    orderBy: { date: 'asc' },
    take: 365,
  })
}

export async function getAvgResponseTime(
  agentIds: string[],
  fromDate: Date,
  toDate: Date,
) {
  const result = await prisma.$queryRaw<{ avg: number | null }[]>`
    SELECT AVG("response_time_ms") as avg
    FROM "Message" m
    JOIN "Conversation" c ON c."id" = m."conversationId"
    WHERE c."agentId" = ANY(${agentIds})
      AND m."role" = 'assistant'
      AND m."response_time_ms" IS NOT NULL
      AND m."createdAt" >= ${fromDate}
      AND m."createdAt" <= ${toDate}
  `
  return result[0]?.avg ?? 0
}

export async function getTokenTotals(
  agentIds: string[],
  fromDate: Date,
  toDate: Date,
) {
  const result = await prisma.$queryRaw<{ input: bigint | null; output: bigint | null }[]>`
    SELECT SUM("input_tokens") as input, SUM("output_tokens") as output
    FROM "Message" m
    JOIN "Conversation" c ON c."id" = m."conversationId"
    WHERE c."agentId" = ANY(${agentIds})
      AND m."role" = 'assistant'
      AND m."createdAt" >= ${fromDate}
      AND m."createdAt" <= ${toDate}
  `
  return {
    input: result[0]?.input ? Number(result[0].input) : 0,
    output: result[0]?.output ? Number(result[0].output) : 0,
  }
}

export async function getConversationCount(
  agentIds: string[],
  fromDate: Date,
  toDate: Date,
) {
  return prisma.conversation.count({
    where: { agentId: { in: agentIds }, createdAt: { gte: fromDate, lte: toDate } },
  })
}

export async function getMessageCount(
  agentIds: string[],
  fromDate: Date,
  toDate: Date,
) {
  return prisma.message.count({
    where: { conversation: { agentId: { in: agentIds } }, createdAt: { gte: fromDate, lte: toDate } },
  })
}

export async function getUniqueUserCount(
  agentIds: string[],
  fromDate: Date,
  toDate: Date,
) {
  const result = await prisma.conversation.groupBy({
    by: ['userId'],
    where: { agentId: { in: agentIds }, createdAt: { gte: fromDate, lte: toDate }, userId: { not: null } },
    _count: { id: true },
  })
  return result.length
}

export async function getDailyResponseTime(
  agentIds: string[],
  fromDate: Date,
  toDate: Date,
) {
  return prisma.$queryRaw<{ date: Date; avg: number | null }[]>`
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
  `
}

export async function getConversationsByDate(
  agentIds: string[],
  fromDate: Date,
  toDate: Date,
) {
  return prisma.conversation.groupBy({
    by: ['createdAt'],
    where: { agentId: { in: agentIds }, createdAt: { gte: fromDate, lte: toDate } },
    _count: { id: true },
    orderBy: { createdAt: 'asc' },
    take: 365,
  })
}

export async function getMessagesByDate(
  agentIds: string[],
  fromDate: Date,
  toDate: Date,
) {
  return prisma.$queryRaw<{ date: Date; count: bigint }[]>`
    SELECT DATE(m."createdAt") as date, COUNT(*)::int as count
    FROM "Message" m
    JOIN "Conversation" c ON c."id" = m."conversationId"
    WHERE c."agentId" = ANY(${agentIds})
      AND m."createdAt" >= ${fromDate}
      AND m."createdAt" <= ${toDate}
    GROUP BY DATE(m."createdAt")
    ORDER BY date ASC
  `
}

export async function getDailyTokens(
  agentIds: string[],
  fromDate: Date,
  toDate: Date,
) {
  return prisma.$queryRaw<{ date: Date; input: bigint | null; output: bigint | null }[]>`
    SELECT DATE(m."createdAt") as date, SUM(m."input_tokens") as input, SUM(m."output_tokens") as output
    FROM "Message" m
    JOIN "Conversation" c ON c."id" = m."conversationId"
    WHERE c."agentId" = ANY(${agentIds})
      AND m."role" = 'assistant'
      AND m."createdAt" >= ${fromDate}
      AND m."createdAt" <= ${toDate}
    GROUP BY DATE(m."createdAt")
    ORDER BY date ASC
  `
}

export async function getConversationSuccessRate(
  agentIds: string[],
  fromDate: Date,
  toDate: Date,
) {
  const result = await prisma.$queryRaw<{ with_replies: bigint }[]>`
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
  return Number(result[0]?.with_replies || 0)
}

export async function getChannelBreakdown(
  agentIds: string[],
  fromDate: Date,
  toDate: Date,
) {
  const result = await prisma.conversation.groupBy({
    by: ['channel'],
    where: {
      agentId: { in: agentIds },
      createdAt: { gte: fromDate, lte: toDate },
    },
    _count: { id: true },
  })
  return result.map((c) => ({ channel: c.channel, count: c._count.id }))
}

// ── Resolution & Cost ──

export async function getResolutionStats(
  agentIds: string[],
  fromDate: Date,
  toDate: Date,
) {
  const result = await prisma.conversation.groupBy({
    by: ['resolutionStatus'],
    where: {
      agentId: { in: agentIds },
      createdAt: { gte: fromDate, lte: toDate },
      resolutionStatus: { in: ['resolved', 'escalated', 'abandoned'] },
    },
    _count: { id: true },
  })
  const resolved = result.find((r) => r.resolutionStatus === 'resolved')
  const escalated = result.find((r) => r.resolutionStatus === 'escalated')
  return {
    resolvedCount: resolved?._count.id ?? 0,
    escalatedCount: escalated?._count.id ?? 0,
  }
}

export async function getReturningUsers(
  agentIds: string[],
  fromDate: Date,
  toDate: Date,
) {
  // users who had conversations before the current period
  const result = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(DISTINCT c."userId")::int as count
    FROM "Conversation" c
    WHERE c."agentId" = ANY(${agentIds})
      AND c."userId" IS NOT NULL
      AND c."createdAt" >= ${fromDate}
      AND c."createdAt" <= ${toDate}
      AND EXISTS (
        SELECT 1 FROM "Conversation" c2
        WHERE c2."userId" = c."userId"
          AND c2."agentId" = ANY(${agentIds})
          AND c2."createdAt" < ${fromDate}
      )
  `
  return Number(result[0]?.count || 0)
}

// ── Single agent ──

export async function getAgentDailyTokens(
  agentId: string,
  fromDate: Date,
  toDate: Date,
) {
  return prisma.$queryRaw<{ date: Date; input: bigint | null; output: bigint | null }[]>`
    SELECT DATE(m."createdAt") as date, SUM(m."input_tokens") as input, SUM(m."output_tokens") as output
    FROM "Message" m
    JOIN "Conversation" c ON c."id" = m."conversationId"
    WHERE c."agentId" = ${agentId}
      AND m."role" = 'assistant'
      AND m."createdAt" >= ${fromDate}
      AND m."createdAt" <= ${toDate}
    GROUP BY DATE(m."createdAt")
    ORDER BY date ASC
  `
}

export async function getAgentTokenTotals(
  agentId: string,
  fromDate: Date,
  toDate: Date,
) {
  const result = await prisma.$queryRaw<{ input: bigint | null; output: bigint | null }[]>`
    SELECT SUM("input_tokens") as input, SUM("output_tokens") as output
    FROM "Message" m
    JOIN "Conversation" c ON c."id" = m."conversationId"
    WHERE c."agentId" = ${agentId}
      AND m."role" = 'assistant'
      AND m."createdAt" >= ${fromDate}
      AND m."createdAt" <= ${toDate}
  `
  return {
    input: result[0]?.input ? Number(result[0].input) : 0,
    output: result[0]?.output ? Number(result[0].output) : 0,
  }
}

export async function getAgentAvgResponseTime(
  agentId: string,
  fromDate: Date,
  toDate: Date,
) {
  const result = await prisma.$queryRaw<{ avg: number | null }[]>`
    SELECT AVG("response_time_ms") as avg
    FROM "Message" m
    JOIN "Conversation" c ON c."id" = m."conversationId"
    WHERE c."agentId" = ${agentId}
      AND m."role" = 'assistant'
      AND m."response_time_ms" IS NOT NULL
      AND m."createdAt" >= ${fromDate}
      AND m."createdAt" <= ${toDate}
  `
  return result[0]?.avg ?? 0
}

export async function getAgentConversationsByDate(
  agentId: string,
  fromDate: Date,
  toDate: Date,
) {
  return prisma.conversation.groupBy({
    by: ['createdAt'],
    where: { agentId, createdAt: { gte: fromDate, lte: toDate } },
    _count: { id: true },
  })
}

export async function getAgentMessagesByDate(
  agentId: string,
  fromDate: Date,
  toDate: Date,
) {
  return prisma.$queryRaw<{ date: Date; count: bigint }[]>`
    SELECT DATE(m."createdAt") as date, COUNT(*)::int as count
    FROM "Message" m
    JOIN "Conversation" c ON c."id" = m."conversationId"
    WHERE c."agentId" = ${agentId}
      AND m."createdAt" >= ${fromDate}
      AND m."createdAt" <= ${toDate}
    GROUP BY DATE(m."createdAt")
    ORDER BY date ASC
  `
}

export async function getAgentSuccessRate(
  agentId: string,
  fromDate: Date,
  toDate: Date,
) {
  const result = await prisma.$queryRaw<{ with_replies: bigint }[]>`
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
  return Number(result[0]?.with_replies || 0)
}

// ── Top agents ──

export async function getTopAgentsRaw(orgId: string, fromDate: Date, toDate: Date, limit: number) {
  const allAgents = await prisma.agent.findMany({
    where: { organizationId: orgId },
    select: { id: true, name: true, avatar: true },
  })
  const agentIds = allAgents.map((a) => a.id)
  return { allAgents, agentIds }
}

export async function getTopAgentConversationCounts(agentIds: string[], fromDate: Date, toDate: Date) {
  return prisma.conversation.groupBy({
    by: ['agentId'],
    where: { agentId: { in: agentIds }, createdAt: { gte: fromDate, lte: toDate } },
    _count: { id: true },
  })
}

export async function getTopAgentMessageCounts(agentIds: string[], fromDate: Date, toDate: Date) {
  return prisma.$queryRaw<{ agent_id: string; count: bigint }[]>`
    SELECT c."agentId" as agent_id, COUNT(*)::int as count
    FROM "Message" m
    JOIN "Conversation" c ON c."id" = m."conversationId"
    WHERE c."agentId" = ANY(${agentIds})
      AND m."createdAt" >= ${fromDate}
      AND m."createdAt" <= ${toDate}
    GROUP BY c."agentId"
  `
}

export async function getTopAgentTokens(agentIds: string[], fromDate: Date, toDate: Date) {
  return prisma.$queryRaw<{ agent_id: string; input: bigint | null; output: bigint | null }[]>`
    SELECT c."agentId" as agent_id, SUM(m."input_tokens") as input, SUM(m."output_tokens") as output
    FROM "Message" m
    JOIN "Conversation" c ON c."id" = m."conversationId"
    WHERE c."agentId" = ANY(${agentIds})
      AND m."role" = 'assistant'
      AND m."createdAt" >= ${fromDate}
      AND m."createdAt" <= ${toDate}
    GROUP BY c."agentId"
  `
}

export async function getTopAgentResponseTimes(agentIds: string[], fromDate: Date, toDate: Date) {
  return prisma.$queryRaw<{ agent_id: string; avg: number | null }[]>`
    SELECT c."agentId" as agent_id, AVG(m."response_time_ms") as avg
    FROM "Message" m
    JOIN "Conversation" c ON c."id" = m."conversationId"
    WHERE c."agentId" = ANY(${agentIds})
      AND m."role" = 'assistant'
      AND m."response_time_ms" IS NOT NULL
      AND m."createdAt" >= ${fromDate}
      AND m."createdAt" <= ${toDate}
    GROUP BY c."agentId"
  `
}

export async function getTopAgentSuccessRates(agentIds: string[], fromDate: Date, toDate: Date) {
  return prisma.$queryRaw<{ agent_id: string; with_replies: bigint }[]>`
    SELECT c."agentId" as agent_id, COUNT(DISTINCT m."conversationId")::int as with_replies
    FROM "Message" m
    JOIN "Conversation" c ON c."id" = m."conversationId"
    WHERE c."agentId" = ANY(${agentIds})
      AND m."role" = 'assistant'
      AND m."createdAt" >= ${fromDate}
      AND m."createdAt" <= ${toDate}
    GROUP BY c."agentId"
  `
}

export async function getTopAgentResolutionStats(agentIds: string[], fromDate: Date, toDate: Date) {
  const result = await prisma.conversation.groupBy({
    by: ['agentId', 'resolutionStatus'],
    where: {
      agentId: { in: agentIds },
      createdAt: { gte: fromDate, lte: toDate },
      resolutionStatus: { in: ['resolved', 'escalated', 'abandoned'] },
    },
    _count: { id: true },
  })
  return result
}

export async function getTopAgentRatings(agentIds: string[], fromDate: Date, toDate: Date) {
  return prisma.conversation.groupBy({
    by: ['agentId'],
    where: {
      agentId: { in: agentIds },
      createdAt: { gte: fromDate, lte: toDate },
      rating: { not: null },
    },
    _avg: { rating: true },
    _count: { rating: true },
  })
}

export async function getGroupedAnalytics(
  agentIds: string[],
  fromDate: Date,
  toDate: Date,
  limit: number,
) {
  return prisma.analytics.groupBy({
    by: ['agentId'],
    where: {
      agentId: { in: agentIds },
      date: { gte: fromDate, lte: toDate },
    },
    _sum: {
      totalConversations: true,
      totalMessages: true,
      resolvedConversations: true,
      escalatedConversations: true,
      totalCost: true,
      totalInputTokens: true,
      totalOutputTokens: true,
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
}

// ── Cost ──

export async function getTotalCost(agentIds: string[], fromDate: Date, toDate: Date) {
  const result = await prisma.$queryRaw<{ total: number | null }[]>`
    SELECT SUM(m."cost") as total
    FROM "Message" m
    JOIN "Conversation" c ON c."id" = m."conversationId"
    WHERE c."agentId" = ANY(${agentIds})
      AND m."cost" IS NOT NULL
      AND m."createdAt" >= ${fromDate}
      AND m."createdAt" <= ${toDate}
  `
  return result[0]?.total ? Number(result[0].total) : 0
}

export async function getAgentTotalCost(agentId: string, fromDate: Date, toDate: Date) {
  const result = await prisma.$queryRaw<{ total: number | null }[]>`
    SELECT SUM(m."cost") as total
    FROM "Message" m
    JOIN "Conversation" c ON c."id" = m."conversationId"
    WHERE c."agentId" = ${agentId}
      AND m."cost" IS NOT NULL
      AND m."createdAt" >= ${fromDate}
      AND m."createdAt" <= ${toDate}
  `
  return result[0]?.total ? Number(result[0].total) : 0
}

export async function getTopAgentCosts(agentIds: string[], fromDate: Date, toDate: Date) {
  return prisma.$queryRaw<{ agent_id: string; total: number }[]>`
    SELECT c."agentId" as agent_id, SUM(m."cost") as total
    FROM "Message" m
    JOIN "Conversation" c ON c."id" = m."conversationId"
    WHERE c."agentId" = ANY(${agentIds})
      AND m."cost" IS NOT NULL
      AND m."createdAt" >= ${fromDate}
      AND m."createdAt" <= ${toDate}
    GROUP BY c."agentId"
  `
}

// ── Snapshot ──

export async function findAnalyticsSnapshot(agentId: string, date: Date) {
  return prisma.analytics.findUnique({
    where: { agentId_date: { agentId, date } },
  })
}

export async function createAnalyticsSnapshot(data: {
  agentId: string
  date: Date
  totalConversations: number
  totalMessages: number
  uniqueUsers: number
  avgResponseTime: number
  satisfactionScore?: number
  resolvedConversations?: number
  escalatedConversations?: number
  totalCost?: number
  totalInputTokens?: number
  totalOutputTokens?: number
  returningUsers?: number
}) {
  return prisma.analytics.create({ data })
}

export async function updateAnalyticsSnapshot(
  agentId: string,
  date: Date,
  data: {
    totalConversations: number
    totalMessages: number
    uniqueUsers: number
    avgResponseTime: number
    satisfactionScore?: number | null
    resolvedConversations?: number
    escalatedConversations?: number
    totalCost?: number
    totalInputTokens?: number
    totalOutputTokens?: number
    returningUsers?: number
  },
) {
  return prisma.analytics.update({
    where: { agentId_date: { agentId, date } },
    data,
  })
}

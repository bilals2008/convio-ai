import * as repo from './analytics.repository.js'
import type {
  OrgAnalyticsResponse,
  AgentAnalyticsResponse,
  TopAgentEntry,
  DailyBreakdownEntry,
  AnalyticsSnapshotInput,
} from './analytics.types.js'

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 1000) / 10
}

function roundSeconds(ms: number) {
  return Math.round((ms / 1000) * 100) / 100
}

function buildDailyMap(agentIds: string[], fromDate: Date, toDate: Date) {
  return new Map<string, {
    date: string
    totalConversations: number
    totalMessages: number
    uniqueUsers: number
    avgResponseTime: number
    inputTokens: number
    outputTokens: number
  }>()
}

async function buildDaily(
  agentIds: string[],
  fromDate: Date,
  toDate: Date,
) {
  const [convByDate, msgByDate, rtByDate, dailyTokens] = await Promise.all([
    repo.getConversationsByDate(agentIds, fromDate, toDate),
    repo.getMessagesByDate(agentIds, fromDate, toDate),
    repo.getDailyResponseTime(agentIds, fromDate, toDate),
    repo.getDailyTokens(agentIds, fromDate, toDate),
  ])

  const dailyMap = buildDailyMap(agentIds, fromDate, toDate)

  for (const r of convByDate) {
    const key = r.date.toISOString().slice(0, 10)
    if (!dailyMap.has(key)) dailyMap.set(key, { date: key, totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0, inputTokens: 0, outputTokens: 0 })
    dailyMap.get(key)!.totalConversations += r.count
  }

  const msgMap = new Map(msgByDate.map((r) => [r.date.toISOString().slice(0, 10), Number(r.count)]))
  for (const [date, count] of msgMap) {
    if (!dailyMap.has(date)) dailyMap.set(date, { date, totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0, inputTokens: 0, outputTokens: 0 })
    dailyMap.get(date)!.totalMessages += count
  }

  const dailyTokenMap = new Map(dailyTokens.map((r) => [r.date.toISOString().slice(0, 10), { input: Number(r.input || 0), output: Number(r.output || 0) }]))
  for (const [date, tokens] of dailyTokenMap) {
    if (!dailyMap.has(date)) dailyMap.set(date, { date, totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0, inputTokens: 0, outputTokens: 0 })
    dailyMap.get(date)!.inputTokens = tokens.input
    dailyMap.get(date)!.outputTokens = tokens.output
  }

  for (const r of rtByDate) {
    const key = r.date.toISOString().slice(0, 10)
    if (!dailyMap.has(key)) dailyMap.set(key, { date: key, totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0, inputTokens: 0, outputTokens: 0 })
    dailyMap.get(key)!.avgResponseTime = r.avg ? roundSeconds(r.avg) : 0
  }

  return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))
}

export async function getOrgAnalyticsRaw(
  orgId: string,
  from?: string,
  to?: string,
): Promise<OrgAnalyticsResponse> {
  const { fromDate, toDate } = repo.getDefaultDateRange(from, to)
  const agentIds = await repo.getOrgAgentIds(orgId)
  const rangeMs = toDate.getTime() - fromDate.getTime()
  const prevFromDate = new Date(fromDate.getTime() - rangeMs)
  const prevToDate = new Date(fromDate.getTime() - 1)

  const [snapshots, prevSnapshots, responseTimeMs, prevResponseTimeMs, tokens, dailyRt, totalCostVal] = await Promise.all([
    repo.getAnalyticsSnapshots(agentIds, fromDate, toDate),
    repo.getAnalyticsSnapshots(agentIds, prevFromDate, prevToDate),
    repo.getAvgResponseTime(agentIds, fromDate, toDate),
    repo.getAvgResponseTime(agentIds, prevFromDate, prevToDate),
    repo.getTokenTotals(agentIds, fromDate, toDate),
    repo.getDailyResponseTime(agentIds, fromDate, toDate),
    repo.getTotalCost(agentIds, fromDate, toDate),
  ])

  const realAvgRT = roundSeconds(responseTimeMs)
  const prevAvgRT = roundSeconds(prevResponseTimeMs)

  const calcTotals = (records: typeof snapshots) =>
    records.reduce(
      (acc, r) => ({
        totalConversations: acc.totalConversations + r.totalConversations,
        totalMessages: acc.totalMessages + r.totalMessages,
        uniqueUsers: acc.uniqueUsers + r.uniqueUsers,
        avgResponseTime: records.length > 0 ? acc.avgResponseTime + r.avgResponseTime : 0,
        resolvedConversations: acc.resolvedConversations + r.resolvedConversations,
        escalatedConversations: acc.escalatedConversations + r.escalatedConversations,
        totalCost: acc.totalCost + r.totalCost,
        totalInputTokens: acc.totalInputTokens + r.totalInputTokens,
        totalOutputTokens: acc.totalOutputTokens + r.totalOutputTokens,
        returningUsers: acc.returningUsers + r.returningUsers,
      }),
      { totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0, resolvedConversations: 0, escalatedConversations: 0, totalCost: 0, totalInputTokens: 0, totalOutputTokens: 0, returningUsers: 0 },
    )

  let totals = calcTotals(snapshots)
  let prevTotals = calcTotals(prevSnapshots)

  let dailyBreakdown: OrgAnalyticsResponse['dailyBreakdown'] = []

  if (snapshots.length === 0 || totals.totalConversations === 0) {
    const [realtimeConversations, realtimeMessages, realtimeUsers, prevConversations, prevMessages] = await Promise.all([
      repo.getConversationCount(agentIds, fromDate, toDate),
      repo.getMessageCount(agentIds, fromDate, toDate),
      repo.getUniqueUserCount(agentIds, fromDate, toDate),
      repo.getConversationCount(agentIds, prevFromDate, prevToDate),
      repo.getMessageCount(agentIds, prevFromDate, prevToDate),
    ])

    totals = {
      totalConversations: realtimeConversations,
      totalMessages: realtimeMessages,
      uniqueUsers: realtimeUsers,
      avgResponseTime: realAvgRT,
      resolvedConversations: 0,
      escalatedConversations: 0,
      totalCost: 0,
      totalInputTokens: tokens.input,
      totalOutputTokens: tokens.output,
      returningUsers: 0,
    }
    prevTotals = {
      totalConversations: prevConversations,
      totalMessages: prevMessages,
      uniqueUsers: 0,
      avgResponseTime: prevAvgRT,
      resolvedConversations: 0,
      escalatedConversations: 0,
      totalCost: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      returningUsers: 0,
    }

    dailyBreakdown = await buildDaily(agentIds, fromDate, toDate)
  }

  // response time override from raw data
  const dailyRtMap = new Map(dailyRt.map((r) => [r.date.toISOString().slice(0, 10), r.avg ? roundSeconds(r.avg) : 0]))

  if (dailyBreakdown.length === 0) {
    const dailyCounts = new Map<string, number>()
    const fromSnapshots = snapshots.reduce<Record<string, {
      date: string
      totalConversations: number
      totalMessages: number
      uniqueUsers: number
      avgResponseTime: number
      resolvedConversations: number
      escalatedConversations: number
      totalCost: number
      totalInputTokens: number
      totalOutputTokens: number
      returningUsers: number
    }>>((acc, r) => {
      const key = r.date.toISOString().slice(0, 10)
      if (!acc[key]) {
        acc[key] = {
          date: key,
          totalConversations: 0,
          totalMessages: 0,
          uniqueUsers: 0,
          avgResponseTime: 0,
          resolvedConversations: r.resolvedConversations,
          escalatedConversations: r.escalatedConversations,
          totalCost: r.totalCost,
          totalInputTokens: r.totalInputTokens,
          totalOutputTokens: r.totalOutputTokens,
          returningUsers: r.returningUsers,
        }
        dailyCounts.set(key, 0)
      }
      acc[key].totalConversations += r.totalConversations
      acc[key].totalMessages += r.totalMessages
      acc[key].uniqueUsers += r.uniqueUsers
      acc[key].avgResponseTime += r.avgResponseTime
      acc[key].resolvedConversations += r.resolvedConversations
      acc[key].escalatedConversations += r.escalatedConversations
      acc[key].totalCost += r.totalCost
      acc[key].totalInputTokens += r.totalInputTokens
      acc[key].totalOutputTokens += r.totalOutputTokens
      acc[key].returningUsers += r.returningUsers
      dailyCounts.set(key, dailyCounts.get(key)! + 1)
      return acc
    }, {})

    dailyBreakdown = Object.values(fromSnapshots).map((d) => ({
      date: d.date,
      totalConversations: d.totalConversations,
      totalMessages: d.totalMessages,
      uniqueUsers: d.uniqueUsers,
      avgResponseTime: Math.round((d.avgResponseTime / (dailyCounts.get(d.date) || 1)) * 100) / 100,
      inputTokens: d.totalInputTokens,
      outputTokens: d.totalOutputTokens,
    }))
  }

  for (const d of dailyBreakdown) {
    const rt = dailyRtMap.get(d.date)
    if (rt != null) d.avgResponseTime = rt
  }

  const successRateCount = await repo.getConversationSuccessRate(agentIds, fromDate, toDate)
  const successRate = totals.totalConversations > 0
    ? Math.round((successRateCount / totals.totalConversations) * 100)
    : 0

  const { resolvedCount, escalatedCount } = await repo.getResolutionStats(agentIds, fromDate, toDate)
  const resolutionTotal = resolvedCount + escalatedCount
  const resolutionRate = resolutionTotal > 0
    ? Math.round((resolvedCount / resolutionTotal) * 100)
    : 0

  const returningUsers = await repo.getReturningUsers(agentIds, fromDate, toDate)
  const channelBreakdown = await repo.getChannelBreakdown(agentIds, fromDate, toDate)

  // ponytail: simple model cost mapping, add per-provider pricing if accuracy matters
  const totalCost = (tokens.input * 0.000003) + (tokens.output * 0.000015)

  return {
    totalConversations: totals.totalConversations,
    totalMessages: totals.totalMessages,
    uniqueUsers: totals.uniqueUsers,
    avgResponseTime: realAvgRT,
    totalInputTokens: tokens.input,
    totalOutputTokens: tokens.output,
    successRate,
    conversationsChange: pctChange(totals.totalConversations, prevTotals.totalConversations),
    messagesChange: pctChange(totals.totalMessages, prevTotals.totalMessages),
    usersChange: pctChange(totals.uniqueUsers, prevTotals.uniqueUsers),
    responseTimeChange: prevAvgRT > 0 ? -pctChange(realAvgRT, prevAvgRT) : 0,
    channelBreakdown,
    dailyBreakdown,
    resolutionRate,
    totalCost: Math.round(totalCostVal * 100) / 100,
    returningUsers,
    avgSatisfactionScore: null,
  }
}

export async function getAgentAnalyticsRaw(
  agentId: string,
  from?: string,
  to?: string,
): Promise<AgentAnalyticsResponse> {
  const { fromDate, toDate } = repo.getDefaultDateRange(from, to)
  const rangeMs = toDate.getTime() - fromDate.getTime()
  const prevFromDate = new Date(fromDate.getTime() - rangeMs)
  const prevToDate = new Date(fromDate.getTime() - 1)

  const defaultTotals = (records: Awaited<ReturnType<typeof repo.getAnalyticsSnapshots>>) => {
    const sum = records.reduce(
      (acc, r) => ({
        totalConversations: acc.totalConversations + r.totalConversations,
        totalMessages: acc.totalMessages + r.totalMessages,
        uniqueUsers: acc.uniqueUsers + r.uniqueUsers,
        avgResponseTimeSum: acc.avgResponseTimeSum + r.avgResponseTime,
        satisfactionScores: r.satisfactionScore != null ? [...acc.satisfactionScores, r.satisfactionScore] : acc.satisfactionScores,
        resolvedConversations: acc.resolvedConversations + r.resolvedConversations,
        escalatedConversations: acc.escalatedConversations + r.escalatedConversations,
        totalCost: acc.totalCost + r.totalCost,
        totalInputTokens: acc.totalInputTokens + r.totalInputTokens,
        totalOutputTokens: acc.totalOutputTokens + r.totalOutputTokens,
        returningUsers: acc.returningUsers + r.returningUsers,
      }),
      {
        totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTimeSum: 0,
        satisfactionScores: [] as number[],
        resolvedConversations: 0, escalatedConversations: 0, totalCost: 0,
        totalInputTokens: 0, totalOutputTokens: 0, returningUsers: 0,
      },
    )
    return {
      totalConversations: sum.totalConversations,
      totalMessages: sum.totalMessages,
      uniqueUsers: sum.uniqueUsers,
      avgResponseTime: records.length > 0 ? Math.round((sum.avgResponseTimeSum / records.length) * 100) / 100 : 0,
      satisfactionScores: sum.satisfactionScores,
      resolvedConversations: sum.resolvedConversations,
      escalatedConversations: sum.escalatedConversations,
      totalCost: sum.totalCost,
      totalInputTokens: sum.totalInputTokens,
      totalOutputTokens: sum.totalOutputTokens,
      returningUsers: sum.returningUsers,
    }
  }

  const [records, prevRecords, tokens, dailyTokens, agentCost] = await Promise.all([
    repo.getAnalyticsSnapshots([agentId], fromDate, toDate),
    repo.getAnalyticsSnapshots([agentId], prevFromDate, prevToDate),
    repo.getAgentTokenTotals(agentId, fromDate, toDate),
    repo.getAgentDailyTokens(agentId, fromDate, toDate),
    repo.getAgentTotalCost(agentId, fromDate, toDate),
  ])

  const dailyTokenMap = new Map(dailyTokens.map((r) => [r.date.toISOString().slice(0, 10), { input: Number(r.input || 0), output: Number(r.output || 0) }]))

  let totals = defaultTotals(records)
  const prevTotals = defaultTotals(prevRecords)

  let dailyBreakdown = records.map((r) => ({
    date: r.date.toISOString().slice(0, 10),
    totalConversations: r.totalConversations,
    totalMessages: r.totalMessages,
    uniqueUsers: r.uniqueUsers,
    avgResponseTime: r.avgResponseTime,
    inputTokens: dailyTokenMap.get(r.date.toISOString().slice(0, 10))?.input ?? 0,
    outputTokens: dailyTokenMap.get(r.date.toISOString().slice(0, 10))?.output ?? 0,
  }))

  if (dailyBreakdown.length === 0 || totals.totalConversations === 0) {
    const [convByDate, msgByDate, responseTimeMs, rtByDate, uniqueUsersResult] = await Promise.all([
      repo.getAgentConversationsByDate(agentId, fromDate, toDate),
      repo.getAgentMessagesByDate(agentId, fromDate, toDate),
      repo.getAgentAvgResponseTime(agentId, fromDate, toDate),
      repo.getDailyResponseTime([agentId], fromDate, toDate),
      repo.getUniqueUserCount([agentId], fromDate, toDate),
    ])

    const realAvgRT = roundSeconds(responseTimeMs)

    const dailyMap = buildDailyMap([agentId], fromDate, toDate)
    for (const r of convByDate) {
      const key = r.date.toISOString().slice(0, 10)
      if (!dailyMap.has(key)) dailyMap.set(key, { date: key, totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0, inputTokens: 0, outputTokens: 0 })
      dailyMap.get(key)!.totalConversations += r.count
    }

    const msgMap = new Map(msgByDate.map((r) => [r.date.toISOString().slice(0, 10), Number(r.count)]))
    for (const [date, count] of msgMap) {
      if (!dailyMap.has(date)) dailyMap.set(date, { date, totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0, inputTokens: 0, outputTokens: 0 })
      dailyMap.get(date)!.totalMessages += count
    }

    for (const [date, t] of dailyTokenMap) {
      if (!dailyMap.has(date)) dailyMap.set(date, { date, totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0, inputTokens: 0, outputTokens: 0 })
      dailyMap.get(date)!.inputTokens = t.input
      dailyMap.get(date)!.outputTokens = t.output
    }

    for (const r of rtByDate) {
      const key = r.date.toISOString().slice(0, 10)
      if (!dailyMap.has(key)) dailyMap.set(key, { date: key, totalConversations: 0, totalMessages: 0, uniqueUsers: 0, avgResponseTime: 0, inputTokens: 0, outputTokens: 0 })
      dailyMap.get(key)!.avgResponseTime = r.avg ? roundSeconds(r.avg) : 0
    }

    dailyBreakdown = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))
    totals = {
      totalConversations: dailyBreakdown.reduce((a, d) => a + d.totalConversations, 0),
      totalMessages: dailyBreakdown.reduce((a, d) => a + d.totalMessages, 0),
      uniqueUsers: uniqueUsersResult,
      avgResponseTime: realAvgRT,
      satisfactionScores: [],
      resolvedConversations: 0,
      escalatedConversations: 0,
      totalCost: 0,
      totalInputTokens: tokens.input,
      totalOutputTokens: tokens.output,
      returningUsers: 0,
    }
  }

  const agentSuccessRateCount = await repo.getAgentSuccessRate(agentId, fromDate, toDate)
  const agentSuccessRate = totals.totalConversations > 0
    ? Math.round((agentSuccessRateCount / totals.totalConversations) * 100)
    : 0

  const { resolvedCount, escalatedCount } = await repo.getResolutionStats([agentId], fromDate, toDate)
  const resolutionTotal = resolvedCount + escalatedCount
  const resolutionRate = resolutionTotal > 0
    ? Math.round((resolvedCount / resolutionTotal) * 100)
    : 0

  const realAvgResponseTime = totals.avgResponseTime
  const prevRealAvgResponseTime = prevTotals.avgResponseTime

  const channelBreakdown = await repo.getChannelBreakdown([agentId], fromDate, toDate)
  const returningUsers = await repo.getReturningUsers([agentId], fromDate, toDate)

  const totalCost = Math.round(agentCost * 100) / 100

  return {
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
    totalInputTokens: tokens.input,
    totalOutputTokens: tokens.output,
    channelBreakdown,
    dailyBreakdown,
    resolutionRate,
    totalCost,
    returningUsers,
  }
}

export async function getAgentDailyBreakdown(
  agentId: string,
  from?: string,
  to?: string,
): Promise<DailyBreakdownEntry[]> {
  const { fromDate, toDate } = repo.getDefaultDateRange(from, to)

  const records = await repo.getAnalyticsSnapshots([agentId], fromDate, toDate)

  return records.map((r) => ({
    date: r.date.toISOString().slice(0, 10),
    totalConversations: r.totalConversations,
    totalMessages: r.totalMessages,
    uniqueUsers: r.uniqueUsers,
    avgResponseTime: r.avgResponseTime,
  }))
}

export async function getTopAgentsRaw(
  orgId: string,
  from?: string,
  to?: string,
  limit: number = 10,
): Promise<TopAgentEntry[]> {
  const { fromDate, toDate } = repo.getDefaultDateRange(from, to)
  const { allAgents, agentIds } = await repo.getTopAgentsRaw(orgId, fromDate, toDate, limit)

  const records = await repo.getGroupedAnalytics(agentIds, fromDate, toDate, limit)

  if (records.length > 0) {
    const agentMap = new Map(allAgents.map((b) => [b.id, b.name]))
    const avatarMap = new Map(allAgents.map((b) => [b.id, b.avatar]))

    return records.map((r) => {
      const resolved = r._sum.resolvedConversations || 0
      const escalated = r._sum.escalatedConversations || 0
      const resolutionTotal = resolved + escalated
      return {
        agentId: r.agentId,
        agentName: agentMap.get(r.agentId) || 'Unknown',
        agentAvatar: avatarMap.get(r.agentId) || null,
        totalConversations: r._sum.totalConversations || 0,
        totalMessages: r._sum.totalMessages || 0,
        avgResponseTime: r._avg.avgResponseTime ? Math.round(r._avg.avgResponseTime * 100) / 100 : 0,
        successRate: 0,
        satisfactionScore: r._avg.satisfactionScore ? Math.round(r._avg.satisfactionScore * 100) / 100 : null,
        totalInputTokens: r._sum.totalInputTokens || 0,
        totalOutputTokens: r._sum.totalOutputTokens || 0,
        resolutionRate: resolutionTotal > 0 ? Math.round((resolved / resolutionTotal) * 100) : 0,
        totalCost: r._sum.totalCost || 0,
      }
    })
  }

  const [convCounts, msgCounts, tokenCounts, rtCounts, srCounts, resolutionStats, ratings, agentCosts] = await Promise.all([
    repo.getTopAgentConversationCounts(agentIds, fromDate, toDate),
    repo.getTopAgentMessageCounts(agentIds, fromDate, toDate),
    repo.getTopAgentTokens(agentIds, fromDate, toDate),
    repo.getTopAgentResponseTimes(agentIds, fromDate, toDate),
    repo.getTopAgentSuccessRates(agentIds, fromDate, toDate),
    repo.getTopAgentResolutionStats(agentIds, fromDate, toDate),
    repo.getTopAgentRatings(agentIds, fromDate, toDate),
    repo.getTopAgentCosts(agentIds, fromDate, toDate),
  ])

  const convMap = new Map(convCounts.map((c) => [c.agentId, c._count.id]))
  const msgMap = new Map(msgCounts.map((r) => [r.agent_id, Number(r.count)]))
  const tokenMap = new Map(tokenCounts.map((r) => [r.agent_id, { input: Number(r.input || 0), output: Number(r.output || 0) }]))
  const rtMap = new Map(rtCounts.map((r) => [r.agent_id, r.avg ? roundSeconds(r.avg) : 0]))
  const srMap = new Map(srCounts.map((r) => [r.agent_id, Number(r.with_replies)]))
  const ratingMap = new Map(ratings.map((r) => [r.agentId, r._avg.rating ? Math.round(r._avg.rating * 100) / 100 : null]))
  const costMap = new Map(agentCosts.map((r) => [r.agent_id, r.total]))

  const resMap = new Map<string, { resolved: number; escalated: number }>()
  for (const r of resolutionStats) {
    const prev = resMap.get(r.agentId) || { resolved: 0, escalated: 0 }
    if (r.resolutionStatus === 'resolved') prev.resolved += r._count.id
    if (r.resolutionStatus === 'escalated') prev.escalated += r._count.id
    resMap.set(r.agentId, prev)
  }

  const liveData = allAgents.map((agent) => {
    const tokens = tokenMap.get(agent.id) || { input: 0, output: 0 }
    const totalConversations = convMap.get(agent.id) || 0
    const withReplies = srMap.get(agent.id) || 0
    const res = resMap.get(agent.id) || { resolved: 0, escalated: 0 }
    const resolutionTotal = res.resolved + res.escalated
    return {
      agentId: agent.id,
      agentName: agent.name,
      agentAvatar: agent.avatar,
      totalConversations,
      totalMessages: msgMap.get(agent.id) || 0,
      avgResponseTime: rtMap.get(agent.id) || 0,
      successRate: totalConversations > 0 ? Math.round((withReplies / totalConversations) * 100) : 0,
      satisfactionScore: ratingMap.get(agent.id) ?? null,
      totalInputTokens: tokens.input,
      totalOutputTokens: tokens.output,
      resolutionRate: resolutionTotal > 0 ? Math.round((res.resolved / resolutionTotal) * 100) : 0,
      totalCost: costMap.get(agent.id) ?? Math.round(((tokens.input * 0.000003) + (tokens.output * 0.000015)) * 100) / 100,
    }
  })

  liveData.sort((a, b) => b.totalConversations - a.totalConversations)
  return liveData.slice(0, limit)
}

/**
 * Daily cron: aggregate the previous day (or `target`) into per-agent
 * Analytics snapshots so dashboards read the cheap snapshot table and
 * plan limits are enforced from snapshots. Idempotent per day — the
 * snapshot is replaced with absolute values, never added to.
 */
export async function processDailySnapshots(target?: Date) {
  const date = target ?? new Date(Date.now() - 24 * 60 * 60 * 1000)
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)

  const { convs, msgs, users, resolution } = await repo.getDailySnapshotAggregates(start, end)

  const convMap = new Map(convs.map((c) => [c.agent_id, c.count]))
  const userMap = new Map(users.map((u) => [u.agent_id, u.count]))
  const msgMap = new Map(msgs.map((m) => [m.agent_id, m]))
  const resMap = new Map<string, { resolved: number; escalated: number }>()
  for (const r of resolution) {
    const entry = resMap.get(r.agent_id) ?? { resolved: 0, escalated: 0 }
    if (r.status === 'resolved') entry.resolved += r.count
    else entry.escalated += r.count
    resMap.set(r.agent_id, entry)
  }

  const agentIds = new Set([...convMap.keys(), ...msgMap.keys()])
  let processed = 0
  for (const agentId of agentIds) {
    const msg = msgMap.get(agentId)
    const res = resMap.get(agentId) ?? { resolved: 0, escalated: 0 }
    await repo.replaceAnalyticsSnapshot(agentId, start, {
      totalConversations: convMap.get(agentId) ?? 0,
      totalMessages: msg?.count ?? 0,
      uniqueUsers: userMap.get(agentId) ?? 0,
      avgResponseTime: msg?.avg_rt ? Math.round((msg.avg_rt / 1000) * 100) / 100 : 0,
      resolvedConversations: res.resolved,
      escalatedConversations: res.escalated,
      totalCost: msg?.cost ?? 0,
      totalInputTokens: Number(msg?.input ?? 0),
      totalOutputTokens: Number(msg?.output ?? 0),
      returningUsers: 0,
    })
    processed++
  }

  return { processed, date: start.toISOString().slice(0, 10) }
}

export async function upsertSnapshot(
  agentId: string,
  input: AnalyticsSnapshotInput,
) {
  const targetDate = new Date(input.date)
  const existing = await repo.findAnalyticsSnapshot(agentId, targetDate)

  if (existing) {
    return repo.updateAnalyticsSnapshot(agentId, targetDate, {
      totalConversations: existing.totalConversations + input.totalConversations,
      totalMessages: existing.totalMessages + input.totalMessages,
      uniqueUsers: existing.uniqueUsers + input.uniqueUsers,
      avgResponseTime: existing.avgResponseTime > 0
        ? Math.round(((existing.avgResponseTime + input.avgResponseTime) / 2) * 100) / 100
        : input.avgResponseTime,
      satisfactionScore: input.satisfactionScore ?? existing.satisfactionScore,
      resolvedConversations: existing.resolvedConversations + (input.resolvedConversations ?? 0),
      escalatedConversations: existing.escalatedConversations + (input.escalatedConversations ?? 0),
      totalCost: existing.totalCost + (input.totalCost ?? 0),
      totalInputTokens: existing.totalInputTokens + (input.totalInputTokens ?? 0),
      totalOutputTokens: existing.totalOutputTokens + (input.totalOutputTokens ?? 0),
      returningUsers: existing.returningUsers + (input.returningUsers ?? 0),
    })
  }

  return repo.createAnalyticsSnapshot({
    agentId,
    date: targetDate,
    totalConversations: input.totalConversations,
    totalMessages: input.totalMessages,
    uniqueUsers: input.uniqueUsers,
    avgResponseTime: input.avgResponseTime,
    satisfactionScore: input.satisfactionScore,
    resolvedConversations: input.resolvedConversations,
    escalatedConversations: input.escalatedConversations,
    totalCost: input.totalCost,
    totalInputTokens: input.totalInputTokens,
    totalOutputTokens: input.totalOutputTokens,
    returningUsers: input.returningUsers,
  })
}

// Dashboard aggregates are heavy (8-16 grouped queries); cache per
// org/agent + range for 30s so a page load doesn't re-run them.
import { createTtlCache, cached as cachedRun } from '../../services/cache.js'
const aggregateCache = createTtlCache<Promise<OrgAnalyticsResponse | AgentAnalyticsResponse | TopAgentEntry[]>>(30_000)

export function getOrgAnalytics(orgId: string, from?: string, to?: string) {
  return cachedRun(
    aggregateCache,
    `org:${orgId}:${from ?? ''}:${to ?? ''}`,
    () => getOrgAnalyticsRaw(orgId, from, to),
  )
}

export function getAgentAnalytics(agentId: string, from?: string, to?: string) {
  return cachedRun(
    aggregateCache,
    `agent:${agentId}:${from ?? ''}:${to ?? ''}`,
    () => getAgentAnalyticsRaw(agentId, from, to),
  )
}

export function getTopAgents(orgId: string, from?: string, to?: string, limit: number = 10) {
  return cachedRun(
    aggregateCache,
    `top:${orgId}:${from ?? ''}:${to ?? ''}:${limit}`,
    () => getTopAgentsRaw(orgId, from, to, limit),
  )
}

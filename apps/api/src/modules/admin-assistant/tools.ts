import { prisma } from '@convio/database'
import { getPlanDef } from '../../services/plans.js'

export interface AdminTool {
  name: string
  description: string
  parameters: Record<string, unknown>
  /** Admin capabilities required to use this tool (e.g. 'billing'). */
  requires?: string[]
  handler: (args: Record<string, unknown>) => Promise<unknown>
}

export interface AdminChartSpec {
  type: 'bar' | 'pie'
  title: string
  labels?: string[]
  series?: Array<{ name: string; values: number[] }>
  items?: Array<{ name: string; value: number }>
}

const DAY = 86_400_000

const toDollars = (cents: number) => Math.round(cents) / 100

async function revenueSummary({ days }: { days?: number }) {
  const n = Math.min(Math.max(days ?? 30, 1), 365)
  const now = new Date()
  const start = new Date(now.getTime() - n * DAY)
  const prevStart = new Date(start.getTime() - n * DAY)

  const [current, previous, subscriptions, plans] = await Promise.all([
    prisma.invoice.findMany({
      where: { status: 'paid', paidAt: { gte: start } },
      select: { total: true },
    }),
    prisma.invoice.findMany({
      where: { status: 'paid', paidAt: { gte: prevStart, lt: start } },
      select: { total: true },
    }),
    prisma.subscription.findMany({ where: { status: 'active' }, select: { plan: true } }),
    prisma.plan.findMany({ select: { key: true, priceMonthly: true } }),
  ])

  const priceByPlan = new Map(plans.map((p) => [p.key, p.priceMonthly ?? 0]))
  const currentRevenue = current.reduce((s, i) => s + i.total, 0)
  const previousRevenue = previous.reduce((s, i) => s + i.total, 0)
  const mrr = subscriptions.reduce((s, sub) => s + (priceByPlan.get(sub.plan) ?? 0), 0)

  return {
    periodDays: n,
    revenue: toDollars(currentRevenue),
    previousRevenue: toDollars(previousRevenue),
    changePercent:
      previousRevenue > 0 ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100) : null,
    paidInvoices: current.length,
    activeSubscriptions: subscriptions.length,
    mrr: Math.round(mrr * 100) / 100,
  }
}

async function userStats() {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 7 * DAY)
  const monthAgo = new Date(today.getTime() - 30 * DAY)

  const [total, active, suspended, verified, newToday, new7d, new30d] = await Promise.all([
    prisma.profile.count(),
    prisma.profile.count({ where: { status: 'active' } }),
    prisma.profile.count({ where: { status: 'suspended' } }),
    prisma.profile.count({ where: { emailVerified: true } }),
    prisma.profile.count({ where: { createdAt: { gte: today } } }),
    prisma.profile.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.profile.count({ where: { createdAt: { gte: monthAgo } } }),
  ])

  return { total, active, suspended, verified, newToday, new7d, new30d }
}

async function orgStats() {
  const [total, active, byPlan] = await Promise.all([
    prisma.organization.count(),
    prisma.organization.count({
      where: { agents: { some: { conversations: { some: {} } } } },
    }),
    prisma.organization.groupBy({ by: ['plan'], _count: true }),
  ])

  const topOrgs = await prisma.$queryRaw<
    Array<{ id: string; name: string; slug: string; plan: string | null; messages: number }>
  >`
    SELECT o."id", o."name", o."slug", o."plan", COUNT(m."id")::int AS "messages"
    FROM "Organization" o
    JOIN "Agent" a ON a."organizationId" = o."id"
    JOIN "Conversation" c ON c."agentId" = a."id"
    JOIN "Message" m ON m."conversationId" = c."id"
    GROUP BY o."id"
    ORDER BY "messages" DESC
    LIMIT 5`

  return {
    total,
    active,
    planDistribution: Object.fromEntries(byPlan.map((p) => [p.plan, p._count])),
    topOrgsByMessages: topOrgs,
  }
}

async function agentStats() {
  const [total, byModel, byStatus] = await Promise.all([
    prisma.agent.count(),
    prisma.agent.groupBy({ by: ['model'], _count: true }),
    prisma.agent.groupBy({ by: ['status'], _count: true }),
  ])

  const topAgents = await prisma.$queryRaw<
    Array<{ id: string; name: string; model: string; conversations: number; messages: number }>
  >`
    SELECT a."id", a."name", a."model",
           COUNT(DISTINCT c."id")::int AS "conversations",
           COUNT(m."id")::int AS "messages"
    FROM "Agent" a
    LEFT JOIN "Conversation" c ON c."agentId" = a."id"
    LEFT JOIN "Message" m ON m."conversationId" = c."id"
    GROUP BY a."id"
    ORDER BY "conversations" DESC, "messages" DESC
    LIMIT 10`

  return {
    total,
    byModel: byModel.map((m) => ({ model: m.model, count: m._count })),
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
    topAgents,
  }
}

async function conversationStats() {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [messagesToday, conversationsToday, totalMessages, byStatus, byChannel, byResolution] =
    await Promise.all([
      prisma.message.count({ where: { createdAt: { gte: today } } }),
      prisma.conversation.count({ where: { createdAt: { gte: today } } }),
      prisma.message.count(),
      prisma.conversation.groupBy({ by: ['status'], _count: true }),
      prisma.conversation.groupBy({ by: ['channel'], _count: true }),
      prisma.conversation.groupBy({ by: ['resolutionStatus'], _count: true }),
    ])

  return {
    messagesToday,
    conversationsToday,
    totalMessages,
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
    byChannel: Object.fromEntries(byChannel.map((c) => [c.channel, c._count])),
    byResolutionStatus: Object.fromEntries(byResolution.map((r) => [r.resolutionStatus, r._count])),
  }
}

async function ticketStats() {
  const [open, escalated, byResolution] = await Promise.all([
    prisma.conversation.count({
      where: {
        OR: [
          { status: { in: ['active', 'waiting'] } },
          { resolutionStatus: { in: ['active', 'escalated'] } },
        ],
      },
    }),
    prisma.conversation.count({ where: { resolutionStatus: 'escalated' } }),
    prisma.conversation.groupBy({ by: ['resolutionStatus'], _count: true }),
  ])

  return {
    open,
    escalated,
    byResolutionStatus: Object.fromEntries(byResolution.map((r) => [r.resolutionStatus, r._count])),
  }
}

async function systemHealth() {
  const [conversationsByStatus, deployments, agentsByStatus, errorsLast24h, activeDeployments] =
    await Promise.all([
      prisma.conversation.groupBy({ by: ['status'], _count: true }),
      prisma.deployment.groupBy({ by: ['status'], _count: true }),
      prisma.agent.groupBy({ by: ['status'], _count: true }),
      prisma.auditLog.count({
        where: {
          action: { contains: 'error', mode: 'insensitive' },
          createdAt: { gte: new Date(Date.now() - DAY) },
        },
      }),
      prisma.deployment.count({ where: { status: 'active' } }),
    ])

  return {
    conversationsByStatus: Object.fromEntries(conversationsByStatus.map((s) => [s.status, s._count])),
    deploymentsByStatus: Object.fromEntries(deployments.map((d) => [d.status, d._count])),
    agentsByStatus: Object.fromEntries(agentsByStatus.map((a) => [a.status, a._count])),
    activeDeployments,
    errorsLast24h,
  }
}

async function usageLimits() {
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [orgs, agents, analytics] = await Promise.all([
    prisma.organization.findMany({
      where: { plan: { not: 'free' } },
      select: { id: true, name: true, slug: true, plan: true },
    }),
    prisma.agent.findMany({ select: { id: true, organizationId: true } }),
    prisma.analytics.groupBy({
      by: ['agentId'],
      where: { date: { gte: firstOfMonth } },
      _sum: { totalMessages: true },
    }),
  ])

  const orgOfAgent = new Map(agents.map((a) => [a.id, a.organizationId]))
  const usageByOrg = new Map<string, number>()
  for (const row of analytics) {
    const orgId = orgOfAgent.get(row.agentId)
    if (!orgId) continue
    usageByOrg.set(orgId, (usageByOrg.get(orgId) ?? 0) + (row._sum.totalMessages ?? 0))
  }

  const planCache = new Map<string, number | null>()
  const rows = await Promise.all(
    orgs.map(async (org) => {
      if (!planCache.has(org.plan ?? '')) {
        const def = await getPlanDef(org.plan ?? 'free')
        planCache.set(org.plan ?? '', def?.limits.messagesPerMonth ?? null)
      }
      const limit = planCache.get(org.plan ?? '') ?? null
      const used = usageByOrg.get(org.id) ?? 0
      return {
        org: org.name,
        slug: org.slug,
        plan: org.plan,
        messagesThisMonth: used,
        limit,
        percentUsed: limit ? Math.round((used / limit) * 100) : null,
      }
    }),
  )

  return rows
    .filter((r) => r.percentUsed !== null && r.percentUsed >= 80)
    .sort((a, b) => (b.percentUsed ?? 0) - (a.percentUsed ?? 0))
    .slice(0, 10)
}

async function auditSummary() {
  const dayAgo = new Date(Date.now() - DAY)
  const [byAction, total, latest] = await Promise.all([
    prisma.auditLog.groupBy({
      by: ['action'],
      where: { createdAt: { gte: dayAgo } },
      _count: true,
      orderBy: { _count: { action: 'desc' } },
      take: 10,
    }),
    prisma.auditLog.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.auditLog.findMany({
      where: { createdAt: { gte: dayAgo } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { action: true, entityType: true, createdAt: true },
    }),
  ])

  return {
    eventsLast24h: total,
    topActions: byAction.map((a) => ({ action: a.action, count: a._count })),
    latest,
  }
}

export const adminTools: AdminTool[] = [
  {
    name: 'revenue_summary',
    description:
      'Summarize paid revenue, invoice count, MRR, and active subscriptions for the last N days (default 30) and compare against the previous period. Use for questions about revenue, money, MRR, or billing totals.',
    parameters: {
      type: 'object',
      properties: {
        days: { type: 'number', description: 'Lookback window in days (1-365). Default 30.' },
      },
    },
    requires: ['billing'],
    handler: revenueSummary,
  },
  {
    name: 'user_stats',
    description:
      'Total, active, suspended, verified users and new signups today, last 7 and 30 days. Use for questions about users, signups, or growth.',
    parameters: { type: 'object', properties: {} },
    requires: ['users'],
    handler: userStats,
  },
  {
    name: 'org_stats',
    description:
      'Total and active organizations, plan distribution, and the organizations with the most messages. Use for questions about organizations or tenants.',
    parameters: { type: 'object', properties: {} },
    requires: ['users'],
    handler: orgStats,
  },
  {
    name: 'agent_stats',
    description:
      'Total agents, most-used models, agent statuses, and the top 10 agents by conversation and message count. Use for questions about agents, models, or performance.',
    parameters: { type: 'object', properties: {} },
    requires: ['agents'],
    handler: agentStats,
  },
  {
    name: 'conversation_stats',
    description:
      'Messages and conversations today, total messages, and breakdowns by status, channel, and resolution status. Use for questions about messages sent, conversations, or channel usage.',
    parameters: { type: 'object', properties: {} },
    requires: ['users'],
    handler: conversationStats,
  },
  {
    name: 'ticket_stats',
    description:
      'Open and escalated conversations (Convio has no ticket table; conversations with active/waiting or escalated resolution status are the ticket analogue). Use for questions about open tickets or escalations.',
    parameters: { type: 'object', properties: {} },
    requires: ['users'],
    handler: ticketStats,
  },
  {
    name: 'system_health',
    description:
      'Platform health summary: conversation statuses, deployment statuses, active deployments, agent statuses, and errors logged in the last 24 hours. Use for health or stability questions.',
    parameters: { type: 'object', properties: {} },
    requires: ['monitoring'],
    handler: systemHealth,
  },
  {
    name: 'usage_limits',
    description:
      'Paid organizations at or above 80% of their monthly message plan limit, with usage and percent used. Use for questions about users or organizations approaching usage limits.',
    parameters: { type: 'object', properties: {} },
    requires: ['billing'],
    handler: usageLimits,
  },
  {
    name: 'audit_summary',
    description:
      'Platform audit activity in the last 24 hours: total events, top actions, and the most recent entries. Use for questions about recent activity or audits.',
    parameters: { type: 'object', properties: {} },
    requires: ['audit'],
    handler: auditSummary,
  },
]

export function getToolHandler(name: string): AdminTool | undefined {
  return adminTools.find((t) => t.name === name)
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function num(v: unknown): number {
  return typeof v === 'number' ? v : 0
}

/**
 * Deterministic chart spec for a successful tool result, so charts can never
 * be LLM-injected — the model only sees text summaries.
 */
export function chartForTool(name: string, result: unknown): AdminChartSpec | null {
  if (name === 'agent_stats' && isRecord(result) && Array.isArray(result.topAgents)) {
    const top = result.topAgents.slice(0, 8) as Array<Record<string, unknown>>
    if (top.length === 0) return null
    return {
      type: 'bar',
      title: 'Top agents by conversations',
      labels: top.map((a) => String(a.name ?? 'agent')),
      series: [
        { name: 'Conversations', values: top.map((a) => num(a.conversations)) },
        { name: 'Messages', values: top.map((a) => num(a.messages)) },
      ],
    }
  }
  if (name === 'org_stats' && isRecord(result) && Array.isArray(result.topOrgsByMessages)) {
    const top = result.topOrgsByMessages.slice(0, 8) as Array<Record<string, unknown>>
    if (top.length === 0) return null
    return {
      type: 'bar',
      title: 'Organizations by messages',
      labels: top.map((o) => String(o.name ?? 'org')),
      series: [{ name: 'Messages', values: top.map((o) => num(o.messages)) }],
    }
  }
  if (name === 'conversation_stats' && isRecord(result) && isRecord(result.byChannel)) {
    const entries = Object.entries(result.byChannel)
      .map(([k, v]) => ({ name: k, value: num(v) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
    if (entries.length === 0) return null
    return { type: 'pie', title: 'Messages by channel', items: entries }
  }
  return null
}
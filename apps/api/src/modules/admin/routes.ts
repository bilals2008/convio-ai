import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { AppError } from '../../plugins/error.js'
import {
  searchQuerySchema,
  orgParamsSchema,
  userParamsSchema,
  auditLogQuerySchema,
} from './admin-schema.js'

export default async function adminRoutes(fastify: FastifyInstance) {
  const adminGuard = { preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin] }

  // GET /api/admin/stats — Dashboard KPIs
  fastify.get('/admin/stats', adminGuard, async () => {
    const [
      totalUsers,
      totalOrgs,
      totalAgents,
      messagesLast24h,
      conversationsLast24h,
    ] = await Promise.all([
      prisma.profile.count(),
      prisma.organization.count(),
      prisma.agent.count(),
      prisma.message.count({
        where: { createdAt: { gte: new Date(Date.now() - 86_400_000) } },
      }),
      prisma.conversation.count({
        where: { createdAt: { gte: new Date(Date.now() - 86_400_000) } },
      }),
    ])

    return {
      data: {
        totalUsers,
        totalOrgs,
        totalAgents,
        messagesLast24h,
        conversationsLast24h,
      },
    }
  })

  // GET /api/admin/users — All users with cursor pagination + search
  fastify.get('/admin/users', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ query: searchQuerySchema })],
  }, async (request) => {
    const { cursor, limit, search } = request.query as { cursor?: string; limit: number; search?: string }

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const users = await prisma.profile.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    })

    const hasNextPage = users.length > limit
    const items = hasNextPage ? users.slice(0, limit) : users

    const userIds = items.map((u) => u.id)
    const membershipCounts = userIds.length > 0
      ? await prisma.membership.groupBy({
          by: ['userId'],
          where: { userId: { in: userIds } },
          _count: true,
        })
      : []
    const countMap = new Map(membershipCounts.map((m) => [m.userId, m._count]))

    return {
      data: items.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        orgCount: countMap.get(user.id) || 0,
      })),
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    }
  })

  // GET /api/admin/users/:id — Single user detail
  fastify.get('/admin/users/:id', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ params: userParamsSchema })],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const user = await prisma.profile.findUnique({ where: { id } })
    if (!user) throw new AppError(404, 'User not found')

    const [memberships, loginActivity] = await Promise.all([
      prisma.membership.findMany({
        where: { userId: id },
        include: { organization: { select: { id: true, name: true, slug: true, plan: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.loginActivity.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ])

    return {
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        organizations: memberships.map((m) => ({
          id: m.organization.id,
          name: m.organization.name,
          slug: m.organization.slug,
          plan: m.organization.plan,
          role: m.role,
          joinedAt: m.createdAt,
        })),
        recentLogins: loginActivity.map((l) => ({
          ipAddress: l.ipAddress,
          device: l.device,
          browser: l.browser,
          os: l.os,
          location: l.location,
          status: l.status,
          createdAt: l.createdAt,
        })),
      },
    }
  })

  // GET /api/admin/organizations — All orgs with pagination + search
  fastify.get('/admin/organizations', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ query: searchQuerySchema })],
  }, async (request) => {
    const { cursor, limit, search } = request.query as { cursor?: string; limit: number; search?: string }

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }

    const orgs = await prisma.organization.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    })

    const hasNextPage = orgs.length > limit
    const items = hasNextPage ? orgs.slice(0, limit) : orgs

    const orgIds = items.map((o) => o.id)
    const [memberCounts, agentCounts] = await Promise.all([
      prisma.membership.groupBy({
        by: ['organizationId'],
        where: { organizationId: { in: orgIds } },
        _count: true,
      }),
      prisma.agent.groupBy({
        by: ['organizationId'],
        where: { organizationId: { in: orgIds } },
        _count: true,
      }),
    ])
    const memberMap = new Map(memberCounts.map((m) => [m.organizationId, m._count]))
    const agentMap = new Map(agentCounts.map((a) => [a.organizationId, a._count]))

    return {
      data: items.map((org) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        logo: org.logo,
        plan: org.plan,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
        memberCount: memberMap.get(org.id) || 0,
        agentCount: agentMap.get(org.id) || 0,
      })),
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    }
  })

  // GET /api/admin/organizations/:id — Single org detail with stats
  fastify.get('/admin/organizations/:id', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ params: orgParamsSchema })],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const org = await prisma.organization.findUnique({ where: { id } })
    if (!org) throw new AppError(404, 'Organization not found')

    const [memberships, agentCount, conversationCount, messageCount] = await Promise.all([
      prisma.membership.findMany({
        where: { organizationId: id },
        include: { profile: { select: { id: true, name: true, email: true, avatar: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.agent.count({ where: { organizationId: id } }),
      prisma.conversation.count({
        where: { agent: { organizationId: id } },
      }),
      prisma.message.count({
        where: { conversation: { agent: { organizationId: id } } },
      }),
    ])

    return {
      data: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        logo: org.logo,
        plan: org.plan,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
        members: memberships.map((m) => ({
          id: m.id,
          role: m.role,
          joinedAt: m.createdAt,
          user: {
            id: m.profile.id,
            name: m.profile.name,
            email: m.profile.email,
            avatar: m.profile.avatar,
          },
        })),
        stats: {
          agentCount,
          conversationCount,
          messageCount,
        },
      },
    }
  })

  // GET /api/admin/analytics — Platform-wide analytics with daily breakdown
  fastify.get('/admin/analytics', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ query: searchQuerySchema })],
  }, async (request) => {
    const query = request.query as { cursor?: string; limit: number; search?: string }
    const days = Math.min(query.limit || 30, 90)
    const startDate = new Date(Date.now() - days * 86_400_000)

    const [messages, convs, orgs, profiles, agents, deployments] = await Promise.all([
      prisma.message.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
      prisma.conversation.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true, status: true, agentId: true, channel: true },
      }),
      prisma.organization.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true, plan: true },
      }),
      prisma.profile.count(),
      prisma.agent.count(),
      prisma.deployment.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true, channel: true },
      }),
    ])

    const dayMap = new Map<string, { conversations: number; messages: number }>()
    const orgDayMap = new Map<string, number>()
    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10)
      dayMap.set(d, { conversations: 0, messages: 0 })
      orgDayMap.set(d, 0)
    }

    for (const m of messages) {
      const key = m.createdAt.toISOString().slice(0, 10)
      const entry = dayMap.get(key)
      if (entry) entry.messages++
    }
    for (const c of convs) {
      const key = c.createdAt.toISOString().slice(0, 10)
      const entry = dayMap.get(key)
      if (entry) entry.conversations++
    }
    for (const o of orgs) {
      const key = o.createdAt.toISOString().slice(0, 10)
      if (orgDayMap.has(key)) orgDayMap.set(key, orgDayMap.get(key)! + 1)
    }

    const chBreakdown: Record<string, number> = {}
    for (const c of convs) {
      const ch = c.channel || 'web'
      chBreakdown[ch] = (chBreakdown[ch] || 0) + 1
    }

    const planDist: Record<string, number> = {}
    const allOrgs = await prisma.organization.findMany({ select: { plan: true } })
    for (const o of allOrgs) {
      const p = o.plan || 'free'
      planDist[p] = (planDist[p] || 0) + 1
    }

    const totalConversations = convs.length
    const totalMessages = messages.length
    const resolvedConvs = convs.filter((c) => c.status === 'resolved' || c.status === 'closed').length
    const successRate = totalConversations > 0 ? Math.round((resolvedConvs / totalConversations) * 100) : 0

    const dailyBreakdown = Array.from(dayMap.entries())
      .map(([date, d]) => ({
        date,
        totalConversations: d.conversations,
        totalMessages: d.messages,
        uniqueUsers: 0,
        avgResponseTime: 0,
        inputTokens: 0,
        outputTokens: 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const orgSignups = Array.from(orgDayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const half = Math.floor(dailyBreakdown.length / 2)
    const firstHalf = dailyBreakdown.slice(0, half)
    const secondHalf = dailyBreakdown.slice(half)
    const convsChange = firstHalf.length > 0 && secondHalf.length > 0
      ? Math.round(((secondHalf.reduce((s, d) => s + d.totalConversations, 0) - firstHalf.reduce((s, d) => s + d.totalConversations, 0)) / firstHalf.reduce((s, d) => s + d.totalConversations, 0)) * 100)
      : 0

    const topOrgs = await prisma.organization.findMany({
      select: { id: true, name: true, slug: true, plan: true, logo: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
    const orgIds = topOrgs.map((o) => o.id)
    const convCounts = orgIds.length > 0
      ? await prisma.conversation.groupBy({ by: ['agentId'], where: { agent: { organizationId: { in: orgIds } } }, _count: true })
      : []
    const agentOrgMap = orgIds.length > 0
      ? await prisma.agent.findMany({ where: { organizationId: { in: orgIds } }, select: { id: true, organizationId: true } })
      : []
    const orgConvMap = new Map<string, number>()
    for (const a of agentOrgMap) {
      const count = convCounts.find((c) => c.agentId === a.id)?._count || 0
      orgConvMap.set(a.organizationId, (orgConvMap.get(a.organizationId) || 0) + count)
    }

    return {
      data: {
        totalConversations,
        totalMessages,
        uniqueUsers: profiles,
        successRate,
        conversationsChange: convsChange,
        messagesChange: 0,
        usersChange: 0,
        dailyBreakdown,
        channelBreakdown: Object.entries(chBreakdown).map(([channel, count]) => ({ channel, count })),
        planDistribution: Object.entries(planDist).map(([plan, count]) => ({ plan, count })),
        orgSignups,
        totalOrgs: allOrgs.length,
        totalAgents: agents,
        totalUsers: profiles,
        topOrgs: topOrgs.map((o) => ({
          id: o.id,
          name: o.name,
          slug: o.slug,
          plan: o.plan,
          logo: o.logo,
          createdAt: o.createdAt,
          conversationCount: orgConvMap.get(o.id) || 0,
        })),
      },
    }
  })

  // GET /api/admin/agents — All agents with cursor pagination + search
  fastify.get('/admin/agents', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ query: searchQuerySchema })],
  }, async (request) => {
    const { cursor, limit, search } = request.query as { cursor?: string; limit: number; search?: string }

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { organization: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const agents = await prisma.agent.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        organization: { select: { id: true, name: true, slug: true } },
      },
    })

    const hasNextPage = agents.length > limit
    const items = hasNextPage ? agents.slice(0, limit) : agents

    const agentIds = items.map((a) => a.id)
    const convCounts = agentIds.length > 0
      ? await prisma.conversation.groupBy({
          by: ['agentId'],
          where: { agentId: { in: agentIds } },
          _count: true,
        })
      : []
    const convMap = new Map(convCounts.map((c) => [c.agentId, c._count]))

    return {
      data: items.map((agent) => ({
        id: agent.id,
        name: agent.name,
        model: agent.model,
        status: agent.status,
        avatar: agent.avatar,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
        organization: agent.organization,
        conversationCount: convMap.get(agent.id) || 0,
      })),
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    }
  })

  // GET /api/admin/system — System health overview
  fastify.get('/admin/system', adminGuard, async () => {
    const [conversationStats, activeDeployments, recentErrors] = await Promise.all([
      prisma.conversation.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.deployment.count({ where: { status: 'active' } }),
      prisma.auditLog.count({
        where: {
          action: { contains: 'error', mode: 'insensitive' },
          createdAt: { gte: new Date(Date.now() - 86_400_000) },
        },
      }),
    ])

    return {
      data: {
        conversationsByStatus: Object.fromEntries(
          conversationStats.map((s) => [s.status, s._count])
        ),
        activeDeployments,
        errorsLast24h: recentErrors,
      },
    }
  })

  // GET /api/admin/audit-logs — Platform audit logs with filters
  fastify.get('/admin/audit-logs', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ query: auditLogQuerySchema })],
  }, async (request) => {
    const query = request.query as {
      action?: string
      entityType?: string
      actorId?: string
      dateFrom?: Date
      dateTo?: Date
      search?: string
      limit: number
      offset: number
    }

    const where: Record<string, unknown> = {}

    if (query.action) where.action = { contains: query.action, mode: 'insensitive' }
    if (query.entityType) where.entityType = query.entityType
    if (query.actorId) where.actorId = query.actorId
    if (query.dateFrom || query.dateTo) {
      const createdAt: Record<string, Date> = {}
      if (query.dateFrom) createdAt.gte = query.dateFrom
      if (query.dateTo) createdAt.lte = query.dateTo
      where.createdAt = createdAt
    }
    if (query.search) {
      where.OR = [
        { action: { contains: query.search, mode: 'insensitive' } },
        { entityType: { contains: query.search, mode: 'insensitive' } },
        { entityId: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      prisma.auditLog.count({ where }),
    ])

    const actorIds = [...new Set(items.map((l) => l.actorId).filter(Boolean))] as string[]
    const actors = actorIds.length > 0
      ? await prisma.profile.findMany({
          where: { id: { in: actorIds } },
          select: { id: true, name: true, email: true, avatar: true },
        })
      : []
    const actorMap = new Map(actors.map((a) => [a.id, a]))

    const enriched = items.map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      metadata: log.metadata,
      createdAt: log.createdAt,
      organizationId: log.organizationId,
      actor: log.actorId && actorMap.has(log.actorId)
        ? { id: log.actorId, name: actorMap.get(log.actorId)!.name, email: actorMap.get(log.actorId)!.email, avatar: actorMap.get(log.actorId)!.avatar }
        : null,
    }))

    return { data: enriched, total }
  })
}

import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import type { Prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { AppError } from '../../plugins/error.js'
import { createClient } from '@supabase/supabase-js'
import { deleteUserAccount } from '../users/delete-user.js'
import {
  paginationSchema,
  searchQuerySchema,
  orgParamsSchema,
  userParamsSchema,
  moderationQuerySchema,
  violationQuerySchema,
  auditLogQuerySchema,
  planCreateSchema,
  planUpdateSchema,
  knowledgeParamsSchema,
  knowledgeDocumentParamsSchema,
  adminUserQuerySchema,
  adminUserUpdateSchema,
  adminUserActionSchema,
  adminBulkActionSchema,
  adminGrantCreateSchema,
  adminGrantParamsSchema,
  revenueQuerySchema,
} from './admin-schema.js'

const PLAN_RANK: Record<string, number> = { free: 0, pro: 1, enterprise: 2 }

type RevenuePeriod = 'weekly' | 'monthly' | 'yearly'

function buildRevenueBuckets(period: RevenuePeriod, now = new Date()) {
  const buckets: Array<{ start: Date; end: Date; label: string }> = []
  let count = 0
  let windowStart: Date

  if (period === 'weekly') {
    count = 12
    const monday = new Date(now)
    monday.setHours(0, 0, 0, 0)
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
    for (let i = count - 1; i >= 0; i--) {
      const start = new Date(monday)
      start.setDate(monday.getDate() - i * 7)
      const end = new Date(start)
      end.setDate(end.getDate() + 7)
      buckets.push({ start, end, label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) })
    }
    windowStart = buckets[0].start
  } else if (period === 'monthly') {
    count = 12
    for (let i = count - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 1)
      buckets.push({ start, end, label: start.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) })
    }
    windowStart = buckets[0].start
  } else {
    count = 5
    for (let i = count - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear() - i, 0, 1)
      buckets.push({ start, end: new Date(start.getFullYear() + 1, 0, 1), label: String(start.getFullYear()) })
    }
    windowStart = buckets[0].start
  }

  let prevStart: Date
  if (period === 'weekly') {
    prevStart = new Date(windowStart)
    prevStart.setDate(prevStart.getDate() - 7 * count)
  } else if (period === 'monthly') {
    prevStart = new Date(windowStart.getFullYear(), windowStart.getMonth() - count, 1)
  } else {
    prevStart = new Date(windowStart.getFullYear() - count, 0, 1)
  }

  return { buckets, windowStart, prevStart }
}

function getSupabaseAdmin() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })
}

export default async function adminRoutes(fastify: FastifyInstance) {
  const adminGuard = { preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin] }

  // GET /api/admin/stats — Dashboard KPIs
  fastify.get('/admin/stats', adminGuard, async () => {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      verifiedUsers,
      newUsers30d,
      totalOrgs,
      totalAgents,
      messagesLast24h,
      conversationsLast24h,
    ] = await Promise.all([
      prisma.profile.count(),
      prisma.profile.count({ where: { status: 'active' } }),
      prisma.profile.count({ where: { status: 'suspended' } }),
      prisma.profile.count({ where: { emailVerified: true } }),
      prisma.profile.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 86_400_000) } } }),
      prisma.organization.count(),
      prisma.agent.count(),
      prisma.message.count({
        where: { createdAt: { gte: new Date(Date.now() - 86_400_000) } },
      }),
      prisma.conversation.count({
        where: { createdAt: { gte: new Date(Date.now() - 86_400_000) } },
      }),
    ])

    const payingRows = await prisma.membership.groupBy({
      by: ['userId'],
      where: { organization: { plan: { not: 'free' } } },
    })

    return {
      data: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        verifiedUsers,
        payingUsers: payingRows.length,
        newUsers30d,
        totalOrgs,
        totalAgents,
        messagesLast24h,
        conversationsLast24h,
      },
    }
  })

  // GET /api/admin/users — All users with filters (plan/status/org/date ranges) + usage metrics
  fastify.get('/admin/users', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ query: adminUserQuerySchema })],
  }, async (request) => {
    const { cursor, limit, search, status, plan, orgId, verified, createdFrom, createdTo, activeFrom, activeTo } =
      request.query as {
        cursor?: string
        limit: number
        search?: string
        status?: string
        plan?: string
        orgId?: string
        verified?: string
        createdFrom?: Date
        createdTo?: Date
        activeFrom?: Date
        activeTo?: Date
      }

    const where: Prisma.ProfileWhereInput = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (status) where.status = status
    if (verified) where.emailVerified = verified === 'true'
    if (plan || orgId) {
      where.memberships = {
        some: {
          ...(plan ? { organization: { plan } } : {}),
          ...(orgId ? { organizationId: orgId } : {}),
        },
      }
    }
    if (createdFrom || createdTo) {
      where.createdAt = {
        ...(createdFrom ? { gte: createdFrom } : {}),
        ...(createdTo ? { lte: createdTo } : {}),
      }
    }
    if (activeFrom || activeTo) {
      where.loginActivity = {
        some: {
          createdAt: {
            ...(activeFrom ? { gte: activeFrom } : {}),
            ...(activeTo ? { lte: activeTo } : {}),
          },
        },
      }
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

    const [memberships, agentCounts, convCounts, tokenRows, loginLatest] = await Promise.all([
      userIds.length > 0
        ? prisma.membership.findMany({
            where: { userId: { in: userIds } },
            select: {
              userId: true,
              role: true,
              organization: { select: { id: true, name: true, slug: true, plan: true } },
            },
          })
        : Promise.resolve([]),
      userIds.length > 0
        ? prisma.agent.groupBy({ by: ['createdById'], where: { createdById: { in: userIds } }, _count: true })
        : Promise.resolve([]),
      userIds.length > 0
        ? prisma.conversation.groupBy({ by: ['userId'], where: { userId: { in: userIds } }, _count: true })
        : Promise.resolve([]),
      userIds.length > 0
        ? prisma.$queryRaw<Array<{ userId: string; messageCount: number; inputTokens: number; outputTokens: number }>>`
            SELECT c."userId", COUNT(m.id)::int AS "messageCount",
                   COALESCE(SUM(m."input_tokens"), 0)::int AS "inputTokens",
                   COALESCE(SUM(m."output_tokens"), 0)::int AS "outputTokens"
            FROM "Conversation" c
            JOIN "Message" m ON m."conversationId" = c.id
            WHERE c."userId" = ANY(${userIds})
            GROUP BY c."userId"`
        : Promise.resolve([]),
      userIds.length > 0
        ? prisma.loginActivity.groupBy({
            by: ['userId'],
            where: { userId: { in: userIds } },
            _max: { createdAt: true },
          })
        : Promise.resolve([]),
    ])

    const orgByUser = new Map<string, Array<{ id: string; name: string; slug: string; plan: string | null; role: string }>>()
    for (const m of memberships) {
      const list = orgByUser.get(m.userId) || []
      list.push({ ...m.organization, role: m.role })
      orgByUser.set(m.userId, list)
    }
    const agentsByUser = new Map(agentCounts.map((a) => [a.createdById!, a._count]))
    const convsByUser = new Map(convCounts.map((c) => [c.userId!, c._count]))
    const tokensByUser = new Map(tokenRows.map((t) => [t.userId, t]))
    const lastActiveByUser = new Map(loginLatest.map((l) => [l.userId, l._max.createdAt]))

    return {
      data: items.map((user) => {
        const orgs = orgByUser.get(user.id) || []
        const bestPlan = orgs.reduce((best, o) => {
          if (!o.plan) return best
          return (PLAN_RANK[o.plan] ?? 0) > (PLAN_RANK[best] ?? 0) ? o.plan : best
        }, 'free')
        const tokens = tokensByUser.get(user.id)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          status: user.status,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          orgCount: orgs.length,
          plan: bestPlan,
          organizations: orgs.map((o) => ({ id: o.id, name: o.name, slug: o.slug, plan: o.plan })),
          agentCount: agentsByUser.get(user.id) || 0,
          conversationCount: convsByUser.get(user.id) || 0,
          messageCount: tokens?.messageCount || 0,
          tokensUsed: (tokens?.inputTokens || 0) + (tokens?.outputTokens || 0),
          lastActive: lastActiveByUser.get(user.id) || null,
        }
      }),
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    }
  })

  // GET /api/admin/users/:id — Single user detail with usage, billing, agents + activity
  fastify.get('/admin/users/:id', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ params: userParamsSchema })],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const user = await prisma.profile.findUnique({ where: { id } })
    if (!user) throw new AppError(404, 'User not found')

    const [memberships, loginActivity, agentRows, convCounts, tokenRows, kbCounts, deploymentRows] = await Promise.all([
      prisma.membership.findMany({
        where: { userId: id },
        include: {
          organization: {
            select: {
              id: true, name: true, slug: true, plan: true,
              billingCustomer: {
                select: {
                  id: true,
                  subscriptions: { select: { id: true, plan: true, status: true, renewsAt: true, endsAt: true, cancelAtPeriodEnd: true } },
                  invoices: { select: { id: true, invoiceNumber: true, status: true, total: true, currency: true, createdAt: true, paidAt: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.loginActivity.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 25,
      }),
      prisma.agent.findMany({
        where: { createdById: id },
        select: { id: true, name: true, model: true, status: true, createdAt: true, updatedAt: true, organization: { select: { id: true, name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.conversation.groupBy({ by: ['userId'], where: { userId: id }, _count: true }),
      prisma.$queryRaw<Array<{ userId: string; messageCount: number; inputTokens: number; outputTokens: number }>>`
        SELECT c."userId", COUNT(m.id)::int AS "messageCount",
               COALESCE(SUM(m."input_tokens"), 0)::int AS "inputTokens",
               COALESCE(SUM(m."output_tokens"), 0)::int AS "outputTokens"
        FROM "Conversation" c
        JOIN "Message" m ON m."conversationId" = c.id
        WHERE c."userId" = ${id}
        GROUP BY c."userId"`,
      prisma.knowledgeBase.groupBy({ by: ['organizationId'], where: { organization: { memberships: { some: { userId: id } } } }, _count: true }),
      prisma.deployment.groupBy({
        by: ['channel'],
        where: { agent: { organization: { memberships: { some: { userId: id } } } } },
        _count: true,
      }),
    ])

    const conversationCount = convCounts[0]?._count || 0
    const tokenRow = tokenRows[0]
    const messageCount = tokenRow?.messageCount || 0
    const tokensUsed = (tokenRow?.inputTokens || 0) + (tokenRow?.outputTokens || 0)
    const kbCount = kbCounts.reduce((sum, k) => sum + k._count, 0)
    const agentIdsInOrgs = memberships.length > 0
      ? (await prisma.agent.findMany({
          where: { organizationId: { in: memberships.map((m) => m.organizationId) } },
          select: { id: true },
        })).length
      : 0

    const orgs = memberships.map((m) => {
      const customer = m.organization.billingCustomer
      return {
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        plan: m.organization.plan,
        role: m.role,
        joinedAt: m.createdAt,
        subscription: customer && customer.subscriptions[0]
          ? {
              plan: customer.subscriptions[0].plan,
              status: customer.subscriptions[0].status,
              renewsAt: customer.subscriptions[0].renewsAt,
              endsAt: customer.subscriptions[0].endsAt,
              cancelAtPeriodEnd: customer.subscriptions[0].cancelAtPeriodEnd,
            }
          : null,
        invoices: (customer?.invoices || []).map((i) => ({
          id: i.id,
          invoiceNumber: i.invoiceNumber,
          status: i.status,
          total: i.total,
          currency: i.currency,
          createdAt: i.createdAt,
          paidAt: i.paidAt,
        })),
      }
    })

    return {
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        status: user.status,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        organizations: orgs,
        agents: agentRows.map((a) => ({
          id: a.id,
          name: a.name,
          model: a.model,
          status: a.status,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
          organization: a.organization,
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
        usage: {
          conversationCount,
          messageCount,
          tokensUsed,
          knowledgeBaseCount: kbCount,
          agentCountInOrgs: agentIdsInOrgs,
          channelBreakdown: deploymentRows.map((d) => ({ channel: d.channel, count: d._count })),
          lastActive: loginActivity[0]?.createdAt || null,
        },
      },
    }
  })

  // GET /api/admin/users/:id/conversations — Recent conversations where the user is the account actor
  fastify.get('/admin/users/:id/conversations', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ params: userParamsSchema, query: paginationSchema })],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { cursor, limit } = request.query as { cursor?: string; limit: number }

    const items = await prisma.conversation.findMany({
      where: { userId: id },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        channel: true,
        status: true,
        contactName: true,
        createdAt: true,
        updatedAt: true,
        agent: {
          select: { id: true, name: true, organization: { select: { id: true, name: true, slug: true } } },
        },
        _count: { select: { messages: true } },
      },
    })

    const hasNextPage = items.length > limit
    const page = hasNextPage ? items.slice(0, limit) : items

    return {
      data: page.map((c) => ({
        id: c.id,
        channel: c.channel,
        status: c.status,
        contactName: c.contactName,
        messageCount: c._count.messages,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        agent: c.agent,
      })),
      nextCursor: hasNextPage ? page[page.length - 1].id : null,
    }
  })

  // PATCH /api/admin/users/:id — Edit user profile (name/avatar)
  fastify.patch('/admin/users/:id', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ params: userParamsSchema, body: adminUserUpdateSchema })],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const body = request.body as { name?: string | null; avatar?: string | null }

    const existing = await prisma.profile.findUnique({ where: { id } })
    if (!existing) throw new AppError(404, 'User not found')

    const user = await prisma.profile.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.avatar !== undefined ? { avatar: body.avatar } : {}),
      },
    })
    return { data: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, status: user.status, updatedAt: user.updatedAt } }
  })

  // POST /api/admin/users/:id/suspend — Suspend account (blocks login via Supabase ban + marks status)
  fastify.post('/admin/users/:id/suspend', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ params: adminUserActionSchema })],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const user = await prisma.profile.findUnique({ where: { id } })
    if (!user) throw new AppError(404, 'User not found')

    const supabaseAdmin = getSupabaseAdmin()
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: '8760h' })
      if (error) throw new AppError(500, `Failed to suspend auth user: ${error.message}`, 'SUPABASE_ERROR')
    }

    const updated = await prisma.profile.update({ where: { id }, data: { status: 'suspended' } })
    return { data: { id: updated.id, status: updated.status } }
  })

  // POST /api/admin/users/:id/activate — Re-activate account
  fastify.post('/admin/users/:id/activate', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ params: adminUserActionSchema })],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const user = await prisma.profile.findUnique({ where: { id } })
    if (!user) throw new AppError(404, 'User not found')

    const supabaseAdmin = getSupabaseAdmin()
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: 'none' })
      if (error) throw new AppError(500, `Failed to unban auth user: ${error.message}`, 'SUPABASE_ERROR')
    }

    const updated = await prisma.profile.update({ where: { id }, data: { status: 'active' } })
    return { data: { id: updated.id, status: updated.status } }
  })

  // POST /api/admin/users/:id/verify-email — Mark email as confirmed in Supabase auth
  fastify.post('/admin/users/:id/verify-email', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ params: adminUserActionSchema })],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const user = await prisma.profile.findUnique({ where: { id } })
    if (!user) throw new AppError(404, 'User not found')

    const supabaseAdmin = getSupabaseAdmin()
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(id, { email_confirm: true })
      if (error) throw new AppError(500, `Failed to verify email: ${error.message}`, 'SUPABASE_ERROR')
    }

    const updated = await prisma.profile.update({ where: { id }, data: { emailVerified: true } })
    return { data: { id: updated.id, emailVerified: updated.emailVerified } }
  })

  // POST /api/admin/users/:id/reset-password — Send password recovery link to user's email
  fastify.post('/admin/users/:id/reset-password', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ params: adminUserActionSchema })],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const user = await prisma.profile.findUnique({ where: { id } })
    if (!user) throw new AppError(404, 'User not found')

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) throw new AppError(500, 'Supabase service role not configured', 'CONFIGURATION_ERROR')
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({ type: 'recovery', email: user.email })
    if (error) throw new AppError(500, `Failed to generate recovery link: ${error.message}`, 'SUPABASE_ERROR')

    return { data: { sent: true, email: user.email, actionLink: data.properties.action_link } }
  })

  // POST /api/admin/users/:id/impersonate — Generate a login link the admin can open to access the account
  // ponytail: recovery link as impersonation; upgrade to a minted session token if real SSO-style access is needed
  fastify.post('/admin/users/:id/impersonate', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ params: adminUserActionSchema })],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const user = await prisma.profile.findUnique({ where: { id } })
    if (!user) throw new AppError(404, 'User not found')

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) throw new AppError(500, 'Supabase service role not configured', 'CONFIGURATION_ERROR')
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({ type: 'recovery', email: user.email })
    if (error) throw new AppError(500, `Failed to generate impersonation link: ${error.message}`, 'SUPABASE_ERROR')

    return { data: { link: data.properties.action_link, email: user.email } }
  })

  // POST /api/admin/users/:id/force-logout — Revoke all active sessions globally
  fastify.post('/admin/users/:id/force-logout', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ params: adminUserActionSchema })],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const user = await prisma.profile.findUnique({ where: { id } })
    if (!user) throw new AppError(404, 'User not found')

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) throw new AppError(500, 'Supabase service role not configured', 'CONFIGURATION_ERROR')
    const { error: logoutError } = await supabaseAdmin.auth.admin.signOut(id, 'global')
    if (logoutError) {
      // admin.signOut expects a user JWT, not a user id — fall back to the GoTrue admin endpoint
      const res = await fetch(`${process.env.SUPABASE_URL!}/auth/v1/admin/users/${id}/logout`, {
        method: 'POST',
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
      })
      if (!res.ok && res.status !== 204) {
        throw new AppError(500, `Failed to revoke sessions: ${res.status}`, 'SUPABASE_ERROR')
      }
    }

    return { data: { revoked: true } }
  })

  // DELETE /api/admin/users/:id — Hard delete user account (auth + profile + owned orgs)
  fastify.delete('/admin/users/:id', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ params: adminUserActionSchema })],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const user = await prisma.profile.findUnique({ where: { id } })
    if (!user) throw new AppError(404, 'User not found')

    await deleteUserAccount(request.log, id)
    reply.code(204).send()
  })

  // POST /api/admin/users/bulk — Bulk suspend/activate/verify/delete users
  fastify.post('/admin/users/bulk', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ body: adminBulkActionSchema })],
  }, async (request) => {
    const { ids, action } = request.body as { ids: string[]; action: 'suspend' | 'activate' | 'verify' | 'delete' }

    const supabaseAdmin = getSupabaseAdmin()
    const results: Array<{ id: string; ok: boolean; error?: string }> = []

    for (const id of ids) {
      try {
        const user = await prisma.profile.findUnique({ where: { id } })
        if (!user) throw new AppError(404, 'User not found')

        if (action === 'delete') {
          await deleteUserAccount(request.log, id)
        } else {
          if (supabaseAdmin) {
            if (action === 'suspend') {
              const { error } = await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: '8760h' })
              if (error) throw new Error(error.message)
            } else if (action === 'activate') {
              const { error } = await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: 'none' })
              if (error) throw new Error(error.message)
            } else if (action === 'verify') {
              const { error } = await supabaseAdmin.auth.admin.updateUserById(id, { email_confirm: true })
              if (error) throw new Error(error.message)
            }
          }
          await prisma.profile.update({
            where: { id },
            data: action === 'suspend' ? { status: 'suspended' }
              : action === 'activate' ? { status: 'active' }
              : { emailVerified: true },
          })
        }
        results.push({ id, ok: true })
      } catch (err) {
        results.push({ id, ok: false, error: err instanceof Error ? err.message : 'Unknown error' })
      }
    }

    const failed = results.filter((r) => !r.ok)
    return { data: { processed: results.length, failed } }
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

    const [msgDays, convDays, orgDays, userDays, channelRows, statusRows, agentCount] = await Promise.all([
      prisma.$queryRaw<{ date: Date; count: number }[]>`
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM "Message" WHERE "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")`,
      prisma.$queryRaw<{ date: Date; count: number }[]>`
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM "Conversation" WHERE "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")`,
      prisma.$queryRaw<{ date: Date; count: number }[]>`
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM "Organization" WHERE "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")`,
      prisma.$queryRaw<{ date: Date; count: number }[]>`
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM "profiles" GROUP BY DATE("createdAt")`,
      prisma.$queryRaw<{ channel: string | null; count: number }[]>`
        SELECT channel, COUNT(*)::int as count FROM "Conversation" WHERE "createdAt" >= ${startDate} GROUP BY channel`,
      prisma.$queryRaw<{ status: string; count: number }[]>`
        SELECT status, COUNT(*)::int as count FROM "Conversation" WHERE "createdAt" >= ${startDate} GROUP BY status`,
      prisma.agent.count(),
    ])

    const dayMap = new Map<string, { conversations: number; messages: number }>()
    const orgDayMap = new Map<string, number>()
    const userDayMap = new Map<string, number>()
    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10)
      dayMap.set(d, { conversations: 0, messages: 0 })
      orgDayMap.set(d, 0)
      userDayMap.set(d, 0)
    }

    for (const row of msgDays) {
      const key = row.date.toISOString().slice(0, 10)
      const entry = dayMap.get(key)
      if (entry) entry.messages += row.count
    }
    for (const row of convDays) {
      const key = row.date.toISOString().slice(0, 10)
      const entry = dayMap.get(key)
      if (entry) entry.conversations += row.count
    }
    for (const row of orgDays) {
      const key = row.date.toISOString().slice(0, 10)
      if (orgDayMap.has(key)) orgDayMap.set(key, orgDayMap.get(key)! + row.count)
    }
    for (const row of userDays) {
      const key = row.date.toISOString().slice(0, 10)
      if (userDayMap.has(key)) userDayMap.set(key, userDayMap.get(key)! + row.count)
    }

    const chBreakdown: Record<string, number> = {}
    for (const row of channelRows) {
      const ch = row.channel || 'web'
      chBreakdown[ch] = (chBreakdown[ch] || 0) + row.count
    }

    const planDist: Record<string, number> = {}
    const allOrgs = await prisma.organization.findMany({ select: { plan: true } })
    for (const o of allOrgs) {
      const p = o.plan || 'free'
      planDist[p] = (planDist[p] || 0) + 1
    }

    const totalConversations = convDays.reduce((s, r) => s + r.count, 0)
    const totalMessages = msgDays.reduce((s, r) => s + r.count, 0)
    const resolvedConvs = statusRows
      .filter((r) => r.status === 'resolved' || r.status === 'closed')
      .reduce((s, r) => s + r.count, 0)
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

    const userSignups = Array.from(userDayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const half = Math.floor(dailyBreakdown.length / 2)
    const firstHalf = dailyBreakdown.slice(0, half)
    const secondHalf = dailyBreakdown.slice(half)
    const convsChange = firstHalf.length > 0 && secondHalf.length > 0
      ? Math.round(((secondHalf.reduce((s, d) => s + d.totalConversations, 0) - firstHalf.reduce((s, d) => s + d.totalConversations, 0)) / firstHalf.reduce((s, d) => s + d.totalConversations, 0)) * 100)
      : 0

    const userCounts = userSignups.map((u) => u.count)
    const firstUserHalf = userCounts.slice(0, half)
    const secondUserHalf = userCounts.slice(half)
    const firstUserTotal = firstUserHalf.reduce((s, c) => s + c, 0)
    const usersChange = firstUserTotal > 0
      ? Math.round(((secondUserHalf.reduce((s, c) => s + c, 0) - firstUserTotal) / firstUserTotal) * 100)
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
        uniqueUsers: userDays.reduce((s, r) => s + r.count, 0),
        successRate,
        conversationsChange: convsChange,
        messagesChange: 0,
        usersChange,
        dailyBreakdown,
        channelBreakdown: Object.entries(chBreakdown).map(([channel, count]) => ({ channel, count })),
        planDistribution: Object.entries(planDist).map(([plan, count]) => ({ plan, count })),
        orgSignups,
        userSignups,
        totalOrgs: allOrgs.length,
        totalAgents: agentCount,
        totalUsers: userDays.reduce((s, r) => s + r.count, 0),
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

  // GET /api/admin/moderation — Organization moderation configs with violation counts
  fastify.get('/admin/moderation', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ query: moderationQuerySchema })],
  }, async (request) => {
    const { search, limit, offset } = request.query as { search?: string; limit: number; offset: number }

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [orgs, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          plan: true,
          createdAt: true,
          moderationConfig: true,
        },
      }),
      prisma.organization.count({ where }),
    ])

    const orgIds = orgs.map((o) => o.id)
    const violationCounts = orgIds.length > 0
      ? await prisma.auditLog.groupBy({
          by: ['organizationId'],
          where: { organizationId: { in: orgIds }, action: 'moderation.violation' },
          _count: true,
        })
      : []
    const countMap = new Map(violationCounts.map((v) => [v.organizationId, v._count]))

    return {
      data: orgs.map((org) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        plan: org.plan,
        createdAt: org.createdAt,
        config: org.moderationConfig,
        violationCount: countMap.get(org.id) || 0,
      })),
      total,
    }
  })

  // GET /api/admin/moderation/violations — Paginated recent violations across platform
  fastify.get('/admin/moderation/violations', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ query: violationQuerySchema })],
  }, async (request) => {
    const { search, limit, offset, severity, orgId } = request.query as {
      search?: string; limit: number; offset: number; severity?: string; orgId?: string
    }

    const where: Record<string, unknown> = {
      action: 'moderation.violation',
    }
    if (orgId) where.organizationId = orgId
    if (severity) where.metadata = { path: ['severity'], equals: severity }

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({ where }),
    ])

    const orgIds = [...new Set(items.map((l) => l.organizationId))]
    const orgs = orgIds.length > 0
      ? await prisma.organization.findMany({
          where: { id: { in: orgIds } },
          select: { id: true, name: true, slug: true },
        })
      : []
    const orgMap = new Map(orgs.map((o) => [o.id, o]))

    return {
      data: items.map((log) => ({
        id: log.id,
        organizationId: log.organizationId,
        organization: orgMap.get(log.organizationId) || null,
        entityType: log.entityType,
        entityId: log.entityId,
        metadata: log.metadata,
        createdAt: log.createdAt,
      })),
      total,
    }
  })

  // GET /api/admin/provider-keys — All provider keys across orgs (masked)
  fastify.get('/admin/provider-keys', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ query: searchQuerySchema })],
  }, async (request) => {
    const { cursor, limit, search } = request.query as { cursor?: string; limit: number; search?: string }

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { provider: { contains: search, mode: 'insensitive' } },
        { label: { contains: search, mode: 'insensitive' } },
        { organization: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const keys = await prisma.providerKey.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: { organization: { select: { id: true, name: true, slug: true } } },
    })

    const hasNextPage = keys.length > limit
    const items = hasNextPage ? keys.slice(0, limit) : keys

    return {
      data: items.map((k) => ({
        id: k.id,
        provider: k.provider,
        keyPreview: k.keyPreview,
        label: k.label,
        createdAt: k.createdAt,
        updatedAt: k.updatedAt,
        organization: k.organization,
      })),
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    }
  })

  // GET /api/admin/billing — Platform billing overview (revenue, subs, invoices)
  fastify.get('/admin/billing', adminGuard, async () => {
    const [subscriptions, invoices, customers] = await Promise.all([
      prisma.subscription.findMany({
        select: { id: true, plan: true, status: true, createdAt: true, customerId: true },
      }),
      prisma.invoice.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { id: true, invoiceNumber: true, status: true, total: true, currency: true, createdAt: true, paidAt: true, customerId: true },
      }),
      prisma.billingCustomer.findMany({
        select: { id: true, organizationId: true },
      }),
    ])

    const customerOrgMap = new Map(customers.map((c) => [c.id, c.organizationId]))
    const orgIds = [...new Set(customers.map((c) => c.organizationId))]
    const orgs = orgIds.length > 0
      ? await prisma.organization.findMany({ where: { id: { in: orgIds } }, select: { id: true, name: true, slug: true } })
      : []
    const orgMap = new Map(orgs.map((o) => [o.id, o]))

    const activeSubs = subscriptions.filter((s) => s.status === 'active')
    const planDist: Record<string, number> = {}
    for (const s of subscriptions) {
      planDist[s.plan] = (planDist[s.plan] || 0) + 1
    }

    const paidInvoices = invoices.filter((i) => i.status === 'paid')
    const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.total, 0)

    return {
      data: {
        totalSubscriptions: subscriptions.length,
        activeSubscriptions: activeSubs.length,
        totalRevenue,
        planDistribution: Object.entries(planDist).map(([plan, count]) => ({ plan, count })),
        invoices: invoices.map((inv) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          status: inv.status,
          total: inv.total,
          currency: inv.currency,
          createdAt: inv.createdAt,
          paidAt: inv.paidAt,
          organization: orgMap.get(customerOrgMap.get(inv.customerId) || '') || null,
        })),
        subscriptionsByStatus: Object.fromEntries(
          Object.entries(
            subscriptions.reduce((acc, s) => {
              acc[s.status] = (acc[s.status] || 0) + 1
              return acc
            }, {} as Record<string, number>)
          )
        ),
      },
    }
  })

  // GET /api/admin/revenue — Revenue analytics aggregated by week/month/year
  // ponytail: no explicit cost model in the DB, so "loss" = churned subscription value + uncollectible invoices
  fastify.get('/admin/revenue', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ query: revenueQuerySchema })],
  }, async (request) => {
    const { period } = request.query as { period: RevenuePeriod }

    const [invoices, subscriptions, plans] = await Promise.all([
      prisma.invoice.findMany({
        select: { id: true, subscriptionId: true, customerId: true, status: true, total: true, currency: true, invoiceNumber: true, paidAt: true, createdAt: true },
      }),
      prisma.subscription.findMany({
        select: { id: true, plan: true, status: true, createdAt: true, endsAt: true },
      }),
      prisma.plan.findMany({ select: { key: true, priceMonthly: true } }),
    ])

    const priceByPlan = new Map<string, number>(plans.map((p) => [p.key, p.priceMonthly || 0]))
    const priceOf = (plan: string) => priceByPlan.get(plan) ?? 0

    const { buckets, windowStart, prevStart } = buildRevenueBuckets(period)
    const rows = buckets.map((b) => ({ ...b, revenue: 0, loss: 0, newSubs: 0, churnedSubs: 0, active: 0, paidInvoices: 0 }))

    const rowIndexOf = (date: Date) => {
      for (let i = 0; i < rows.length; i++) {
        if (date >= rows[i].start && date < rows[i].end) return i
      }
      return -1
    }

    let prevRevenue = 0
    for (const inv of invoices) {
      const date = inv.paidAt ?? inv.createdAt
      const i = rowIndexOf(date)
      if (inv.status === 'paid') {
        if (i >= 0) {
          rows[i].revenue += inv.total
          rows[i].paidInvoices++
        }
        if (date >= prevStart && date < windowStart) prevRevenue += inv.total
      }
      if ((inv.status === 'uncollectible' || inv.status === 'void') && i >= 0) {
        rows[i].loss += inv.total
      }
    }

    for (const sub of subscriptions) {
      const createdI = rowIndexOf(sub.createdAt)
      if (createdI >= 0) rows[createdI].newSubs++
      if (sub.endsAt) {
        const endI = rowIndexOf(sub.endsAt)
        if (endI >= 0) {
          rows[endI].churnedSubs++
          rows[endI].loss += priceOf(sub.plan) * 100
        }
      }
    }

    const activeAt = (t: Date) => subscriptions.filter((s) => s.createdAt <= t && (!s.endsAt || s.endsAt > t))
    let running = activeAt(windowStart).length
    for (const r of rows) {
      running += r.newSubs - r.churnedSubs
      r.active = running
    }

    const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0)
    const totalLoss = rows.reduce((s, r) => s + r.loss, 0)
    const newSubscriptions = rows.reduce((s, r) => s + r.newSubs, 0)
    const churnedSubscriptions = rows.reduce((s, r) => s + r.churnedSubs, 0)
    const paidInvoiceCount = rows.reduce((s, r) => s + r.paidInvoices, 0)

    const mrr = subscriptions.filter((s) => s.status === 'active').reduce((sum, s) => sum + priceOf(s.plan), 0)
    const mrrStart = activeAt(windowStart).reduce((sum, s) => sum + priceOf(s.plan), 0)
    const activeStartCount = activeAt(windowStart).length

    // inv.total is in cents (Creem order.amount); priceMonthly is in dollars — normalize to dollars
    const toDollars = (cents: number) => Math.round(cents) / 100

    const timeline = rows.map((r) => ({
      label: r.label,
      revenue: toDollars(r.revenue),
      loss: toDollars(r.loss),
      profit: toDollars(r.revenue - r.loss),
      newSubs: r.newSubs,
      churnedSubs: r.churnedSubs,
      active: r.active,
    }))

    const subPlanMap = new Map(subscriptions.map((s) => [s.id, s.plan]))
    const planRevenue: Record<string, number> = {}
    for (const inv of invoices) {
      if (inv.status !== 'paid' || rowIndexOf(inv.paidAt ?? inv.createdAt) < 0) continue
      const plan = (inv.subscriptionId && subPlanMap.get(inv.subscriptionId)) || 'one-off'
      planRevenue[plan] = (planRevenue[plan] || 0) + inv.total
    }

    const custIds = [...new Set(invoices.map((i) => i.customerId))]
    const customers = await prisma.billingCustomer.findMany({
      where: { id: { in: custIds } },
      select: { id: true, organizationId: true },
    })
    const custOrgMap = new Map(customers.map((c) => [c.id, c.organizationId]))
    const orgIds = [...new Set(customers.map((c) => c.organizationId))]
    const orgs = await prisma.organization.findMany({
      where: { id: { in: orgIds } },
      select: { id: true, name: true, slug: true },
    })
    const orgMap = new Map(orgs.map((o) => [o.id, o]))

    const recentInvoices = invoices
      .filter((i) => i.status === 'paid')
      .map((i) => ({ ...i, paidDate: i.paidAt ?? i.createdAt }))
      .filter((i) => i.paidDate >= windowStart)
      .sort((a, b) => b.paidDate.getTime() - a.paidDate.getTime())
      .slice(0, 10)

    return {
      data: {
        period,
        summary: {
          totalRevenue: toDollars(totalRevenue),
          revenueChange: prevRevenue > 0 ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100) : 0,
          totalLoss: toDollars(totalLoss),
          netProfit: toDollars(totalRevenue - totalLoss),
          mrr: Math.round(mrr * 100) / 100,
          mrrChange: mrrStart > 0 ? Math.round(((mrr - mrrStart) / mrrStart) * 100) : 0,
          activeSubscriptions: subscriptions.filter((s) => s.status === 'active').length,
          newSubscriptions,
          churnedSubscriptions,
          churnRate: activeStartCount > 0 ? Math.round((churnedSubscriptions / activeStartCount) * 100) : 0,
          avgOrderValue: paidInvoiceCount > 0 ? toDollars(totalRevenue / paidInvoiceCount) : 0,
        },
        timeline,
        planRevenue: Object.entries(planRevenue)
          .map(([plan, revenue]) => ({ plan, revenue: toDollars(revenue) }))
          .sort((a, b) => b.revenue - a.revenue),
        recentInvoices: recentInvoices.map((inv) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          status: inv.status,
          total: inv.total / 100,
          currency: inv.currency,
          paidAt: inv.paidDate,
          plan: (inv.subscriptionId && subPlanMap.get(inv.subscriptionId)) || 'one-off',
          organization: orgMap.get(custOrgMap.get(inv.customerId) || '') || null,
        })),
      },
    }
  })

  // GET /api/admin/plans — List all pricing plans
  fastify.get('/admin/plans', adminGuard, async () => {
    const plans = await prisma.plan.findMany({ orderBy: { sortOrder: 'asc' } })
    return { data: plans }
  })

  // POST /api/admin/plans — Create a plan
  fastify.post('/admin/plans', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ body: planCreateSchema })],
  }, async (request) => {
    const body = request.body as Record<string, unknown>
    const plan = await prisma.plan.create({ data: body as any })
    return { data: plan }
  })

  // PATCH /api/admin/plans/:id — Update a plan
  fastify.patch('/admin/plans/:id', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ body: planUpdateSchema, params: orgParamsSchema })],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const body = request.body as Record<string, unknown>
    const plan = await prisma.plan.update({ where: { id }, data: body as any })
    return { data: plan }
  })

  // DELETE /api/admin/plans/:id — Delete a plan
  fastify.delete('/admin/plans/:id', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ params: orgParamsSchema })],
  }, async (request) => {
    const { id } = request.params as { id: string }
    await prisma.plan.delete({ where: { id } })
    return { success: true }
  })

  // GET /api/admin/knowledge-bases — All knowledge bases with org + usage counts
  fastify.get('/admin/knowledge-bases', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ query: searchQuerySchema })],
  }, async (request) => {
    const { cursor, limit, search } = request.query as { cursor?: string; limit: number; search?: string }

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { organization: { name: { contains: search, mode: 'insensitive' } } },
        { organization: { slug: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const kbs = await prisma.knowledgeBase.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        organization: { select: { id: true, name: true, slug: true } },
        _count: { select: { documents: true, agents: true } },
        documents: { select: { _count: { select: { chunks: true, queries: true } } } },
      },
    })

    const nextCursor = kbs.length > limit ? kbs.pop()!.id : null

    const data = kbs.map((kb) => {
      let chunkCount = 0
      let queryCount = 0
      for (const doc of kb.documents) {
        chunkCount += doc._count.chunks
        queryCount += doc._count.queries
      }
      return {
        id: kb.id,
        name: kb.name,
        description: kb.description,
        createdAt: kb.createdAt,
        organization: kb.organization,
        documentCount: kb._count.documents,
        agentCount: kb._count.agents,
        chunkCount,
        queryCount,
      }
    })

    return { data, nextCursor }
  })

  // GET /api/admin/knowledge-bases/:id — KB detail with documents + usage
  fastify.get('/admin/knowledge-bases/:kbId', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ params: knowledgeParamsSchema })],
  }, async (request) => {
    const { kbId } = request.params as { kbId: string }

    const kb = await prisma.knowledgeBase.findUnique({
      where: { id: kbId },
      include: {
        organization: { select: { id: true, name: true, slug: true } },
        documents: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { chunks: true, queries: true } },
          },
        },
      },
    })

    if (!kb) {
      throw new AppError(404, 'Knowledge base not found', 'NOT_FOUND')
    }

    const queryStats = await prisma.documentQuery.groupBy({
      by: ['documentId', 'success'],
      where: { document: { knowledgeBaseId: kbId } },
      _count: { _all: true },
    })
    const successByDoc = new Map<string, number>()
    for (const row of queryStats) {
      if (row.success) successByDoc.set(row.documentId, row._count._all)
    }

    return {
      data: {
        id: kb.id,
        name: kb.name,
        description: kb.description,
        createdAt: kb.createdAt,
        updatedAt: kb.updatedAt,
        organization: kb.organization,
        documents: kb.documents.map((doc) => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          status: doc.status,
          url: doc.url,
          fileKey: doc.fileKey,
          createdAt: doc.createdAt,
          chunkCount: doc._count.chunks,
          queryCount: doc._count.queries,
          successCount: successByDoc.get(doc.id) ?? 0,
        })),
      },
    }
  })

  // GET /api/admin/knowledge-bases/:kbId/documents/:documentId — Document chunks + query history
  fastify.get('/admin/knowledge-bases/:kbId/documents/:documentId', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ params: knowledgeDocumentParamsSchema })],
  }, async (request) => {
    const { kbId, documentId } = request.params as { kbId: string; documentId: string }

    const document = await prisma.document.findFirst({
      where: { id: documentId, knowledgeBaseId: kbId },
      include: {
        chunks: {
          select: { id: true, content: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
          take: 50,
        },
        queries: {
          select: { id: true, success: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 25,
        },
      },
    })

    if (!document) {
      throw new AppError(404, 'Document not found', 'NOT_FOUND')
    }

    const chunkCount = await prisma.documentChunk.count({ where: { documentId } })
    const successCount = await prisma.documentQuery.count({ where: { documentId, success: true } })

    return {
      data: {
        id: document.id,
        name: document.name,
        type: document.type,
        status: document.status,
        url: document.url,
        fileKey: document.fileKey,
        content: document.content,
        createdAt: document.createdAt,
        chunkCount,
        successCount,
        chunks: document.chunks,
        queries: document.queries,
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

  // GET /api/admin/docs-feedback — Docs "was this helpful" summary (platform admin only)
  fastify.get('/admin/docs-feedback', adminGuard, async () => {
    const [total, helpful, recent] = await Promise.all([
      prisma.docFeedback.count(),
      prisma.docFeedback.count({ where: { helpful: true } }),
      prisma.docFeedback.findMany({
        orderBy: { createdAt: 'desc' },
        take: 25,
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          organization: { select: { id: true, name: true, slug: true } },
        },
      }),
    ])

    const slugRows = await prisma.docFeedback.groupBy({
      by: ['slug', 'helpful'],
      _count: { _all: true },
      orderBy: { slug: 'asc' },
    })
    const map = new Map<string, { helpful: number; notHelpful: number }>()
    for (const row of slugRows) {
      const entry = map.get(row.slug) ?? { helpful: 0, notHelpful: 0 }
      if (row.helpful) entry.helpful = row._count._all
      else entry.notHelpful = row._count._all
      map.set(row.slug, entry)
    }
    const perSlug = [...map.entries()]
      .map(([slug, counts]) => ({ slug, ...counts, total: counts.helpful + counts.notHelpful }))
      .sort((a, b) => b.total - a.total)

    const notHelpful = total - helpful

    return {
      data: {
        summary: {
          totalVotes: total,
          helpful,
          notHelpful,
          helpRate: total > 0 ? Math.round((helpful / total) * 100) : 0,
        },
        perPage: perSlug,
        recent: recent.map((f) => ({
          id: f.id,
          slug: f.slug,
          helpful: f.helpful,
          comment: f.comment,
          createdAt: f.createdAt,
          user: { name: f.user.name, email: f.user.email, avatar: f.user.avatar },
          organization: { name: f.organization.name, slug: f.organization.slug },
        })),
      },
    }
  })

  // GET /api/admin/grants — List active temporary admin grants
  fastify.get('/admin/grants', { preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin] }, async () => {
    const grants = await prisma.adminGrant.findMany({
      orderBy: { expiresAt: 'desc' },
      include: { grantedBy: { select: { id: true, name: true, email: true } } },
    })
    return { data: grants }
  })

  // POST /api/admin/grants — Grant temporary admin access for N hours
  fastify.post('/admin/grants', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ body: adminGrantCreateSchema })],
  }, async (request) => {
    const { email, hours } = request.body as { email: string; hours: number }
    const normalized = email.toLowerCase()

    const existing = await prisma.adminGrant.findFirst({
      where: { email: normalized, expiresAt: { gt: new Date() } },
    })
    if (existing) {
      throw new AppError(409, 'Active grant already exists for this email', 'CONFLICT')
    }

    const grant = await prisma.adminGrant.create({
      data: {
        email: normalized,
        expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
        grantedById: request.userId,
      },
    })
    return { data: grant }
  })

  // DELETE /api/admin/grants/:id — Revoke an admin grant
  fastify.delete('/admin/grants/:id', {
    preHandler: [fastify.authenticate, fastify.ensurePlatformAdmin, validate({ params: adminGrantParamsSchema })],
  }, async (request) => {
    const { id } = request.params as { id: string }
    await prisma.adminGrant.deleteMany({ where: { id } })
    return { data: { id } }
  })
}

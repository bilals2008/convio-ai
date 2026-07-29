import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { updateUserSchema } from '@convio/validation'
import { AppError } from '../../plugins/error.js'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const paginationQuerySchema = z.object({
  orgId: z.string().uuid(),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
})

const userByIdQuerySchema = z.object({
  orgId: z.string().uuid(),
})

const userByIdParamsSchema = z.object({
  id: z.string().uuid(),
})

export default async function usersRoutes(fastify: FastifyInstance) {
  // GET /api/users/me — Current user profile
  fastify.get('/users/me', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const user = await prisma.profile.findUnique({ where: { id: request.userId } })
    if (!user) throw new AppError(404, 'User not found')
    return { data: user }
  })

  // PATCH /api/users/me — Update current user profile
  fastify.patch('/users/me', {
    preHandler: [fastify.authenticate, validate({ body: updateUserSchema })],
  }, async (request) => {
    const user = await prisma.profile.update({
      where: { id: request.userId },
      data: request.body as any,
    })
    return { data: user }
  })

  // DELETE /api/users/me — Delete everything: Supabase auth + profile + owned orgs
  fastify.delete('/users/me', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.userId!

    // Try to delete Supabase Auth user — if this fails, fall back to anonymizing the profile
    let authDeleted = false
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (serviceRoleKey) {
      const supabaseAdmin = createClient(
        process.env.SUPABASE_URL!,
        serviceRoleKey,
        { auth: { persistSession: false } }
      )
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (error) {
        request.log.warn({ err: error }, 'Failed to delete Supabase auth user — will anonymize profile instead')
      } else {
        authDeleted = true
      }
    }

    await prisma.$transaction(async (tx) => {
      const memberships = await tx.membership.findMany({ where: { userId } })

      for (const membership of memberships) {
        const orgId = membership.organizationId

        if (membership.role === 'owner') {
          const agentIds = (await tx.agent.findMany({
            where: { organizationId: orgId }, select: { id: true },
          })).map(a => a.id)
          if (agentIds.length > 0) {
            await tx.widget.deleteMany({ where: { agentId: { in: agentIds } } })
            await tx.broadcast.deleteMany({ where: { agentId: { in: agentIds } } })
            await tx.agent.deleteMany({ where: { id: { in: agentIds } } })
          }

          const kbIds = (await tx.knowledgeBase.findMany({
            where: { organizationId: orgId }, select: { id: true },
          })).map(k => k.id)
          for (const kbId of kbIds) {
            const docIds = (await tx.document.findMany({
              where: { knowledgeBaseId: kbId }, select: { id: true },
            })).map(d => d.id)
            for (const docId of docIds) {
              await tx.documentChunk.deleteMany({ where: { documentId: docId } })
            }
            await tx.document.deleteMany({ where: { knowledgeBaseId: kbId } })
          }
          await tx.knowledgeBase.deleteMany({ where: { organizationId: orgId } })

          await tx.providerKey.deleteMany({ where: { organizationId: orgId } })
          await tx.tool.deleteMany({ where: { organizationId: orgId } })
          await tx.mcpServer.deleteMany({ where: { organizationId: orgId } })
          await tx.invitation.deleteMany({ where: { organizationId: orgId } })
          await tx.auditLog.deleteMany({ where: { organizationId: orgId } })
          await tx.ssoConfig.deleteMany({ where: { organizationId: orgId } })

          const bcIds = (await tx.billingCustomer.findMany({
            where: { organizationId: orgId }, select: { id: true },
          })).map(b => b.id)
          if (bcIds.length > 0) {
            await tx.invoice.deleteMany({ where: { customerId: { in: bcIds } } })
            await tx.subscription.deleteMany({ where: { customerId: { in: bcIds } } })
          }
          await tx.billingCustomer.deleteMany({ where: { organizationId: orgId } })
          await tx.moderationConfig.deleteMany({ where: { organizationId: orgId } })
          await tx.avatarPreset.deleteMany({ where: { organizationId: orgId } })
          await tx.membership.deleteMany({ where: { organizationId: orgId } })
          await tx.organization.delete({ where: { id: orgId } })
        } else {
          const ownAgentIds = (await tx.agent.findMany({
            where: { createdById: userId, organizationId: orgId },
            select: { id: true },
          })).map(a => a.id)
          if (ownAgentIds.length > 0) {
            await tx.widget.deleteMany({ where: { agentId: { in: ownAgentIds } } })
            await tx.agent.deleteMany({ where: { id: { in: ownAgentIds } } })
          }
          await tx.membership.delete({ where: { userId_organizationId: { userId, organizationId: orgId } } })

          const remaining = await tx.membership.count({ where: { organizationId: orgId } })
          if (remaining > 0) {
            const owners = await tx.membership.findMany({ where: { organizationId: orgId, role: 'owner' } })
            if (owners.length === 0) {
              const next = await tx.membership.findFirst({
                where: { organizationId: orgId }, orderBy: { createdAt: 'asc' },
              })
              if (next) {
                await tx.membership.update({ where: { id: next.id }, data: { role: 'owner' } })
              }
            }
          }
        }
      }

      await tx.membership.deleteMany({ where: { userId } })
      await tx.loginActivity.deleteMany({ where: { userId } })
      await tx.auditLog.updateMany({
        where: { actorId: userId }, data: { actorId: null },
      })
      await tx.invitation.updateMany({
        where: { invitedById: userId }, data: { invitedById: null },
      })
      await tx.agent.updateMany({
        where: { createdById: userId }, data: { createdById: null },
      })

      if (authDeleted) {
        await tx.profile.delete({ where: { id: userId } })
      } else {
        await tx.profile.update({
          where: { id: userId },
          data: { name: null, avatar: null, email: `deleted-${userId.slice(0, 8)}@convio.local` },
        })
      }
    }, { timeout: 30000 })

    reply.code(204).send()
  })

  // GET /api/users — List org members (admin only, cursor-based pagination)
  fastify.get('/users', {
    preHandler: [
      fastify.authenticate,
      validate({ query: paginationQuerySchema }),
    ],
  }, async (request) => {
    const { orgId, cursor, limit } = request.query as {
      orgId: string
      cursor?: string
      limit: number
    }

    await fastify.ensureAdmin(request.userId!, orgId)

    const memberships = await prisma.membership.findMany({
      where: { organizationId: orgId },
      include: { profile: true },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { id: 'desc' },
    })

    const hasNextPage = memberships.length > limit
    const items = hasNextPage ? memberships.slice(0, limit) : memberships

    return {
      data: items.map((m) => ({
        ...m.profile,
        role: m.role,
        joinedAt: m.createdAt,
      })),
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    }
  })

  // GET /api/users/:id — Get user by ID (admin only)
  fastify.get('/users/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: userByIdParamsSchema, query: userByIdQuerySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { orgId } = request.query as { orgId: string }

    await fastify.ensureAdmin(request.userId!, orgId)

    const membership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId: id, organizationId: orgId } },
      include: { profile: true },
    })

    if (!membership) throw new AppError(404, 'User not found in this organization')

    return {
      data: {
        ...membership.profile,
        role: membership.role,
        joinedAt: membership.createdAt,
      },
    }
  })
}

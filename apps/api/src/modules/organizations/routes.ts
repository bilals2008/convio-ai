import type { FastifyInstance } from 'fastify'
import { prisma, MembershipRole } from '@convio/database'
import crypto from 'node:crypto'
import { validate } from '../../plugins/validate.js'
import { createOrganizationSchema, updateOrganizationSchema, membershipRoleSchema } from '@convio/validation'
import { AppError } from '../../plugins/error.js'
import { NOTIFICATION_EVENTS } from '../../services/notifications/events.js'
import { z } from 'zod'

const orgParamsSchema = z.object({
  id: z.string().uuid(),
})

const memberParamsSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
})

const addMemberSchema = z.object({
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  role: membershipRoleSchema.refine((r) => r !== 'owner', {
    message: 'Cannot add a member as owner. Use transfer ownership instead.',
  }),
}).refine((d) => d.userId || d.email, { message: 'Either userId or email is required' })

const bulkInviteBodySchema = z.object({
  members: z.array(z.object({
    email: z.string().email(),
    role: membershipRoleSchema.refine((r) => r !== 'owner', {
      message: 'Cannot add a member as owner.',
    }),
  })).min(1).max(50),
})

const updateRoleSchema = z.object({
  role: membershipRoleSchema,
})

const membersQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export default async function organizationsRoutes(fastify: FastifyInstance) {
  // POST /api/organizations — Create new organization (creator becomes owner)
  fastify.post('/organizations', {
    preHandler: [fastify.authenticate, fastify.checkOrgLimit, validate({ body: createOrganizationSchema })],
  }, async (request) => {
    const { name, slug, logo } = request.body as {
      name: string
      slug: string
      logo?: string
    }

    const org = await prisma.organization.create({
      data: { name, slug, logo, plan: 'free' },
    })

    await prisma.membership.create({
      data: { userId: request.userId!, organizationId: org.id, role: 'owner' },
    })

    await fastify.auditLog({
      organizationId: org.id,
      actorId: request.userId,
      action: 'organization.created',
      entityType: 'organization',
      entityId: org.id,
      metadata: { name: org.name, slug: org.slug },
    })

    return { data: org }
  })

  // GET /api/organizations — List user's organizations
  fastify.get('/organizations', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    let memberships
    try {
      memberships = await prisma.membership.findMany({
        where: { userId: request.userId },
        include: { organization: true },
        orderBy: { createdAt: 'desc' },
      })
    } catch {
      return { data: [] }
    }

    const orgs = memberships.map((m) => ({
      ...m.organization,
      role: m.role,
    }))

    return { data: orgs }
  })

  // GET /api/organizations/:id — Get organization by ID (member only)
  fastify.get('/organizations/:id', {
    preHandler: [
      fastify.authenticate,
      fastify.requireMembership,
      validate({ params: orgParamsSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const org = await prisma.organization.findUnique({ where: { id } })
    if (!org) throw new AppError(404, 'Organization not found')

    return { data: org }
  })

  // PATCH /api/organizations/:id — Update organization (admin/owner only)
  fastify.patch('/organizations/:id', {
    preHandler: [
      fastify.authenticate,
      fastify.requireAdmin,
      validate({ params: orgParamsSchema, body: updateOrganizationSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    const body = request.body as Record<string, unknown>
    const data: Record<string, unknown> = {}
    if (body.name !== undefined) data.name = body.name
    if (body.slug !== undefined) data.slug = body.slug
    if (body.logo !== undefined) data.logo = body.logo
    if (body.aiGenerationModel !== undefined) data.aiGenerationModel = body.aiGenerationModel
    // ponytail: plan is billing-owned — changes go through the billing module only

    const org = await prisma.organization.update({
      where: { id },
      data,
    })

    await fastify.auditLog({
      organizationId: id,
      actorId: request.userId,
      action: 'organization.updated',
      entityType: 'organization',
      entityId: id,
      metadata: request.body as Record<string, unknown>,
    })

    return { data: org }
  })

  // DELETE /api/organizations/:id — Delete organization (owner only)
  fastify.delete('/organizations/:id', {
    preHandler: [
      fastify.authenticate,
      fastify.requireOwner,
      validate({ params: orgParamsSchema }),
    ],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const orgToDelete = await prisma.organization.findUnique({ where: { id } })
    if (!orgToDelete) throw new AppError(404, 'Organization not found')

    await prisma.$transaction(async (tx) => {
      await tx.auditLog.create({
        data: {
          organizationId: id,
          actorId: request.userId,
          action: 'organization.deleted',
          entityType: 'organization',
          entityId: id,
          metadata: { name: orgToDelete.name, slug: orgToDelete.slug } as any,
        },
      })

      // cleanup agents and their dependencies
      const agentIds = (await tx.agent.findMany({
        where: { organizationId: id }, select: { id: true },
      })).map(a => a.id)
      if (agentIds.length > 0) {
        await tx.widget.deleteMany({ where: { agentId: { in: agentIds } } })
        await tx.broadcast.deleteMany({ where: { agentId: { in: agentIds } } })
        await tx.agent.deleteMany({ where: { id: { in: agentIds } } })
      }

      // cleanup knowledge bases with documents
      const kbIds = (await tx.knowledgeBase.findMany({
        where: { organizationId: id }, select: { id: true },
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
      await tx.knowledgeBase.deleteMany({ where: { organizationId: id } })

      await tx.providerKey.deleteMany({ where: { organizationId: id } })
      await tx.tool.deleteMany({ where: { organizationId: id } })
      await tx.mcpServer.deleteMany({ where: { organizationId: id } })
      await tx.invitation.deleteMany({ where: { organizationId: id } })
      await tx.auditLog.deleteMany({ where: { organizationId: id } })
      await tx.ssoConfig.deleteMany({ where: { organizationId: id } })

      // cleanup billing chain
      const bcIds = (await tx.billingCustomer.findMany({
        where: { organizationId: id }, select: { id: true },
      })).map(b => b.id)
      if (bcIds.length > 0) {
        await tx.invoice.deleteMany({ where: { customerId: { in: bcIds } } })
        await tx.subscription.deleteMany({ where: { customerId: { in: bcIds } } })
      }
      await tx.billingCustomer.deleteMany({ where: { organizationId: id } })

      await tx.moderationConfig.deleteMany({ where: { organizationId: id } })
      await tx.avatarPreset.deleteMany({ where: { organizationId: id } })
      await tx.membership.deleteMany({ where: { organizationId: id } })
      await tx.organization.delete({ where: { id } })
    }, { timeout: 30000 })

    reply.code(204).send()
  })

  // GET /api/organizations/:id/members — List members (member only, cursor pagination)
  fastify.get('/organizations/:id/members', {
    preHandler: [
      fastify.authenticate,
      fastify.requireMembership,
      validate({ params: orgParamsSchema, query: membersQuerySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { cursor, limit } = request.query as { cursor?: string; limit: number }

    const memberships = await prisma.membership.findMany({
      where: { organizationId: id },
      include: { profile: true },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'asc' },
    })

    const hasNextPage = memberships.length > limit
    const items = hasNextPage ? memberships.slice(0, limit) : memberships

    return {
      data: items.map((m) => ({
        id: m.id,
        role: m.role,
        joinedAt: m.createdAt,
        user: {
          id: m.profile.id,
          name: m.profile.name,
          email: m.profile.email,
          image: m.profile.avatar,
        },
      })),
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    }
  })

  // POST /api/organizations/:id/members — Add member (admin only)
  fastify.post('/organizations/:id/members', {
    preHandler: [
      fastify.authenticate,
      fastify.requireAdmin,
      validate({ params: orgParamsSchema, body: addMemberSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { userId: bodyUserId, email, role } = request.body as { userId?: string; email?: string; role: 'admin' | 'member' | 'viewer' }

    let userId = bodyUserId

    if (!userId && email) {
      const profile = await prisma.profile.findFirst({ where: { email } })
      if (!profile) throw new AppError(404, 'No user found with that email')
      userId = profile.id
    }

    if (!userId) {
      throw new AppError(400, 'Could not resolve user')
    }

    const existing = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: id } },
    })

    if (existing) {
      throw new AppError(409, 'User is already a member of this organization', 'CONFLICT')
    }

    const profile = await prisma.profile.findUnique({ where: { id: userId } })
    if (!profile) throw new AppError(404, 'User not found')

    const membership = await prisma.membership.create({
      data: { userId, organizationId: id, role },
      include: { profile: true },
    })

    await fastify.auditLog({
      organizationId: id,
      actorId: request.userId,
      action: 'member.invited',
      entityType: 'membership',
      entityId: membership.id,
      metadata: { userId, email: membership.profile.email, role },
    })

    if (fastify.email) {
      const [inviter, org] = await Promise.all([
        prisma.profile.findUnique({ where: { id: request.userId } }),
        prisma.organization.findUnique({ where: { id } }),
      ])

      fastify.email.sendInvite({
        to: membership.profile.email,
        inviterName: inviter?.name || 'A team member',
        orgName: org?.name || 'an organization',
        role,
      }).catch((err) => {
        request.log.error({ err, email: membership.profile.email }, 'Failed to send invite email')
      })
    }

    return {
      data: {
        id: membership.id,
        role: membership.role,
        joinedAt: membership.createdAt,
        user: {
          id: membership.profile.id,
          name: membership.profile.name,
          email: membership.profile.email,
          image: membership.profile.avatar,
        },
      },
    }
  })

  // POST /api/organizations/:id/members/bulk — Bulk invite members (admin only)
  fastify.post('/organizations/:id/members/bulk', {
    preHandler: [
      fastify.authenticate,
      fastify.requireAdmin,
      validate({ params: orgParamsSchema, body: bulkInviteBodySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { members } = request.body as { members: Array<{ email: string; role: string }> }

    const inviter = await prisma.profile.findUnique({ where: { id: request.userId } })
    const org = await prisma.organization.findUnique({ where: { id } })
    const inviterName = inviter?.name || 'A team member'
    const orgName = org?.name || 'an organization'

    const results: Array<{ email: string; status: string; error?: string; role?: string; emailSent?: boolean }> = []

    for (const member of members) {
      try {
        const profile = await prisma.profile.findFirst({ where: { email: member.email } })
        if (!profile) {
          results.push({ email: member.email, status: 'skipped', error: 'No user found with that email' })
          continue
        }

        const existing = await prisma.membership.findUnique({
          where: { userId_organizationId: { userId: profile.id, organizationId: id } },
        })

        if (existing) {
          results.push({ email: member.email, status: 'skipped', error: 'Already a member' })
          continue
        }

        const membership = await prisma.membership.create({
          data: { userId: profile.id, organizationId: id, role: member.role as any },
        })

        await fastify.auditLog({
          organizationId: id,
          actorId: request.userId,
          action: 'member.invited',
          entityType: 'membership',
          entityId: membership.id,
          metadata: { userId: profile.id, email: member.email, role: member.role },
        })

        const emailSent = fastify.email
          ? await fastify.email.sendInvite({
              to: member.email,
              inviterName,
              orgName,
              role: member.role,
            }).then(() => true).catch((err) => {
              request.log.error({ err, email: member.email }, 'Failed to send invite email')
              return false
            })
          : false

        results.push({ email: member.email, status: 'added', role: member.role, emailSent })
      } catch (err) {
        results.push({ email: member.email, status: 'error', error: (err as Error).message })
      }
    }

    return { data: { results, total: members.length, succeeded: results.filter((r) => r.status === 'added').length } }
  })

  // DELETE /api/organizations/:id/members/:userId — Remove member (admin or self-leave)
  fastify.delete('/organizations/:id/members/:userId', {
    preHandler: [
      fastify.authenticate,
      validate({ params: memberParamsSchema }),
    ],
  }, async (request, reply) => {
    const { id, userId } = request.params as { id: string; userId: string }

    const targetMembership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: id } },
    })

    if (!targetMembership) {
      throw new AppError(404, 'Member not found in this organization')
    }

    const isSelf = request.userId === userId

    if (!isSelf) {
      await fastify.ensureAdmin(request.userId!, id)
    }

    if (targetMembership.role === 'owner') {
      const ownerCount = await prisma.membership.count({
        where: { organizationId: id, role: 'owner' },
      })

      if (ownerCount <= 1) {
        throw new AppError(400, 'Cannot remove the last owner. Transfer ownership first.', 'LAST_OWNER')
      }
    }

    await prisma.membership.delete({
      where: { userId_organizationId: { userId, organizationId: id } },
    })

    fastify.emitEvent(NOTIFICATION_EVENTS.MEMBER_REMOVED, {
      organizationId: id,
      userId: isSelf ? undefined : userId,
      actorId: request.userId,
      metadata: { role: targetMembership.role },
    })

    await fastify.auditLog({
      organizationId: id,
      actorId: request.userId,
      action: 'member.removed',
      entityType: 'membership',
      entityId: targetMembership.id,
      metadata: { userId, role: targetMembership.role, isSelf },
    })

    reply.code(204).send()
  })

  // POST /api/organizations/:id/invitations — Create invitation (admin only)
  fastify.post('/organizations/:id/invitations', {
    preHandler: [
      fastify.authenticate,
      fastify.requireAdmin,
      validate({ params: orgParamsSchema, body: bulkInviteBodySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { members } = request.body as { members: Array<{ email: string; role: string }> }

    const inviter = await prisma.profile.findUnique({ where: { id: request.userId } })
    const org = await prisma.organization.findUnique({ where: { id } })
    const inviterName = inviter?.name || 'A team member'
    const orgName = org?.name || 'an organization'

    const results: Array<{ email: string; status: string; error?: string }> = []

    for (const member of members) {
      try {
        const existingProfile = await prisma.profile.findFirst({ where: { email: member.email } })
        if (existingProfile) {
          results.push({ email: member.email, status: 'skipped', error: 'Already registered — add directly instead' })
          continue
        }

        const existingInvite = await prisma.invitation.findFirst({
          where: { email: member.email, organizationId: id, acceptedAt: null, expiresAt: { gt: new Date() } },
        })
        if (existingInvite) {
          results.push({ email: member.email, status: 'skipped', error: 'Already invited' })
          continue
        }

        const token = crypto.randomBytes(32).toString('hex')
        const invitation = await prisma.invitation.create({
          data: {
            email: member.email,
            organizationId: id,
            role: member.role as any,
            token,
            invitedById: request.userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        })

        fastify.emitEvent(NOTIFICATION_EVENTS.MEMBER_INVITED, {
          organizationId: id,
          actorId: request.userId,
          entityName: member.email,
          metadata: { email: member.email, role: member.role },
        })

        await fastify.auditLog({
          organizationId: id,
          actorId: request.userId,
          action: 'member.invited',
          entityType: 'invitation',
          entityId: invitation.id,
          metadata: { email: member.email, role: member.role },
        })

        if (fastify.email) {
          const inviteUrl = `${fastify.config.WEB_URL ?? fastify.config.PUBLIC_URL}/invite?token=${token}`
          fastify.email.sendInvite({
            to: member.email,
            inviterName,
            orgName,
            role: member.role,
            inviteUrl,
          }).catch((err) => {
            request.log.error({ err, email: member.email }, 'Failed to send invite email')
          })
        }

        results.push({ email: member.email, status: 'invited' })
      } catch (err) {
        results.push({ email: member.email, status: 'error', error: (err as Error).message })
      }
    }

    return { data: { results, total: members.length, succeeded: results.filter((r) => r.status === 'invited').length } }
  })

  // GET /api/invitations/:token — Get invitation info (public)
  fastify.get('/invitations/:token', {
    preHandler: [validate({ params: z.object({ token: z.string() }) })],
  }, async (request) => {
    const { token } = request.params as { token: string }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { organization: { select: { id: true, name: true, logo: true } }, invitedBy: { select: { name: true } } },
    })

    if (!invitation) throw new AppError(404, 'Invitation not found')
    if (invitation.acceptedAt) throw new AppError(400, 'Invitation already accepted')
    if (invitation.expiresAt < new Date()) throw new AppError(410, 'Invitation expired')

    return {
      data: {
        email: invitation.email,
        role: invitation.role,
        organization: invitation.organization,
        invitedBy: invitation.invitedBy?.name || 'A team member',
      },
    }
  })

  // POST /api/invitations/:token/accept — Accept invitation (authenticated)
  fastify.post('/invitations/:token/accept', {
    preHandler: [fastify.authenticate, validate({ params: z.object({ token: z.string() }) })],
  }, async (request) => {
    const { token } = request.params as { token: string }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
    })

    if (!invitation) throw new AppError(404, 'Invitation not found')
    if (invitation.acceptedAt) throw new AppError(400, 'Invitation already accepted')
    if (invitation.expiresAt < new Date()) throw new AppError(410, 'Invitation expired')

    const profile = await prisma.profile.findUnique({ where: { id: request.userId } })
    if (!profile) throw new AppError(404, 'User not found')
    if (profile.email !== invitation.email) {
      throw new AppError(403, 'This invitation was sent to a different email address')
    }

    const existingMember = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId: request.userId!, organizationId: invitation.organizationId } },
    })
    if (existingMember) {
      await prisma.invitation.update({ where: { id: invitation.id }, data: { acceptedAt: new Date() } })
      return { data: { organizationId: invitation.organizationId, alreadyMember: true } }
    }

    const membership = await prisma.membership.create({
      data: { userId: request.userId!, organizationId: invitation.organizationId, role: invitation.role },
    })

    fastify.emitEvent(NOTIFICATION_EVENTS.MEMBER_JOINED, {
      organizationId: invitation.organizationId,
      userId: request.userId,
      entityName: profile.name ?? profile.email,
    })

    await prisma.invitation.update({ where: { id: invitation.id }, data: { acceptedAt: new Date() } })

    await fastify.auditLog({
      organizationId: invitation.organizationId,
      actorId: request.userId,
      action: 'member.invited',
      entityType: 'membership',
      entityId: membership.id,
      metadata: { userId: request.userId, email: profile.email, role: invitation.role, viaInvite: true },
    })

    return { data: { organizationId: invitation.organizationId } }
  })

  // PATCH /api/organizations/:id/members/:userId/role — Update member role (owner only)
  fastify.patch('/organizations/:id/members/:userId/role', {
    preHandler: [
      fastify.authenticate,
      fastify.requireOwner,
      validate({ params: memberParamsSchema, body: updateRoleSchema }),
    ],
  }, async (request) => {
    const { id, userId } = request.params as { id: string; userId: string }
    const { role } = request.body as { role: string }

    const targetMembership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: id } },
    })

    if (!targetMembership) {
      throw new AppError(404, 'Member not found in this organization')
    }

    if (targetMembership.role === 'owner' && role !== 'owner') {
      const ownerCount = await prisma.membership.count({
        where: { organizationId: id, role: 'owner' },
      })

      if (ownerCount <= 1) {
        throw new AppError(400, 'Cannot demote the last owner. Transfer ownership first.', 'LAST_OWNER')
      }
    }

    if (role === 'owner') {
      await prisma.membership.update({
        where: { userId_organizationId: { userId: request.userId!, organizationId: id } },
      data: { role: 'admin' as any },
    })
  }

  const updated = await prisma.membership.update({
    where: { userId_organizationId: { userId, organizationId: id } },
    data: { role: role as any },
    include: { profile: true },
  })

  fastify.emitEvent(NOTIFICATION_EVENTS.MEMBER_ROLE_CHANGED, {
    organizationId: id,
    userId,
    actorId: request.userId,
    entityName: updated.profile?.name ?? updated.profile?.email ?? 'the organization',
    metadata: { role },
  })

    await fastify.auditLog({
      organizationId: id,
      actorId: request.userId,
      action: 'member.role_changed',
      entityType: 'membership',
      entityId: updated.id,
      metadata: { userId, oldRole: targetMembership.role, newRole: role },
    })

    return {
      data: {
        id: updated.id,
        role: updated.role,
        joinedAt: updated.createdAt,
        user: {
          id: updated.profile.id,
          name: updated.profile.name,
          email: updated.profile.email,
          image: updated.profile.avatar,
        },
      },
    }
  })
}

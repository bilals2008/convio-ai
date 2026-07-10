import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { createOrganizationSchema, updateOrganizationSchema, membershipRoleSchema } from '@convio/validation'
import { AppError } from '../../plugins/error.js'
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
    preHandler: [fastify.authenticate, validate({ body: createOrganizationSchema })],
  }, async (request) => {
    const { name, slug, logo, plan } = request.body as {
      name: string
      slug: string
      logo?: string
      plan?: string
    }

    const org = await prisma.organization.create({
      data: { name, slug, logo, plan: plan || 'free' },
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
    const memberships = await prisma.membership.findMany({
      where: { userId: request.userId },
      include: { organization: true },
      orderBy: { createdAt: 'desc' },
    })

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
      validate({ params: orgParamsSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    await fastify.getMembership(request.userId!, id)

    const org = await prisma.organization.findUnique({ where: { id } })
    if (!org) throw new AppError(404, 'Organization not found')

    return { data: org }
  })

  // PATCH /api/organizations/:id — Update organization (admin/owner only)
  fastify.patch('/organizations/:id', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema, body: updateOrganizationSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }

    await fastify.ensureAdmin(request.userId!, id)

    const org = await prisma.organization.update({
      where: { id },
      data: request.body as any,
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
      validate({ params: orgParamsSchema }),
    ],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    await fastify.ensureOwner(request.userId!, id)

    const orgToDelete = await prisma.organization.findUnique({ where: { id } })

    await prisma.organization.delete({ where: { id } })

    await fastify.auditLog({
      organizationId: id,
      actorId: request.userId,
      action: 'organization.deleted',
      entityType: 'organization',
      entityId: id,
      metadata: { name: orgToDelete?.name, slug: orgToDelete?.slug },
    })

    reply.code(204).send()
  })

  // GET /api/organizations/:id/members — List members (member only, cursor pagination)
  fastify.get('/organizations/:id/members', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema, query: membersQuerySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { cursor, limit } = request.query as { cursor?: string; limit: number }

    await fastify.getMembership(request.userId!, id)

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
      validate({ params: orgParamsSchema, body: addMemberSchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { userId: bodyUserId, email, role } = request.body as { userId?: string; email?: string; role: 'admin' | 'member' | 'viewer' }

    await fastify.ensureAdmin(request.userId!, id)

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
      validate({ params: orgParamsSchema, body: bulkInviteBodySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { members } = request.body as { members: Array<{ email: string; role: string }> }

    await fastify.ensureAdmin(request.userId!, id)

    const results: Array<{ email: string; status: string; error?: string; role?: string }> = []

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
          data: { userId: profile.id, organizationId: id, role: member.role },
        })

        await fastify.auditLog({
          organizationId: id,
          actorId: request.userId,
          action: 'member.invited',
          entityType: 'membership',
          entityId: membership.id,
          metadata: { userId: profile.id, email: member.email, role: member.role },
        })

        results.push({ email: member.email, status: 'added', role: member.role })
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

  // PATCH /api/organizations/:id/members/:userId/role — Update member role (owner only)
  fastify.patch('/organizations/:id/members/:userId/role', {
    preHandler: [
      fastify.authenticate,
      validate({ params: memberParamsSchema, body: updateRoleSchema }),
    ],
  }, async (request) => {
    const { id, userId } = request.params as { id: string; userId: string }
    const { role } = request.body as { role: string }

    await fastify.ensureOwner(request.userId!, id)

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
        data: { role: 'admin' },
      })
    }

    const updated = await prisma.membership.update({
      where: { userId_organizationId: { userId, organizationId: id } },
      data: { role },
      include: { profile: true },
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

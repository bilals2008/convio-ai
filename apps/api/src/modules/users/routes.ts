import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { updateUserSchema } from '@convio/validation'
import { AppError } from '../../plugins/error.js'
import { z } from 'zod'
import { deleteUserAccount } from './delete-user.js'

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

  // PATCH /api/users/me — Update current user profile (email is auth-owned, never client-set)
  fastify.patch('/users/me', {
    preHandler: [fastify.authenticate, validate({ body: updateUserSchema })],
  }, async (request) => {
    const body = request.body as Record<string, unknown>
    const data: Record<string, unknown> = {}
    if (body.name !== undefined) data.name = body.name
    if (body.avatar !== undefined) data.avatar = body.avatar
    const user = await prisma.profile.update({
      where: { id: request.userId },
      data,
    })
    return { data: user }
  })

  // DELETE /api/users/me — Delete everything: Supabase auth + profile + owned orgs
  fastify.delete('/users/me', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    await deleteUserAccount(request.log, request.userId!)
    reply.code(204).send()
  })

  // GET /api/users — List org members (admin only, cursor-based pagination)
  fastify.get('/users', {
    preHandler: [
      fastify.authenticate,
      fastify.requireAdmin,
      validate({ query: paginationQuerySchema }),
    ],
  }, async (request) => {
    const { orgId, cursor, limit } = request.query as {
      orgId: string
      cursor?: string
      limit: number
    }

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
      fastify.requireAdmin,
      validate({ params: userByIdParamsSchema, query: userByIdQuerySchema }),
    ],
  }, async (request) => {
    const { id } = request.params as { id: string }
    const { orgId } = request.query as { orgId: string }

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

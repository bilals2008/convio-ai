import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { createOrganizationSchema, updateOrganizationSchema } from '@convio/validation'
import { AppError } from '../../plugins/error.js'

export default async function organizationsRoutes(fastify: FastifyInstance) {
  fastify.get('/organizations', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const memberships = await prisma.membership.findMany({
      where: { userId: request.userId },
      include: { organization: true },
    })
    return { data: memberships.map((m: { organization: any }) => m.organization) }
  })

  fastify.post('/organizations', {
    preHandler: [fastify.authenticate, validate({ body: createOrganizationSchema })],
  }, async (request) => {
    const { name, slug, logo, plan } = request.body as any
    const org = await prisma.organization.create({
      data: { name, slug, logo, plan: plan || 'free' },
    })
    await prisma.membership.create({
      data: { userId: request.userId!, organizationId: org.id, role: 'owner' },
    })
    return { data: org }
  })

  fastify.get('/organizations/:orgId', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { orgId } = request.params as any
    const org = await prisma.organization.findUnique({ where: { id: orgId } })
    if (!org) throw new AppError(404, 'Organization not found')
    return { data: org }
  })

  fastify.patch('/organizations/:orgId', {
    preHandler: [fastify.authenticate, validate({ body: updateOrganizationSchema })],
  }, async (request) => {
    const { orgId } = request.params as any
    const org = await prisma.organization.update({
      where: { id: orgId },
      data: request.body as any,
    })
    return { data: org }
  })

  fastify.delete('/organizations/:orgId', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { orgId } = request.params as any
    await prisma.organization.delete({ where: { id: orgId } })
    reply.code(204).send()
  })

  // Members
  fastify.get('/organizations/:orgId/members', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { orgId } = request.params as any
    const members = await prisma.membership.findMany({
      where: { organizationId: orgId },
      include: { user: true },
    })
    return { data: members.map((m: { id: string; role: string; user: any }) => ({ id: m.id, role: m.role, user: m.user })) }
  })
}

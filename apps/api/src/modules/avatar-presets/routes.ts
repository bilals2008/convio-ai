import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { AppError } from '../../plugins/error.js'
import { z } from 'zod'

const MAX_ORG_PRESETS = 5

const createSchema = z.object({
  url: z.string().url(),
  name: z.string().min(1).max(100),
  category: z.string().max(50).default('custom'),
})

export default async function avatarPresetsRoutes(fastify: FastifyInstance) {
  fastify.get('/organizations/:orgId/avatar-presets', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    await fastify.getMembership(request.userId!, orgId)

    const presets = await prisma.avatarPreset.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, url: true, name: true, category: true },
    })

    return { data: presets }
  })

  fastify.post('/organizations/:orgId/avatar-presets', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    await fastify.getMembership(request.userId!, orgId)

    const count = await prisma.avatarPreset.count({ where: { organizationId: orgId } })
    if (count >= MAX_ORG_PRESETS) {
      throw new AppError(400, `Maximum ${MAX_ORG_PRESETS} avatars allowed. Delete one to add another.`)
    }

    const { url, name, category } = createSchema.parse(request.body)

    const preset = await prisma.avatarPreset.create({
      data: { organizationId: orgId, url, name, category },
    })

    return { data: { id: preset.id, url: preset.url, name: preset.name, category: preset.category } }
  })

  fastify.delete('/organizations/:orgId/avatar-presets/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { orgId, id } = request.params as { orgId: string; id: string }
    const membership = await fastify.getMembership(request.userId!, orgId)
    if (membership.role !== 'owner') {
      throw new AppError(403, 'Only owners can delete avatar presets')
    }

    await prisma.avatarPreset.delete({ where: { id, organizationId: orgId } })
    reply.code(204).send()
  })
}

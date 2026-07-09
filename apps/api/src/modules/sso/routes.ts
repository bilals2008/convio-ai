import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { updateSsoConfigSchema } from '@convio/validation'
import { AppError } from '../../plugins/error.js'
import { z } from 'zod'

const orgParamsSchema = z.object({
  orgId: z.string().uuid(),
})

export default async function ssoRoutes(fastify: FastifyInstance) {
  fastify.get('/organizations/:orgId/sso', {
    preHandler: [fastify.authenticate, fastify.requireMembership],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }

    let config = await prisma.ssoConfig.findUnique({
      where: { organizationId: orgId },
    })

    if (!config) {
      config = await prisma.ssoConfig.create({
        data: { organizationId: orgId },
      })
    }

    return { data: config }
  })

  fastify.patch('/organizations/:orgId/sso', {
    preHandler: [
      fastify.authenticate,
      fastify.requireAdmin,
      validate({ params: orgParamsSchema, body: updateSsoConfigSchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const body = request.body as Record<string, unknown>

    const config = await prisma.ssoConfig.upsert({
      where: { organizationId: orgId },
      update: body,
      create: { organizationId: orgId, ...body },
    })

    await fastify.auditLog({
      organizationId: orgId,
      actorId: request.userId,
      action: body.enabled ? 'sso.configured' : 'sso.disabled',
      entityType: 'sso_config',
      entityId: config.id,
      metadata: { provider: config.provider },
    })

    return { data: config }
  })
}

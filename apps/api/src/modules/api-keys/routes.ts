import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { AppError } from '../../plugins/error.js'
import { z } from 'zod'
import crypto from 'crypto'

const orgParamsSchema = z.object({
  orgId: z.string().uuid(),
})

const keyParamsSchema = z.object({
  orgId: z.string().uuid(),
  keyId: z.string().uuid(),
})

const createBodySchema = z.object({
  name: z.string().min(1).max(100),
})

function maskKey(key: string) {
  return 'x' + key.slice(-4)
}

function generateApiKey() {
  return crypto.randomUUID().replace(/-/g, '')
}

export default async function apiKeysRoutes(fastify: FastifyInstance) {
  fastify.get('/organizations/:orgId/api-keys', {
    preHandler: [fastify.authenticate, validate({ params: orgParamsSchema })],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    await fastify.getMembership(request.userId!, orgId)

    const keys = await prisma.apiKey.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        keyPreview: true,
        lastUsedAt: true,
        createdAt: true,
      },
    })

    return { data: keys }
  })

  fastify.post('/organizations/:orgId/api-keys', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema, body: createBodySchema }),
      async (request) => {
        const { orgId } = request.params as { orgId: string }
        await fastify.ensureAdmin(request.userId!, orgId)
      },
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { name } = request.body as { name: string }

    const key = generateApiKey()
    const keyPreview = maskKey(key)

    const apiKey = await prisma.apiKey.create({
      data: {
        organizationId: orgId,
        name,
        key,
        keyPreview,
      },
    })

    return {
      data: {
        id: apiKey.id,
        name: apiKey.name,
        key,
        keyPreview: apiKey.keyPreview,
        createdAt: apiKey.createdAt,
      },
    }
  })

  fastify.delete('/organizations/:orgId/api-keys/:keyId', {
    preHandler: [
      fastify.authenticate,
      validate({ params: keyParamsSchema }),
      async (request) => {
        const { orgId } = request.params as { orgId: string }
        await fastify.ensureAdmin(request.userId!, orgId)
      },
    ],
  }, async (request, reply) => {
    const { orgId, keyId } = request.params as { orgId: string; keyId: string }

    const existing = await prisma.apiKey.findUnique({ where: { id: keyId } })
    if (!existing || existing.organizationId !== orgId) {
      throw new AppError(404, 'API key not found')
    }

    await prisma.apiKey.delete({ where: { id: keyId } })
    reply.code(204).send()
  })
}

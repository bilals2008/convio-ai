import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { AppError } from '../../plugins/error.js'
import { z } from 'zod'

const SUPPORTED_PROVIDERS = ['openai', 'anthropic', 'google', 'groq', 'kie', 'openrouter', 'mistral', 'together', 'deepseek', 'perplexity', 'opencode']

const createKeySchema = z.object({
  provider: z.enum(SUPPORTED_PROVIDERS as [string, ...string[]]),
  apiKey: z.string().min(1),
  label: z.string().max(100).optional(),
})

const updateKeySchema = z.object({
  apiKey: z.string().min(1).optional(),
  label: z.string().max(100).optional(),
})

function maskKey(key: string): string {
  return key.length > 8 ? `sk-...${key.slice(-4)}` : `...${key.slice(-4)}`
}

export default async function providerKeysRoutes(fastify: FastifyInstance) {
  fastify.get('/organizations/:orgId/provider-keys', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    await fastify.getMembership(request.userId!, orgId)

    const keys = await prisma.providerKey.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        provider: true,
        keyPreview: true,
        label: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { provider: 'asc' },
    })

    return { data: keys }
  })

  fastify.post('/organizations/:orgId/provider-keys', {
    preHandler: [fastify.authenticate, async (request) => {
      const { orgId } = request.params as { orgId: string }
      await fastify.ensureAdmin(request.userId!, orgId)
    }],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { provider, apiKey, label } = createKeySchema.parse(request.body)

    const existing = await prisma.providerKey.findUnique({
      where: { organizationId_provider: { organizationId: orgId, provider } },
    })
    if (existing) {
      throw new AppError(409, `A key for ${provider} already exists. Update it instead.`)
    }

    const key = await prisma.providerKey.create({
      data: {
        organizationId: orgId,
        provider,
        apiKey,
        keyPreview: maskKey(apiKey),
        label,
      },
    })

    return { data: { id: key.id, provider: key.provider, keyPreview: key.keyPreview, label: key.label, createdAt: key.createdAt } }
  })

  fastify.patch('/organizations/:orgId/provider-keys/:keyId', {
    preHandler: [fastify.authenticate, async (request) => {
      const { orgId } = request.params as { orgId: string }
      await fastify.ensureAdmin(request.userId!, orgId)
    }],
  }, async (request) => {
    const { orgId, keyId } = request.params as { orgId: string; keyId: string }
    const { apiKey, label } = updateKeySchema.parse(request.body)

    const existing = await prisma.providerKey.findFirst({
      where: { id: keyId, organizationId: orgId },
    })
    if (!existing) throw new AppError(404, 'Provider key not found')

    const data: Record<string, string> = {}
    if (apiKey) {
      data.apiKey = apiKey
      data.keyPreview = maskKey(apiKey)
    }
    if (label) data.label = label

    const updated = await prisma.providerKey.update({
      where: { id: keyId },
      data,
      select: { id: true, provider: true, keyPreview: true, label: true, updatedAt: true },
    })

    return { data: updated }
  })

  fastify.delete('/organizations/:orgId/provider-keys/:keyId', {
    preHandler: [fastify.authenticate, async (request) => {
      const { orgId } = request.params as { orgId: string }
      await fastify.ensureAdmin(request.userId!, orgId)
    }],
  }, async (request, reply) => {
    const { orgId, keyId } = request.params as { orgId: string; keyId: string }

    const existing = await prisma.providerKey.findFirst({
      where: { id: keyId, organizationId: orgId },
    })
    if (!existing) throw new AppError(404, 'Provider key not found')

    await prisma.providerKey.delete({ where: { id: keyId } })
    reply.code(204).send()
  })
}

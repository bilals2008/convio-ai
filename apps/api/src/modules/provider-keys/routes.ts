import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { AppError } from '../../plugins/error.js'
import { emitDomainEvent, NOTIFICATION_EVENTS } from '../../services/notifications/events.js'
import { encryptSecret, decryptSecret, getEncryptionKey } from '../../services/encryption.js'
import { z } from 'zod'

const SUPPORTED_PROVIDERS = ['openai', 'anthropic', 'google', 'groq', 'openrouter', 'mistral', 'together', 'deepseek', 'perplexity', 'opencode']

// Models-list endpoints used to validate a stored key. 404 = endpoint unknown,
// reported as "cannot verify" instead of a hard failure. ponytail: single fetch per provider,
// expand the map if a provider's models endpoint moves.
const TEST_ENDPOINTS: Record<string, string> = {
  openai: 'https://api.openai.com/v1/models',
  anthropic: 'https://api.anthropic.com/v1/models',
  google: 'https://generativelanguage.googleapis.com/v1beta/models',
  groq: 'https://api.groq.com/openai/v1/models',
  openrouter: 'https://openrouter.ai/api/v1/models',
  mistral: 'https://api.mistral.ai/v1/models',
  together: 'https://api.together.xyz/v1/models',
  deepseek: 'https://api.deepseek.com/v1/models',
  perplexity: 'https://api.perplexity.ai/models',
  opencode: 'https://opencode.ai/zen/v1/models',
}

// Validates a stored key against the provider's models-list endpoint (no cost, no generation).
// Handles the three auth styles used across providers. Returns a result object, never throws,
// so a down provider is reported gracefully instead of bubbling up a 500.
async function testProviderKey(provider: string, apiKey: string) {
  const url = TEST_ENDPOINTS[provider]
  if (!url) return { ok: false, message: `No automatic test available for ${provider}` }

  let headers: Record<string, string> = {}
  let target = url
  if (provider === 'google') {
    target = `${url}?key=${encodeURIComponent(apiKey)}`
  } else if (provider === 'anthropic') {
    headers = { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }
  } else {
    headers = { Authorization: `Bearer ${apiKey}` }
  }

  try {
    const res = await fetch(target, { headers, signal: AbortSignal.timeout(10000) })
    if (res.ok) return { ok: true, message: 'Key is valid' }
    if (res.status === 404) return { ok: false, message: 'Cannot verify automatically for this provider' }
    return { ok: false, message: `Provider rejected the key (HTTP ${res.status})` }
  } catch {
    return { ok: false, message: 'Provider unreachable. Try again.' }
  }
}

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
    preHandler: [fastify.authenticate, fastify.requireMembership],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }

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
    preHandler: [fastify.authenticate, fastify.requireAdmin],
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
        apiKey: encryptSecret(apiKey, getEncryptionKey()),
        keyPreview: maskKey(apiKey),
        label,
      },
    })

    emitDomainEvent(NOTIFICATION_EVENTS.API_KEY_GENERATED, {
      organizationId: orgId,
      userId: request.userId,
      entityName: provider,
    })

    return { data: { id: key.id, provider: key.provider, keyPreview: key.keyPreview, label: key.label, createdAt: key.createdAt } }
  })

  fastify.patch('/organizations/:orgId/provider-keys/:keyId', {
    preHandler: [fastify.authenticate, fastify.requireAdmin],
  }, async (request) => {
    const { orgId, keyId } = request.params as { orgId: string; keyId: string }
    const { apiKey, label } = updateKeySchema.parse(request.body)

    const existing = await prisma.providerKey.findFirst({
      where: { id: keyId, organizationId: orgId },
    })
    if (!existing) throw new AppError(404, 'Provider key not found')

    const data: Record<string, string> = {}
    if (apiKey) {
      data.apiKey = encryptSecret(apiKey, getEncryptionKey())
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

  // Test button in Settings → Provider Keys: verifies the stored key is accepted.
  fastify.post('/organizations/:orgId/provider-keys/:keyId/test', {
    preHandler: [fastify.authenticate, fastify.requireAdmin],
  }, async (request) => {
    const { orgId, keyId } = request.params as { orgId: string; keyId: string }

    const existing = await prisma.providerKey.findFirst({
      where: { id: keyId, organizationId: orgId },
    })
    if (!existing) throw new AppError(404, 'Provider key not found')

    return { data: await testProviderKey(existing.provider, decryptSecret(existing.apiKey, getEncryptionKey())) }
  })

  fastify.delete('/organizations/:orgId/provider-keys/:keyId', {
    preHandler: [fastify.authenticate, fastify.requireAdmin],
  }, async (request, reply) => {
    const { orgId, keyId } = request.params as { orgId: string; keyId: string }

    const existing = await prisma.providerKey.findFirst({
      where: { id: keyId, organizationId: orgId },
    })
    if (!existing) throw new AppError(404, 'Provider key not found')

    await prisma.providerKey.delete({ where: { id: keyId } })

    emitDomainEvent(NOTIFICATION_EVENTS.API_KEY_REVOKED, {
      organizationId: orgId,
      userId: request.userId,
      entityName: existing.provider,
    })

    reply.code(204).send()
  })
}

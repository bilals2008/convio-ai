import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { createComposioConfigSchema, updateComposioConfigSchema } from '@convio/validation'
import { AppError } from '../../plugins/error.js'
import { z } from 'zod'
import { decryptSecret, getEncryptionKey, encryptSecret } from '../../services/encryption.js'
import { createComposioClient, getOrCreateSession, getToolkitConnectLink } from '../../services/composio/index.js'
import { getOrgPlan } from '../../services/billing.js'

/**
 * Validate an API key with a cheap, real Composio call.
 * Throws AppError(401) on invalid keys — surfacing the problem at save time
 * instead of failing later at connect/execution time with a confusing 502.
 */
async function assertValidApiKey(apiKey: string) {
  try {
    const client = createComposioClient(apiKey)
    await client.toolkits.get('github')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (/401|invalid api key|APIKey_InvalidAPIKey/i.test(message)) {
      throw new AppError(401, 'Invalid Composio API key. Get a fresh key from dashboard.composio.dev → Settings → API Keys.', 'INVALID_API_KEY')
    }
    // Network/other failures: don't block saving, the key may still be valid.
    console.warn(`[composio] API key validation could not complete: ${message}`)
  }
}

const orgParamsSchema = z.object({
  orgId: z.string().uuid(),
})

const connectToolkitSchema = z.object({
  toolkit: z.string().min(1).max(64),
})

// Curated catalog shown in the UI. The SDK can list 1000+ toolkits, but the
// settings grid works best with a meaningful, stable set.
const COMMON_TOOLKITS = [
  'github', 'slack', 'gmail', 'googlecalendar', 'notion', 'linear',
  'stripe', 'jira', 'trello', 'asana', 'airtable', 'hubspot',
  'salesforce', 'zendesk', 'intercom', 'sendgrid', 'twilio', 'discord',
  'telegram', 'whatsapp', 'linkedin', 'twitter', 'youtube', 'reddit',
  'figma', 'zoom', 'calendly', 'typeform', 'docusign', 'shopify',
  'quickbooks', 'xero', 'aws', 'azure', 'gcp', 'vercel',
  'netlify', 'cloudflare', 'sentry', 'datadog', 'pagerduty', 'gitlab',
]

export default async function composioRoutes(fastify: FastifyInstance) {
  // GET /api/organizations/:orgId/composio — Get Composio config
  fastify.get('/organizations/:orgId/composio', {
    preHandler: [
      fastify.authenticate,
      fastify.requireMembership,
      validate({ params: orgParamsSchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }

    await fastify.ensureAdmin(request.userId!, orgId)

    const config = await prisma.composioConfig.findUnique({
      where: { organizationId: orgId },
    })

    if (!config) {
      return { data: null }
    }

    // Don't return the encrypted API key
    const { apiKey: _apiKey, composioSessionId: _sessionId, ...safeConfig } = config
    return { data: { ...safeConfig, hasApiKey: true } }
  })

  // POST /api/organizations/:orgId/composio — Create/update Composio config
  fastify.post('/organizations/:orgId/composio', {
    preHandler: [
      fastify.authenticate,
      fastify.requireMembership,
      validate({ params: orgParamsSchema, body: createComposioConfigSchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { apiKey, enabledToolkits } = request.body as { apiKey: string; enabledToolkits: string[] }

    await fastify.ensureAdmin(request.userId!, orgId)

    // Validate the key against Composio before storing it — fail fast with a
    // clear 401 instead of a generic 502 when the user later connects a toolkit.
    await assertValidApiKey(apiKey)

    const encryptionKey = getEncryptionKey()
    const encryptedApiKey = encryptSecret(apiKey, encryptionKey)

    const config = await prisma.composioConfig.upsert({
      where: { organizationId: orgId },
      create: {
        organizationId: orgId,
        apiKey: encryptedApiKey,
        enabledToolkits: enabledToolkits || [],
      },
      update: {
        apiKey: encryptedApiKey,
        enabledToolkits: enabledToolkits || [],
        composioSessionId: null, // Reset session when config changes
      },
    })

    const { apiKey: _apiKey, composioSessionId: _sessionId, ...safeConfig } = config
    return { data: { ...safeConfig, hasApiKey: true } }
  })

  // PATCH /api/organizations/:orgId/composio — Update Composio config (partial)
  fastify.patch('/organizations/:orgId/composio', {
    preHandler: [
      fastify.authenticate,
      fastify.requireMembership,
      validate({ params: orgParamsSchema, body: updateComposioConfigSchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { apiKey, enabledToolkits } = request.body as { apiKey?: string; enabledToolkits?: string[] }

    await fastify.ensureAdmin(request.userId!, orgId)

    const updateData: Record<string, unknown> = {}
    if (apiKey) {
      const encryptionKey = getEncryptionKey()
      updateData.apiKey = encryptSecret(apiKey, encryptionKey)
      updateData.composioSessionId = null // Reset session when API key changes
      await assertValidApiKey(apiKey)
    }
    if (enabledToolkits !== undefined) {
      updateData.enabledToolkits = enabledToolkits
      updateData.composioSessionId = null // Reset session when toolkits change
    }

    const config = await prisma.composioConfig.update({
      where: { organizationId: orgId },
      data: updateData,
    })

    const { apiKey: _apiKey, composioSessionId: _sessionId, ...safeConfig } = config
    return { data: { ...safeConfig, hasApiKey: !!config.apiKey } }
  })

  // DELETE /api/organizations/:orgId/composio — Delete Composio config
  fastify.delete('/organizations/:orgId/composio', {
    preHandler: [
      fastify.authenticate,
      fastify.requireMembership,
      validate({ params: orgParamsSchema }),
    ],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string }

    await fastify.ensureAdmin(request.userId!, orgId)

    await prisma.composioConfig.delete({
      where: { organizationId: orgId },
    })

    reply.code(204).send()
  })

  // GET /api/organizations/:orgId/composio/toolkits — List toolkits with connection status
  fastify.get('/organizations/:orgId/composio/toolkits', {
    preHandler: [
      fastify.authenticate,
      fastify.requireMembership,
      validate({ params: orgParamsSchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }

    await fastify.getMembership(request.userId!, orgId)

    const config = await prisma.composioConfig.findUnique({
      where: { organizationId: orgId },
    })

    const enabledSet = new Set(config?.enabledToolkits ?? [])

    if (!config?.apiKey) {
      return { data: COMMON_TOOLKITS.map((slug) => ({ slug, enabled: false, connected: false })) }
    }

    const encryptionKey = getEncryptionKey()
    const apiKey = decryptSecret(config.apiKey, encryptionKey)

    try {
      const client = createComposioClient(apiKey)
      // Fresh connected-account lookup — NOT session.toolkits(), which reads a
      // cached session view that stays stale right after a new connection.
      const accounts = await client.connectedAccounts.list({ userIds: [orgId] })
      const connectedSlugs = new Set(
        (accounts.items ?? [])
          .filter((a) => a.status === 'ACTIVE')
          .map((a) => (a as { toolkit?: { slug?: string } }).toolkit?.slug)
          .filter((s): s is string => !!s),
      )

      return {
        data: COMMON_TOOLKITS.map((slug) => ({
          slug,
          enabled: enabledSet.has(slug),
          connected: connectedSlugs.has(slug),
        })),
      }
    } catch (error) {
      console.warn(`[composio] Failed to load toolkit connections: ${(error as Error).message}`)
      return { data: COMMON_TOOLKITS.map((slug) => ({ slug, enabled: enabledSet.has(slug), connected: false })) }
    }
  })

  // POST /api/organizations/:orgId/composio/connect — Start toolkit connection
  // Returns a real Connect Link (hosted OAuth page) from session.authorize().
  fastify.post('/organizations/:orgId/composio/connect', {
    preHandler: [
      fastify.authenticate,
      fastify.requireMembership,
      validate({ params: orgParamsSchema, body: connectToolkitSchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { toolkit } = request.body as { toolkit: string }

    await fastify.ensureAdmin(request.userId!, orgId)

    const planName = await getOrgPlan(orgId).then((p) => p.name).catch(() => null)
    if (planName === null || planName === 'free') {
      throw new AppError(402, 'Composio integrations are a Pro feature. Upgrade your plan to connect apps.', 'PLAN_LIMIT_EXCEEDED')
    }

    const config = await prisma.composioConfig.findUnique({
      where: { organizationId: orgId },
    })

    if (!config?.apiKey) {
      throw new AppError(400, 'Composio is not configured for this organization')
    }

    const encryptionKey = getEncryptionKey()
    const apiKey = decryptSecret(config.apiKey, encryptionKey)

    try {
      const client = createComposioClient(apiKey)
      const session = await getOrCreateSession(client, orgId, config.enabledToolkits ?? [], config.composioSessionId ?? undefined)

      if (session.sessionId !== config.composioSessionId) {
        await prisma.composioConfig.update({
          where: { organizationId: orgId },
          data: { composioSessionId: session.sessionId },
        }).catch(() => {})
      }

      const connectUrl = await getToolkitConnectLink(session, toolkit)
      if (!connectUrl) {
        throw new AppError(502, 'Composio did not return a connect link for this toolkit')
      }

      return { data: { toolkit, connectUrl } }
    } catch (error) {
      if (error instanceof AppError) throw error
      const message = error instanceof Error ? error.message : String(error)
      // Invalid/revoked keys stored earlier surface here — return a clear 401
      // so the UI tells the user to fix the key instead of a mystery 502.
      if (/401|invalid api key|APIKey_InvalidAPIKey/i.test(message)) {
        throw new AppError(401, 'Your stored Composio API key is invalid or was revoked. Update it in Settings → Composio.', 'INVALID_API_KEY')
      }
      throw new AppError(502, `Failed to start toolkit connection: ${message}`)
    }
  })
}

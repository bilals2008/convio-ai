import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { checkContent, type ModerationRules } from '../../services/moderation.js'
import { z } from 'zod'

const orgParamsSchema = z.object({
  orgId: z.string().uuid(),
})

const customRuleSchema = z.object({
  name: z.string().min(1).max(100),
  pattern: z.string().min(1).max(500),
  isRegex: z.boolean().optional().default(false),
  severity: z.enum(['low', 'medium', 'high']).optional().default('medium'),
})

const updateModerationSchema = z.object({
  enabled: z.boolean().optional(),
  profanityEnabled: z.boolean().optional(),
  piiEnabled: z.boolean().optional(),
  injectionEnabled: z.boolean().optional(),
  blockOnViolation: z.boolean().optional(),
  customRules: z.array(customRuleSchema).max(100).optional(),
})

const testModerationSchema = z.object({
  text: z.string().min(1).max(10000),
})

// The default config returned when an org has not configured moderation yet.
function defaultConfig(organizationId: string) {
  return {
    organizationId,
    enabled: false,
    profanityEnabled: true,
    piiEnabled: true,
    injectionEnabled: true,
    blockOnViolation: true,
    customRules: [] as unknown[],
  }
}

// Build the ModerationRules payload the service expects from a stored config row.
export function toRules(config: {
  enabled: boolean
  profanityEnabled: boolean
  piiEnabled: boolean
  injectionEnabled: boolean
  customRules: unknown
}): ModerationRules {
  return {
    enabled: config.enabled,
    profanityEnabled: config.profanityEnabled,
    piiEnabled: config.piiEnabled,
    injectionEnabled: config.injectionEnabled,
    customRules: Array.isArray(config.customRules) ? (config.customRules as unknown as ModerationRules['customRules']) : [],
  }
}

export default async function moderationRoutes(fastify: FastifyInstance) {
  // GET /api/organizations/:orgId/moderation — Get moderation config (member only)
  fastify.get('/organizations/:orgId/moderation', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }

    await fastify.getMembership(request.userId!, orgId)

    const config = await prisma.moderationConfig.findUnique({
      where: { organizationId: orgId },
    })

    return { data: config ?? defaultConfig(orgId) }
  })

  // PATCH /api/organizations/:orgId/moderation — Update moderation config (admin only)
  fastify.patch('/organizations/:orgId/moderation', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema, body: updateModerationSchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }

    await fastify.ensureAdmin(request.userId!, orgId)

    const body = request.body as z.infer<typeof updateModerationSchema>
    const { customRules, ...rest } = body
    const data = {
      ...rest,
      ...(customRules !== undefined ? { customRules: customRules as any } : {}),
    }

    const config = await prisma.moderationConfig.upsert({
      where: { organizationId: orgId },
      update: data,
      create: { organizationId: orgId, ...data },
    })

    await fastify.auditLog({
      organizationId: orgId,
      actorId: request.userId,
      action: 'moderation.updated',
      entityType: 'moderation_config',
      entityId: config.id,
      metadata: { enabled: config.enabled },
    })

    return { data: config }
  })

  // POST /api/organizations/:orgId/moderation/test — Test text against the rules (member only)
  fastify.post('/organizations/:orgId/moderation/test', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema, body: testModerationSchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { text } = request.body as z.infer<typeof testModerationSchema>

    await fastify.getMembership(request.userId!, orgId)

    const config = await prisma.moderationConfig.findUnique({
      where: { organizationId: orgId },
    })

    // For testing, run the checks even if moderation is globally disabled so
    // admins can preview results. We force enabled=true on the evaluated rules.
    const rules: ModerationRules = config
      ? { ...toRules(config), enabled: true }
      : { enabled: true }

    const result = checkContent(text, rules)

    return { data: result }
  })
}

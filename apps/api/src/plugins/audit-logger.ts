import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'
import { prisma, type Prisma } from '@convio/database'

export type AuditAction =
  | 'member.invited' | 'member.removed' | 'member.role_changed'
  | 'organization.created' | 'organization.updated' | 'organization.deleted'
  | 'agent.created' | 'agent.updated' | 'agent.deleted'
  | 'knowledge.created' | 'knowledge.updated' | 'knowledge.deleted'
  | 'api_key.created' | 'api_key.deleted'
  | 'provider_key.created' | 'provider_key.updated' | 'provider_key.deleted'
  | 'sso.configured' | 'sso.disabled'
  | 'moderation.updated' | 'moderation.violation'
  | 'mcp_server.created' | 'mcp_server.updated' | 'mcp_server.deleted'
  | 'mcp_oauth.connected' | 'mcp_oauth.disconnected' | 'mcp_oauth.failed'

declare module 'fastify' {
  interface FastifyInstance {
    auditLog: (params: {
      organizationId: string
      actorId?: string
      action: AuditAction
      entityType: string
      entityId?: string
      metadata?: Record<string, unknown>
    }) => Promise<void>
  }
}

export default fp(async function auditLoggerPlugin(fastify: FastifyInstance) {
  fastify.decorate('auditLog', async (params: {
    organizationId: string
    actorId?: string
    action: AuditAction
    entityType: string
    entityId?: string
    metadata?: Record<string, unknown>
  }) => {
    await prisma.auditLog.create({
      data: {
        organizationId: params.organizationId,
        actorId: params.actorId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
      },
    })
  })
}, {
  name: 'audit-logger',
  dependencies: ['auth'],
})

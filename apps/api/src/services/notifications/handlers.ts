import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { getTemplate, type RecipientKind } from './templates.js'
import type { NotificationEventPayload, NotificationEventType } from './events.js'

async function resolveRecipients(fastify: FastifyInstance, kinds: RecipientKind[], payload: NotificationEventPayload): Promise<string[]> {
  const recipients = new Set<string>()
  const add = (id?: string | null) => {
    if (id) recipients.add(id)
  }

  for (const kind of kinds) {
    if (kind === 'actor') add(payload.actorId)
    if (kind === 'target') add(payload.userId)
    if (kind === 'org_admins' || kind === 'org_members') {
      if (!payload.organizationId) continue
      const roles = kind === 'org_admins' ? ['owner', 'admin'] : undefined
      const members = await prisma.membership.findMany({
        where: { organizationId: payload.organizationId, ...(roles ? { role: { in: roles as Array<'owner' | 'admin'> } } : {}) },
        select: { userId: true },
      })
      for (const m of members) add(m.userId)
    }
  }
  return [...recipients]
}

export async function handleNotificationEvent(
  fastify: FastifyInstance,
  event: NotificationEventType,
  payload: NotificationEventPayload
): Promise<void> {
  const template = getTemplate(event)
  if (!template) return

  const recipientIds = await resolveRecipients(fastify, template.recipients, payload)
  if (recipientIds.length === 0) return

  const metadata = {
    ...(payload.metadata ?? {}),
    ...(payload.entityId ? { entityId: payload.entityId } : {}),
    ...(payload.entityName ? { entityName: payload.entityName } : {}),
  }

  await fastify.notifications.createMany(
    recipientIds.map((userId) => ({
      userId,
      organizationId: payload.organizationId,
      type: event,
      category: template.category,
      priority: template.priority,
      title: template.title(payload),
      message: template.message?.(payload),
      actionUrl: template.actionUrl?.(payload),
      metadata,
    }))
  )
}

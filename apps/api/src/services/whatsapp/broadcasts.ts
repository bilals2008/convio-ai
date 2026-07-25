import { prisma } from '@convio/database'
import { sendTemplate } from './client.js'

export async function createBroadcast(data: {
  organizationId: string
  agentId: string
  name: string
  templateName: string
  templateLanguage?: string
  templateParams?: Record<string, string>[]
  contactFilter?: Record<string, unknown>
  scheduleCron?: string
  scheduleAt?: string
}) {
  return prisma.broadcast.create({
    data: {
      organizationId: data.organizationId,
      agentId: data.agentId,
      name: data.name,
      templateName: data.templateName,
      templateLanguage: data.templateLanguage || 'en_US',
      templateParams: (data.templateParams || []) as any,
      contactFilter: (data.contactFilter || null) as any,
      scheduleCron: data.scheduleCron || null,
      scheduleAt: data.scheduleAt ? new Date(data.scheduleAt) : null,
      status: data.scheduleCron || data.scheduleAt ? 'scheduled' : 'draft',
    },
  })
}

export async function executeBroadcast(broadcastId: string): Promise<{ sent: number; failed: number }> {
  const broadcast = await prisma.broadcast.findUnique({
    where: { id: broadcastId },
    include: { agent: { include: { deployments: { where: { channel: 'whatsapp', status: 'active' } } } } },
  })
  if (!broadcast || broadcast.status === 'executed') return { sent: 0, failed: 0 }

  const deployment = broadcast.agent.deployments[0]
  if (!deployment) return { sent: 0, failed: 0 }

  const config = deployment.config as Record<string, unknown>
  const phoneNumberId = config.phoneNumberId as string
  if (!phoneNumberId) return { sent: 0, failed: 0 }

  // ponytail: simple contact query, add advanced filtering when needed
  const conversations = await prisma.conversation.findMany({
    where: {
      agentId: broadcast.agentId,
      channel: 'whatsapp',
      optInStatus: 'opted_in',
      ...(broadcast.contactFilter as any || {}),
    },
    select: { contactPhone: true },
  })

  let sent = 0
  let failed = 0

  // ponytail: sequential sends, parallelize with rate limiting when throughput matters
  for (const conv of conversations) {
    if (!conv.contactPhone) continue
    try {
      await sendTemplate(phoneNumberId, conv.contactPhone, {
        name: broadcast.templateName,
        language: { code: broadcast.templateLanguage },
        ...((broadcast.templateParams as Record<string, unknown>[]).length > 0
          ? { components: [{ type: 'body', parameters: broadcast.templateParams as any }] }
          : {}),
      })
      sent++
    } catch {
      failed++
    }
  }

  await prisma.broadcast.update({
    where: { id: broadcastId },
    data: { status: 'executed', executedAt: new Date(), sentCount: sent, failCount: failed },
  })

  return { sent, failed }
}

export async function processScheduledBroadcasts(): Promise<void> {
  // ponytail: check every minute for due or cron broadcasts
  const due = await prisma.broadcast.findMany({
    where: {
      status: 'scheduled',
      OR: [
        { scheduleAt: { lte: new Date() } },
        { scheduleCron: { not: null } },
      ],
    },
  })

  for (const b of due) {
    if (b.scheduleAt && new Date(b.scheduleAt) <= new Date()) {
      await executeBroadcast(b.id)
      // ponytail: per-broadcast cron eval skipped, add when recurring broadcasts needed
    }
  }
}

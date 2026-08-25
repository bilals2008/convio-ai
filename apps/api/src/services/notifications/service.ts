import { randomUUID } from 'crypto'
import type { FastifyInstance } from 'fastify'
import {
  prisma,
  NotificationCategory,
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationPriority,
  NotificationStatus,
  type Prisma,
} from '@convio/database'

export interface CreateNotificationInput {
  userId: string
  organizationId?: string
  type: string
  category: NotificationCategory
  priority: NotificationPriority
  title: string
  message?: string
  actionUrl?: string
  metadata?: Record<string, unknown>
  dedupeKey?: string
  expiresAt?: Date
  sendEmail?: boolean
}

export interface QuietHours {
  start?: string
  end?: string
}

export interface NotificationPrefLike {
  emailEnabled: boolean
  muteAll: boolean
  quietHours: QuietHours | null
  categorySettings: Record<string, { email?: boolean } | undefined>
}

export function isInQuietHours(qh: QuietHours | null | undefined, now: Date): boolean {
  if (!qh?.start || !qh?.end) return false
  const [sh, sm] = qh.start.split(':').map(Number)
  const [eh, em] = qh.end.split(':').map(Number)
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return false
  const minutes = now.getHours() * 60 + now.getMinutes()
  const start = sh * 60 + sm
  const end = eh * 60 + em
  if (start === end) return false
  if (start < end) return minutes >= start && minutes < end
  return minutes >= start || minutes < end
}

export function shouldSendEmail(
  pref: NotificationPrefLike | null | undefined,
  category: NotificationCategory,
  priority: NotificationPriority,
  now: Date,
  override = false
): boolean {
  if (!pref) return false
  if (pref.muteAll || !pref.emailEnabled) return false
  if (pref.categorySettings?.[category]?.email === false) return false
  if (!override && priority !== NotificationPriority.high && priority !== NotificationPriority.critical) return false
  if (priority !== NotificationPriority.critical && isInQuietHours(pref.quietHours, now)) return false
  return true
}

export interface ListNotificationsOptions {
  orgId?: string
  status?: NotificationStatus
  category?: NotificationCategory
  priority?: NotificationPriority
  search?: string
  cursor?: string
  limit?: number
}

const NOTIFICATION_SELECT = {
  id: true,
  userId: true,
  title: true,
  message: true,
  type: true,
  category: true,
  priority: true,
  status: true,
  metadata: true,
  actionUrl: true,
  createdAt: true,
  readAt: true,
  archivedAt: true,
} as const

const notExpired = (): Prisma.NotificationWhereInput => ({
  OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
})

export class NotificationService {
  private readonly fastify: FastifyInstance

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify
  }

  // --- creation -----------------------------------------------------------

  async createMany(inputs: CreateNotificationInput[]): Promise<number> {
    if (inputs.length === 0) return 0
    const userIds = [...new Set(inputs.map((i) => i.userId))]
    const prefs = await this.loadPrefs(userIds)
    const now = new Date()

    // ponytail: publish/email straight from in-memory rows — skips a re-fetch
    // query. A dedupe-collision row could ping SSE without persisting; dedupeKey
    // is unused by handlers today, so collisions don't happen.
    const rows: Array<{ row: Prisma.NotificationCreateManyInput; input: CreateNotificationInput }> = []
    for (const input of inputs) {
      const pref = prefs.get(input.userId) ?? null
      if (pref?.muteAll) continue
      if (pref && !pref.inAppEnabled) continue
      const row: Prisma.NotificationCreateManyInput = {
        id: randomUUID(),
        userId: input.userId,
        organizationId: input.organizationId ?? null,
        type: input.type,
        category: input.category,
        priority: input.priority,
        title: input.title,
        message: input.message ?? null,
        metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        actionUrl: input.actionUrl ?? null,
        dedupeKey: input.dedupeKey ?? null,
        expiresAt: input.expiresAt ?? null,
      }
      rows.push({ row, input })
    }

    if (rows.length === 0) return 0
    const created = await prisma.notification.createMany({
      data: rows.map((r) => r.row),
      skipDuplicates: true,
    })

    const hub = this.fastify.notificationsRealtime
    if (hub.clientCount() > 0) {
      for (const { row, input } of rows) {
        hub.publish(row.userId, {
          id: row.id!,
          type: row.type,
          category: input.category,
          priority: input.priority,
          title: row.title,
          message: row.message,
          actionUrl: row.actionUrl,
          metadata: (row.metadata ?? null) as Record<string, unknown> | null,
          createdAt: now.toISOString(),
        })
      }
    }

    await this.queueEmailDeliveries(rows, prefs)
    return created.count
  }

  private async queueEmailDeliveries(
    rows: Array<{ row: Prisma.NotificationCreateManyInput; input: CreateNotificationInput }>,
    prefs: Map<string, Awaited<ReturnType<NotificationService['getPreferences']>> | null>
  ) {
    const now = new Date()
    const targets = rows.filter(({ row, input }) => {
      const pref = prefs.get(String(row.userId)) ?? null
      return shouldSendEmail(
        pref as unknown as NotificationPrefLike | null,
        row.category as NotificationCategory,
        row.priority as NotificationPriority,
        now,
        input.sendEmail
      )
    })
    if (targets.length === 0) return

    const profiles = await prisma.profile.findMany({
      where: { id: { in: [...new Set(targets.map((t) => String(t.row.userId)))] } },
      select: { id: true, email: true },
    })
    const emailMap = new Map(profiles.map((p) => [p.id, p.email]))

    const deliveries = targets.map(({ row }) => ({
      id: randomUUID(),
      notificationId: String(row.id),
      channel: NotificationChannel.email,
      status: NotificationDeliveryStatus.pending,
    }))
    await prisma.notificationDelivery.createMany({ data: deliveries })

    for (let i = 0; i < targets.length; i++) {
      const to = emailMap.get(String(targets[i].row.userId))
      if (!to) continue
      void this.sendEmail(deliveries[i].id, {
        to,
        subject: `[Convio] ${targets[i].row.title}`,
        html: renderEmailHtml(targets[i].row.title, targets[i].row.message ?? null, targets[i].row.actionUrl ?? null),
      })
    }
  }

  private async sendEmail(deliveryId: string, { to, subject, html }: { to: string; subject: string; html: string }) {
    const email = (this.fastify as unknown as { email?: { sendNotification: (p: { to: string; subject: string; html: string }) => Promise<unknown> } }).email
    await prisma.notificationDelivery.update({
      where: { id: deliveryId },
      data: { status: NotificationDeliveryStatus.sent, sentAt: new Date() },
    })
    if (!email?.sendNotification) {
      await prisma.notificationDelivery.update({
        where: { id: deliveryId },
        data: { status: NotificationDeliveryStatus.failed, failedAt: new Date(), error: { reason: 'email service not configured' } },
      })
      return
    }
    try {
      await email.sendNotification({ to, subject, html })
      await prisma.notificationDelivery.update({
        where: { id: deliveryId },
        data: { status: NotificationDeliveryStatus.delivered, deliveredAt: new Date() },
      })
    } catch (err) {
      this.fastify.log.error({ err, deliveryId }, 'Notification email failed')
      await prisma.notificationDelivery.update({
        where: { id: deliveryId },
        data: { status: NotificationDeliveryStatus.failed, failedAt: new Date(), error: { message: String((err as Error)?.message ?? err) } },
      })
    }
  }

  async retryFailedDeliveries(maxAgeMinutes = 60, maxRetries = 3) {
    const stale = await prisma.notificationDelivery.findMany({
      where: {
        status: NotificationDeliveryStatus.failed,
        retryCount: { lt: maxRetries },
        failedAt: { lt: new Date(Date.now() - maxAgeMinutes * 60_000) },
      },
      select: {
        id: true,
        notification: { select: { userId: true, title: true, message: true, actionUrl: true } },
      },
      take: 50,
    })
    if (stale.length === 0) return 0

    await prisma.notificationDelivery.updateMany({
      where: { id: { in: stale.map((d) => d.id) } },
      data: { retryCount: { increment: 1 }, status: NotificationDeliveryStatus.pending, failedAt: null },
    })

    const profiles = await prisma.profile.findMany({
      where: { id: { in: [...new Set(stale.map((d) => d.notification.userId))] } },
      select: { id: true, email: true },
    })
    const emailMap = new Map(profiles.map((p) => [p.id, p.email]))

    for (const delivery of stale) {
      const to = emailMap.get(delivery.notification.userId)
      if (!to) continue
      void this.sendEmail(delivery.id, {
        to,
        subject: `[Convio] ${delivery.notification.title}`,
        html: renderEmailHtml(delivery.notification.title, delivery.notification.message, delivery.notification.actionUrl),
      }).catch(() => {})
    }
    return stale.length
  }

  async cleanupExpired(days = 15) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const result = await prisma.notification.deleteMany({ where: { createdAt: { lt: cutoff } } })
    return result.count
  }

  // --- system broadcast ---------------------------------------------------

  async broadcastSystem(input: Omit<CreateNotificationInput, 'userId'>): Promise<number> {
    let total = 0
    let cursor: string | undefined
    for (;;) {
      const profiles = await prisma.profile.findMany({
        where: { status: 'active' },
        select: { id: true },
        take: 500,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      })
      if (profiles.length === 0) break
      total += await this.createMany(profiles.map((p) => ({ ...input, userId: p.id })))
      cursor = profiles[profiles.length - 1].id
      if (profiles.length < 500) break
    }
    return total
  }

  async sendToUser(email: string, input: Omit<CreateNotificationInput, 'userId'>): Promise<boolean> {
    const profile = await prisma.profile.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: { id: true },
    })
    if (!profile) return false
    await this.createMany([{ ...input, userId: profile.id }])
    return true
  }

  // --- queries ------------------------------------------------------------

  async list(userId: string, opts: ListNotificationsOptions) {
    const limit = Math.min(opts.limit ?? 30, 100)
    const conditions: Prisma.NotificationWhereInput[] = [notExpired()]
    if (opts.orgId) {
      conditions.push({ OR: [{ organizationId: opts.orgId }, { organizationId: null }] })
    }
    if (opts.search) {
      conditions.push({
        OR: [
          { title: { contains: opts.search, mode: 'insensitive' } },
          { message: { contains: opts.search, mode: 'insensitive' } },
        ],
      })
    }
    const where: Prisma.NotificationWhereInput = {
      userId,
      AND: conditions,
      ...(opts.status ? { status: opts.status } : {}),
      ...(opts.category ? { category: opts.category } : {}),
      ...(opts.priority ? { priority: opts.priority } : {}),
    }

    const items = await prisma.notification.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
      select: NOTIFICATION_SELECT,
    })

    const hasMore = items.length > limit
    const page = hasMore ? items.slice(0, limit) : items
    return { data: page, nextCursor: hasMore ? page[page.length - 1].id : null }
  }

  async unreadCount(userId: string) {
    const groups = await prisma.notification.groupBy({
      by: ['priority'],
      where: { userId, status: NotificationStatus.unread, AND: [notExpired()] },
      _count: { _all: true },
    })
    let unread = 0
    let critical = 0
    for (const g of groups) {
      unread += g._count._all
      if (g.priority === NotificationPriority.critical) critical = g._count._all
    }
    return { unread, critical }
  }

  // --- actions ------------------------------------------------------------

  async markRead(userId: string, id: string): Promise<boolean> {
    const result = await prisma.notification.updateMany({
      where: { id, userId, status: { not: NotificationStatus.read } },
      data: { status: NotificationStatus.read, readAt: new Date() },
    })
    return result.count > 0
  }

  async markAllRead(userId: string, orgId?: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        status: NotificationStatus.unread,
        ...(orgId ? { OR: [{ organizationId: orgId }, { organizationId: null }] } : {}),
      },
      data: { status: NotificationStatus.read, readAt: new Date() },
    })
    return result.count
  }

  async archive(userId: string, id: string): Promise<boolean> {
    const result = await prisma.notification.updateMany({
      where: { id, userId, status: { not: NotificationStatus.archived } },
      data: { status: NotificationStatus.archived, archivedAt: new Date() },
    })
    return result.count > 0
  }

  // --- preferences --------------------------------------------------------

  async getPreferences(userId: string) {
    const existing = await prisma.notificationPreference.findUnique({ where: { userId } })
    if (existing) return existing
    return prisma.notificationPreference.create({ data: { userId } })
  }

  async updatePreferences(userId: string, data: {
    emailEnabled?: boolean
    pushEnabled?: boolean
    inAppEnabled?: boolean
    digestFrequency?: string
    quietHours?: { start?: string; end?: string }
    categorySettings?: Record<string, { email?: boolean }>
    muteAll?: boolean
  }) {
    return prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...data, ...(data.quietHours ? { quietHours: data.quietHours as Prisma.InputJsonValue } : {}), ...(data.categorySettings ? { categorySettings: data.categorySettings as Prisma.InputJsonValue } : {}) },
      update: {
        ...(data.emailEnabled !== undefined ? { emailEnabled: data.emailEnabled } : {}),
        ...(data.pushEnabled !== undefined ? { pushEnabled: data.pushEnabled } : {}),
        ...(data.inAppEnabled !== undefined ? { inAppEnabled: data.inAppEnabled } : {}),
        ...(data.digestFrequency !== undefined ? { digestFrequency: data.digestFrequency } : {}),
        ...(data.quietHours !== undefined ? { quietHours: data.quietHours as Prisma.InputJsonValue } : {}),
        ...(data.categorySettings !== undefined ? { categorySettings: data.categorySettings as Prisma.InputJsonValue } : {}),
        ...(data.muteAll !== undefined ? { muteAll: data.muteAll } : {}),
      },
    })
  }

  private async loadPrefs(userIds: string[]) {
    const rows = await prisma.notificationPreference.findMany({ where: { userId: { in: userIds } } })
    const map = new Map<string, Awaited<ReturnType<NotificationService['getPreferences']>> | null>()
    for (const id of userIds) map.set(id, rows.find((r) => r.userId === id) ?? null)
    return map
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function renderEmailHtml(title: string, message: string | null, actionUrl: string | null) {
  const safeTitle = escapeHtml(title)
  const action = actionUrl ? `<p style="margin:24px 0 0;"><a href="${escapeHtml(actionUrl)}" style="background:#166534;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-family:sans-serif;font-size:14px;">Open in Convio</a></p>` : ''
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;">
      <h2 style="margin:0 0 12px;font-size:18px;color:#111;">${safeTitle}</h2>
      ${message ? `<p style="font-size:14px;line-height:1.6;color:#374151;margin:0 0 8px;">${escapeHtml(message)}</p>` : ''}
      ${action}
    </div>`
}

import { prisma } from '@convio/database'

const STATUS_MAP: Record<string, string> = {
  sent: 'sent',
  delivered: 'delivered',
  read: 'read',
  failed: 'failed',
  pending: 'pending',
}

export async function handleMessageStatus(
  statusPayload: { id?: string; status?: string; recipient_id?: string; errors?: Array<{ code?: number; title?: string; details?: string }> }
): Promise<void> {
  const messageId = statusPayload.id
  const status = statusPayload.status ? STATUS_MAP[statusPayload.status] : null
  if (!messageId || !status) return

  // ponytail: find message by providerMessageId metadata, update status
  const message = await prisma.message.findFirst({
    where: {
      metadata: { path: ['providerMessageId'], equals: messageId },
    },
    select: { id: true },
  })
  if (!message) return

  const update: Record<string, unknown> = { status }

  if (status === 'failed' && statusPayload.errors) {
    const existingMeta = await prisma.message.findUnique({
      where: { id: message.id },
      select: { metadata: true },
    })
    const meta = (existingMeta?.metadata as Record<string, unknown>) || {}
    update.metadata = { ...meta, statusError: statusPayload.errors[0] }
  }

  await prisma.message.update({
    where: { id: message.id },
    data: update as any,
  })
}

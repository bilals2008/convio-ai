import { prisma } from '@convio/database'
import { sendPlatformMessage } from './kapso-platform.js'
import { chatWithAgent } from '../modules/ai/routes.js'
import { formatResponse } from './formatters/index.js'

export async function sendWhatsAppMessage(
  deploymentId: string,
  to: string,
  body: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
  })
  if (!deployment) return { success: false, error: 'Deployment not found' }

  const config = deployment.config as Record<string, unknown>
  return sendKapsoMessage(config, to, body)
}

async function sendKapsoMessage(
  config: Record<string, unknown>,
  to: string,
  body: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const phoneNumberId = config.phoneNumberId as string
    if (!phoneNumberId) return { success: false, error: 'phoneNumberId is required for Kapso' }

    const result = await sendPlatformMessage(phoneNumberId, to, body)
    return { success: true, messageId: result.messages?.[0]?.id }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send Kapso message' }
  }
}

export async function processIncomingMessage(
  deploymentId: string,
  from: string,
  body: string,
  contactName?: string,
  messageId?: string
): Promise<{ response?: string; error?: string }> {
  try {
    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId },
      include: { agent: true },
    })
    if (!deployment) return { error: 'Deployment not found' }

    const agentId = deployment.agentId
    const fromNumber = from.replace('whatsapp:', '')

    // Dedup: if we've already stored this provider message id, skip it.
    // Kapso can redeliver the same webhook (retries / at-least-once delivery),
    // which would otherwise produce duplicate replies.
    if (messageId) {
      const already = await prisma.message.findFirst({
        where: {
          role: 'user',
          conversation: { agentId, channel: 'whatsapp', contactPhone: fromNumber },
          metadata: { path: ['providerMessageId'], equals: messageId },
        },
        select: { id: true },
      })
      if (already) {
        return { response: undefined }
      }
    }

    let conversation = await prisma.conversation.findFirst({
      where: { agentId, channel: 'whatsapp', contactPhone: fromNumber, status: { not: 'closed' } },
      orderBy: { createdAt: 'desc' },
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          agentId,
          channel: 'whatsapp',
          status: 'active',
          contactName: contactName || null,
          contactPhone: fromNumber,
        },
      })

      const existingCount = await prisma.conversation.count({
        where: { agentId, channel: 'whatsapp', contactPhone: fromNumber },
      })

      if (existingCount <= 1) {
        const welcome = `👋 Hi! I'm *${deployment.agent.name || 'your AI assistant'}*. How can I help you today?\n\n` +
          `📌 _Tip:_ Send "clear" or "reset" anytime to start a fresh conversation.`
        sendWhatsAppMessage(deploymentId, fromNumber, welcome).catch((err) => {
          console.error('[WhatsApp] Failed to send welcome message:', err)
        })
      }
    } else if (contactName && !conversation.contactName) {
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: { contactName },
      })
    }

    const trimmed = body.trim().toLowerCase()
    const resetCommands = ['clear', 'reset', 'clear chat', 'reset chat', 'start new', 'new chat', '/clear', '/reset', '/start', 'clear conversation']
    const isResetCommand = resetCommands.some((cmd) => trimmed === cmd)

    if (isResetCommand) {
      if (conversation) {
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { status: 'closed' },
        })
      }

      conversation = await prisma.conversation.create({
        data: {
          agentId,
          channel: 'whatsapp',
          status: 'active',
          contactName: contactName || conversation?.contactName || null,
          contactPhone: fromNumber,
        },
      })

      const reply = 'Conversation cleared! Starting fresh. 👋 How can I help you?'
      const sendResult = await sendWhatsAppMessage(deploymentId, fromNumber, reply)
      if (!sendResult.success) {
        return { error: sendResult.error || 'Failed to send reply' }
      }
      return { response: reply }
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: body,
        metadata: { from: fromNumber, ...(messageId ? { providerMessageId: messageId } : {}) },
      },
    })

    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 50,
    })

    const reply = await chatWithAgent(
      agentId,
      messages.map((m) => ({ role: m.role, content: m.content }))
    )

    const formattedReply = formatResponse('whatsapp', reply)

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: reply,
      },
    })

    const sendResult = await sendWhatsAppMessage(deploymentId, fromNumber, formattedReply)
    if (!sendResult.success) {
      return { error: sendResult.error || 'Failed to send reply' }
    }

    return { response: formattedReply }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[WhatsApp] processIncomingMessage error:', message)
    return { error: message }
  }
}

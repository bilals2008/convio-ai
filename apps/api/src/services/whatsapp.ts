import { prisma } from '@convio/database'
import twilio from 'twilio'
import { WhatsAppClient } from '@kapso/whatsapp-cloud-api'
import { chatWithAgent } from '../modules/ai/routes.js'

function getTwilioClient(config: Record<string, unknown>) {
  const accountSid = config.twilioAccountSid as string
  const authToken = config.twilioAuthToken as string
  return twilio(accountSid, authToken)
}

function getKapsoClient(config: Record<string, unknown>) {
  const kapsoApiKey = config.kapsoApiKey as string
  const baseUrl = process.env.KAPSO_API_BASE_URL || 'https://api.kapso.ai/meta/whatsapp'
  return new WhatsAppClient({
    baseUrl,
    kapsoApiKey,
  })
}

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
  const provider = (config.provider as string) || 'meta'

  if (provider === 'kapso') {
    return sendKapsoMessage(config, to, body)
  }

  if (provider === 'twilio') {
    return sendTwilioMessage(config, to, body)
  }

  return { success: false, error: `Provider '${provider}' is not supported yet` }
}

async function sendTwilioMessage(
  config: Record<string, unknown>,
  to: string,
  body: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const client = getTwilioClient(config)
    const twilioNumber = config.twilioNumber as string
    const message = await client.messages.create({
      from: `whatsapp:${twilioNumber}`,
      to: `whatsapp:${to}`,
      body,
    })
    return { success: true, messageId: message.sid }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send Twilio message' }
  }
}

async function sendKapsoMessage(
  config: Record<string, unknown>,
  to: string,
  body: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const client = getKapsoClient(config)
    const phoneNumberId = config.phoneNumberId as string
    if (!phoneNumberId) return { success: false, error: 'phoneNumberId is required for Kapso' }

    const result = await client.messages.sendText({ phoneNumberId, to, body })
    return { success: true, messageId: result.messages?.[0]?.id }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send Kapso message' }
  }
}

export async function processIncomingMessage(
  deploymentId: string,
  from: string,
  body: string,
  contactName?: string
): Promise<{ response?: string; error?: string }> {
  try {
    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId },
      include: { agent: true },
    })
    if (!deployment) return { error: 'Deployment not found' }

    const agentId = deployment.agentId
    const fromNumber = from.replace('whatsapp:', '')

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
        metadata: { from: fromNumber },
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

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: reply,
      },
    })

    const sendResult = await sendWhatsAppMessage(deploymentId, fromNumber, reply)
    if (!sendResult.success) {
      return { error: sendResult.error || 'Failed to send reply' }
    }

    return { response: reply }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[WhatsApp] processIncomingMessage error:', message)
    return { error: message }
  }
}

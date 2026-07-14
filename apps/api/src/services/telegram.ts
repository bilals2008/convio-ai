import { prisma } from '@convio/database'
import { chatWithAgent } from '../modules/ai/routes.js'

const TELEGRAM_API = 'https://api.telegram.org'

interface TelegramUser {
  id: number
  is_bot?: boolean
  first_name?: string
  last_name?: string
  username?: string
}

interface TelegramChat {
  id: number
  type?: string
  title?: string
  username?: string
}

interface TelegramMessage {
  message_id: number
  from?: TelegramUser
  chat: TelegramChat
  text?: string
  date?: number
}

export interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  edited_message?: TelegramMessage
}

/**
 * Send a text message to a Telegram chat via the Bot API.
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string | number,
  text: string
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  try {
    const res = await fetch(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    })

    const data = (await res.json()) as { ok: boolean; result?: { message_id: number }; description?: string }
    if (!res.ok || !data.ok) {
      return { success: false, error: data.description || `Telegram API error (${res.status})` }
    }

    return { success: true, messageId: data.result?.message_id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send Telegram message'
    return { success: false, error: message }
  }
}

/**
 * Register a webhook URL with Telegram so updates are delivered to our endpoint.
 */
export async function setTelegramWebhook(
  botToken: string,
  url: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${TELEGRAM_API}/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, allowed_updates: ['message'] }),
    })

    const data = (await res.json()) as { ok: boolean; description?: string }
    if (!res.ok || !data.ok) {
      return { success: false, error: data.description || `Telegram API error (${res.status})` }
    }

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to set Telegram webhook'
    return { success: false, error: message }
  }
}

/**
 * Parse an incoming Telegram update, run it through the agent, and reply.
 */
export async function processTelegramUpdate(
  deploymentId: string,
  botToken: string,
  update: TelegramUpdate
): Promise<{ response?: string; error?: string }> {
  try {
    const message = update.message || update.edited_message
    if (!message || !message.text) {
      return {}
    }

    const chatId = message.chat.id
    const text = message.text
    const contactName =
      [message.from?.first_name, message.from?.last_name].filter(Boolean).join(' ') ||
      message.from?.username ||
      undefined

    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId },
      include: { agent: true },
    })
    if (!deployment) return { error: 'Deployment not found' }

    const agentId = deployment.agentId
    const contactId = String(chatId)

    let conversation = await prisma.conversation.findFirst({
      where: { agentId, channel: 'telegram', contactPhone: contactId, status: { not: 'closed' } },
      orderBy: { createdAt: 'desc' },
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          agentId,
          channel: 'telegram',
          status: 'active',
          contactName: contactName || null,
          contactPhone: contactId,
          metadata: { chatId, username: message.from?.username },
        },
      })
    } else if (contactName && !conversation.contactName) {
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: { contactName },
      })
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: text,
        metadata: { chatId },
      },
    })

    const history = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 50,
    })

    const reply = await chatWithAgent(
      agentId,
      history.map((m) => ({ role: m.role, content: m.content }))
    )

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: reply,
      },
    })

    const sendResult = await sendTelegramMessage(botToken, chatId, reply)
    if (!sendResult.success) {
      return { error: sendResult.error || 'Failed to send reply' }
    }

    return { response: reply }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Telegram] processTelegramUpdate error:', message)
    return { error: message }
  }
}

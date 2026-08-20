import { prisma } from '@convio/database'
import { chatWithAgent } from '../modules/ai/routes.js'
import { formatResponse } from './formatters/index.js'

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
  reply_to_message?: TelegramMessage
}

interface TelegramCallbackQuery {
  id: string
  from: TelegramUser
  message?: TelegramMessage
  data?: string
}

export interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  edited_message?: TelegramMessage
  callback_query?: TelegramCallbackQuery
  my_chat_member?: {
    chat: TelegramChat
    from: TelegramUser
    new_chat_member: { status: string }
  }
}

type BotCommand = { command: string; description: string }

async function apiCall<T>(botToken: string, method: string, body: Record<string, unknown>): Promise<{ ok: boolean; result?: T; description?: string }> {
  try {
    const res = await fetch(`${TELEGRAM_API}/bot${botToken}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return await res.json() as any
  } catch (err) {
    return { ok: false, description: err instanceof Error ? err.message : 'Telegram API call failed' }
  }
}

export async function sendTelegramMessage(
  botToken: string,
  chatId: string | number,
  text: string,
  parseMode?: string
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const body: Record<string, unknown> = { chat_id: chatId, text }
  if (parseMode) body.parse_mode = parseMode

  const data = await apiCall<{ message_id: number }>(botToken, 'sendMessage', body)
  if (!data.ok) return { success: false, error: data.description || 'Failed to send message' }

  return { success: true, messageId: data.result?.message_id }
}

export async function setTelegramWebhook(
  botToken: string,
  url: string,
  secretToken?: string
): Promise<{ success: boolean; error?: string }> {
  const body: Record<string, unknown> = {
    url,
    allowed_updates: ['message', 'callback_query', 'my_chat_member'],
  }
  if (secretToken) body.secret_token = secretToken
  const data = await apiCall(botToken, 'setWebhook', body)
  if (!data.ok) return { success: false, error: data.description || 'Failed to set webhook' }
  return { success: true }
}

// === 1. Typing Indicator ===

export async function sendTelegramChatAction(
  botToken: string,
  chatId: string | number,
  action: string = 'typing'
): Promise<{ success: boolean; error?: string }> {
  const data = await apiCall(botToken, 'sendChatAction', { chat_id: chatId, action })
  if (!data.ok) return { success: false, error: data.description || 'Failed to send chat action' }
  return { success: true }
}

// === 2. Reaction Support ===

export async function sendTelegramReaction(
  botToken: string,
  chatId: string | number,
  messageId: number,
  emoji: string
): Promise<{ success: boolean; error?: string }> {
  const data = await apiCall(botToken, 'setMessageReaction', {
    chat_id: chatId,
    message_id: messageId,
    reaction: [{ type: 'emoji', emoji }],
  })
  if (!data.ok) return { success: false, error: data.description || 'Failed to set reaction' }
  return { success: true }
}

// === 4. Bot Commands Menu ===

const DEFAULT_COMMANDS: BotCommand[] = [
  { command: 'start', description: 'Start a new conversation' },
  { command: 'clear', description: 'Clear conversation history' },
  { command: 'help', description: 'Show available commands' },
]

export async function setTelegramCommands(
  botToken: string,
  commands: BotCommand[] = DEFAULT_COMMANDS
): Promise<{ success: boolean; error?: string }> {
  const data = await apiCall(botToken, 'setMyCommands', { commands })
  if (!data.ok) return { success: false, error: data.description || 'Failed to set commands' }
  return { success: true }
}

// === 5. Scheduled Broadcasts ===

export async function sendTelegramBroadcast(
  botToken: string,
  chatId: string | number,
  text: string,
  parseMode?: string
): Promise<{ success: boolean; error?: string }> {
  return sendTelegramMessage(botToken, chatId, text, parseMode)
}

export async function executeTelegramBroadcast(broadcastId: string): Promise<{ sent: number; failed: number }> {
  const broadcast = await prisma.broadcast.findUnique({
    where: { id: broadcastId },
    include: {
      agent: {
        include: { deployments: { where: { channel: 'telegram', status: 'active' } } },
      },
    },
  })
  if (!broadcast || broadcast.status === 'executed') return { sent: 0, failed: 0 }

  const deployment = broadcast.agent.deployments[0]
  if (!deployment) return { sent: 0, failed: 0 }

  const config = deployment.config as Record<string, unknown>
  const botToken = config.botToken as string
  if (!botToken) return { sent: 0, failed: 0 }

  const conversations = await prisma.conversation.findMany({
    where: {
      agentId: broadcast.agentId,
      channel: 'telegram',
      status: { not: 'closed' },
      ...(broadcast.contactFilter as any || {}),
    },
    select: { contactPhone: true },
  })

  let sent = 0
  let failed = 0

  // ponytail: sequential sends, parallelize when throughput matters
  for (const conv of conversations) {
    if (!conv.contactPhone) continue
    try {
      await sendTelegramMessage(botToken, conv.contactPhone, broadcast.message ?? broadcast.templateName)
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

// === Main Handler ===

async function findOrCreateConversation(agentId: string, channel: string, contactPhone: string, contactName?: string) {
  for (let i = 0; i < 3; i++) {
    let conversation = await prisma.conversation.findFirst({
      where: { agentId, channel, contactPhone, status: { not: 'closed' } },
      orderBy: { createdAt: 'desc' },
    })
    if (conversation) return conversation

    try {
      conversation = await prisma.conversation.create({
        data: { agentId, channel, status: 'active', contactName: contactName || null, contactPhone },
      })
      return conversation
    } catch (err: any) {
      if (err?.code === 'P2002') continue
      throw err
    }
  }
  throw new Error('Failed to create conversation after 3 retries')
}

const RESET_COMMANDS = ['/clear', '/reset', 'clear', 'reset']
const HELP_COMMAND = '/help'

function handleCommand(text: string): { type: 'start' | 'clear' | 'help' } | null {
  const trimmed = text.trim().toLowerCase()
  if (trimmed === '/start' || trimmed === 'start') return { type: 'start' }
  if (RESET_COMMANDS.includes(trimmed)) return { type: 'clear' }
  if (trimmed === '/help' || trimmed === 'help') return { type: 'help' }
  return null
}

function isBotMentioned(text: string, botUsername?: string): boolean {
  if (!botUsername) return false
  return text.toLowerCase().includes(`@${botUsername.toLowerCase()}`)
}

export async function processTelegramUpdate(
  deploymentId: string,
  botToken: string,
  update: TelegramUpdate
): Promise<{ response?: string; error?: string }> {
  try {
    // Handle callback queries (from inline keyboards)
    if (update.callback_query) {
      const cq = update.callback_query
      const chatId = cq.message?.chat.id
      const data = cq.data
      if (chatId && data) {
        await sendTelegramMessage(botToken, chatId, `You selected: ${data}`, 'HTML')
        // ponytail: callback data routing, expand when interactive menus are needed
      }
      return {}
    }

    const message = update.message || update.edited_message
    if (!message || !message.text) {
      return {}
    }

    const chatType = message.chat.type || 'private'
    const isGroup = chatType === 'group' || chatType === 'supergroup'

    // In groups, only respond when explicitly mentioned or replying to bot
    if (isGroup) {
      const deployment = await prisma.deployment.findUnique({
        where: { id: deploymentId },
        select: { config: true },
      })
      if (!deployment) return { error: 'Deployment not found' }

      const config = deployment.config as Record<string, unknown>
      const botUsername = config.botUsername as string | undefined

      const isReplyToBot = message.reply_to_message?.from?.is_bot
      if (!isBotMentioned(message.text, botUsername) && !isReplyToBot) {
        return {}
      }
    }

    const chatId = message.chat.id
    const text = message.text
    const contactName =
      [message.from?.first_name, message.from?.last_name].filter(Boolean).join(' ') ||
      message.from?.username ||
      undefined

    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId },
      include: { agent: { include: { organization: true } } },
    })
    if (!deployment) return { error: 'Deployment not found' }

    const agentId = deployment.agentId
    const contactId = isGroup ? String(chatId) : String(chatId)

    // Send typing indicator
    sendTelegramChatAction(botToken, chatId).catch(() => {})

    // Handle bot commands
    const cmd = handleCommand(text)
    if (cmd) {
      if (cmd.type === 'clear') {
        const conv = await prisma.conversation.findFirst({
          where: { agentId, channel: 'telegram', contactPhone: contactId, status: { not: 'closed' } },
        })
        if (conv) {
          await prisma.conversation.update({ where: { id: conv.id }, data: { status: 'closed' } })
        }
        await sendTelegramMessage(botToken, chatId, 'Conversation cleared! How can I help you?', 'HTML')
        return { response: 'Conversation cleared' }
      }

      if (cmd.type === 'help') {
        const helpText = '<b>Available commands:</b>\n/start - Start a new conversation\n/clear - Clear chat history\n/help - Show this message'
        await sendTelegramMessage(botToken, chatId, helpText, 'HTML')
        return { response: 'Help shown' }
      }

      if (cmd.type === 'start') {
        const existing = await prisma.conversation.findFirst({
          where: { agentId, channel: 'telegram', contactPhone: contactId, status: { not: 'closed' } },
        })
        if (existing) {
          await sendTelegramMessage(botToken, chatId, 'Already have an active conversation. Send /clear to start fresh.', 'HTML')
          return {}
        }
      }
    }

    let conversation = await findOrCreateConversation(agentId, 'telegram', contactId, contactName)

    if (contactName && !conversation.contactName) {
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
        metadata: { chatId, chatType, ...(isGroup ? { groupTitle: message.chat.title } : {}) },
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

    const formattedReply = formatResponse('telegram', reply)

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: reply,
      },
    })

    const sendResult = await sendTelegramMessage(botToken, chatId, formattedReply, 'HTML')
    if (!sendResult.success) {
      return { error: sendResult.error || 'Failed to send reply' }
    }

    // React with 👍 on success
    if (sendResult.messageId && message.message_id) {
      sendTelegramReaction(botToken, chatId, message.message_id, '👍').catch(() => {})
    }

    return { response: formattedReply }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Telegram] processTelegramUpdate error:', message)
    return { error: message }
  }
}

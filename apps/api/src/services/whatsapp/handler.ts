import { prisma } from '@convio/database'
import { chatWithAgent } from '../../modules/ai/routes.js'
import { formatResponse } from '../formatters/index.js'
import { sendTypingIndicator } from './client.js'
import { extractInteractiveReply } from './interactive.js'
import { getBusinessHoursConfig, isWithinBusinessHours, getOfflineMessage } from './business-hours.js'
import { sendPlatformMessage } from '../kapso-platform.js'

const OPT_OUT_KEYWORDS = ['stop', 'unsubscribe', 'cancel', 'opt out', 'opt-out']
const OPT_IN_KEYWORDS = ['start', 'subscribe', 'opt in', 'opt-in', 'resubscribe']
const RESET_COMMANDS = ['clear', 'reset', 'clear chat', 'reset chat', 'start new', 'new chat', '/clear', '/reset', '/start', 'clear conversation']

async function findOrCreateConversation(
  agentId: string,
  channel: string,
  contactPhone: string,
  contactName?: string
) {
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

async function loadAgentToolList(agentId: string): Promise<string> {
  const agentTools = await prisma.agentTool.findMany({
    where: { agentId },
    include: { tool: true },
  })
  if (agentTools.length === 0) return ''
  const lines = agentTools.map((at) => {
    const t = at.tool
    const label = (t.config as Record<string, unknown>)?.label || t.name
    const desc = t.description || ''
    return `  • \`${label}\` — ${desc}`
  })
  return '\n\n**Available tools:**\n' + lines.join('\n')
}

function checkOptOut(body: string): 'opt_out' | 'opt_in' | null {
  const trimmed = body.trim().toLowerCase()
  if (OPT_OUT_KEYWORDS.some((k) => trimmed === k || trimmed.startsWith(k + ' '))) return 'opt_out'
  if (OPT_IN_KEYWORDS.some((k) => trimmed === k || trimmed.startsWith(k + ' '))) return 'opt_in'
  return null
}

function isResetCommand(body: string): boolean {
  const trimmed = body.trim().toLowerCase()
  return RESET_COMMANDS.some((cmd) => trimmed === cmd)
}

export interface IncomingMessagePayload {
  from: string
  body?: string
  messageId?: string
  contactName?: string
  phoneNumberId?: string
  interactive?: Record<string, unknown>
  groupMetadata?: { groupId: string; groupSubject?: string; author: string; authorName?: string }
}

export async function processIncomingMessage(
  deploymentId: string,
  payload: IncomingMessagePayload
): Promise<{ response?: string; error?: string }> {
  try {
    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId },
      include: { agent: { include: { organization: true } } },
    })
    if (!deployment) return { error: 'Deployment not found' }

    const agentId = deployment.agentId
    const config = deployment.config as Record<string, unknown>
    const phoneNumberId = payload.phoneNumberId || (config.phoneNumberId as string)
    const fromNumber = payload.from.replace('whatsapp:', '')

    // Resolve contact key: group conversations use groupId:author
    const isGroup = !!payload.groupMetadata
    const contactKey = isGroup && payload.groupMetadata
      ? `${payload.groupMetadata.groupId}:${payload.groupMetadata.author}`
      : fromNumber

    // Business hours check
    const orgConfig = deployment.agent.organization as unknown as Record<string, unknown>
    const bhConfig = getBusinessHoursConfig(orgConfig)
    if (bhConfig && !isWithinBusinessHours(bhConfig)) {
      await sendPlatformMessage(phoneNumberId, fromNumber, getOfflineMessage(bhConfig))
      return { response: getOfflineMessage(bhConfig) }
    }

    // Dedup
    if (payload.messageId) {
      const already = await prisma.message.findFirst({
        where: {
          role: 'user',
          conversation: { agentId, channel: 'whatsapp', contactPhone: contactKey },
          metadata: { path: ['providerMessageId'], equals: payload.messageId },
        },
        select: { id: true },
      })
      if (already) return { response: undefined }
    }

    // Extract text from interactive reply if present
    let body = payload.body || ''
    if (!body && payload.interactive) {
      const reply = extractInteractiveReply(payload.interactive)
      if (reply) body = reply.id
    }

    if (!body) return { response: undefined }

    // Opt-in/opt-out handling
    const optAction = checkOptOut(body)
    if (optAction === 'opt_out') {
      const conversation = await prisma.conversation.findFirst({
        where: { agentId, channel: 'whatsapp', contactPhone: contactKey, status: 'active' },
      })
      if (conversation) {
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { optInStatus: 'opted_out' },
        })
      }
      const reply = "You've unsubscribed from messages. Reply START to resubscribe."
      await sendPlatformMessage(phoneNumberId, fromNumber, reply)
      return { response: reply }
    }

    if (optAction === 'opt_in') {
      const conversation = await prisma.conversation.findFirst({
        where: { agentId, channel: 'whatsapp', contactPhone: contactKey },
        orderBy: { createdAt: 'desc' },
      })
      if (conversation) {
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { optInStatus: 'opted_in' },
        })
      }
      const reply = "You've resubscribed. How can I help you?"
      await sendPlatformMessage(phoneNumberId, fromNumber, reply)
      return { response: reply }
    }

    // Typing indicator + mark as read
    if (phoneNumberId && payload.messageId) {
      sendTypingIndicator(phoneNumberId, fromNumber, payload.messageId).catch(() => {})
    }

    let conversation = await findOrCreateConversation(agentId, 'whatsapp', contactKey, payload.contactName)

    const existingCount = await prisma.conversation.count({
      where: { agentId, channel: 'whatsapp', contactPhone: contactKey },
    })

    if (existingCount <= 1) {
      const toolList = await loadAgentToolList(agentId)
      const groupMention = isGroup && payload.groupMetadata?.groupSubject
        ? ` in *${payload.groupMetadata.groupSubject}*`
        : ''
      const welcome = `👋 Hi${groupMention}! I'm *${deployment.agent.name || 'your AI assistant'}*. How can I help you today?\n\n📌 _Commands:_ Send "clear" or "reset" anytime to start a fresh conversation.${toolList}`
      await sendPlatformMessage(phoneNumberId, fromNumber, welcome)
    } else if (payload.contactName && !conversation.contactName) {
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: { contactName: payload.contactName },
      })
    }

    if (isResetCommand(body)) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { status: 'closed' },
      })

      conversation = await prisma.conversation.create({
        data: {
          agentId,
          channel: 'whatsapp',
          status: 'active',
          contactName: payload.contactName || conversation?.contactName || null,
          contactPhone: contactKey,
          metadata: payload.groupMetadata ? { group: payload.groupMetadata } : undefined,
        },
      })

      const reply = 'Conversation cleared! Starting fresh. 👋 How can I help you?'
      await sendPlatformMessage(phoneNumberId, fromNumber, reply)
      return { response: reply }
    }

    // Store group metadata on first message
    if (isGroup && payload.groupMetadata && !conversation.metadata) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { metadata: { group: payload.groupMetadata } as any },
      })
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: body,
        metadata: {
          from: fromNumber,
          ...(payload.messageId ? { providerMessageId: payload.messageId } : {}),
          ...(payload.interactive ? { interactive: payload.interactive } : {}),
          ...(payload.groupMetadata ? { group: payload.groupMetadata } : {}),
        } as any,
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

    // Prefix group reply with author mention
    const finalReply = isGroup && payload.groupMetadata?.authorName
      ? `@${payload.groupMetadata.authorName} ${formattedReply}`
      : formattedReply

    await sendPlatformMessage(phoneNumberId, fromNumber, finalReply)

    return { response: formattedReply }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[WhatsApp] processIncomingMessage error:', message)
    return { error: message }
  }
}

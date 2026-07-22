import crypto from 'node:crypto'
import { prisma } from '@convio/database'
import { chatWithAgent } from '../modules/ai/routes.js'
import { formatResponse } from './formatters/index.js'

const TWILIO_API = 'https://api.twilio.com/2010-04-01'

function getBasicAuth(accountSid: string, authToken: string): string {
  return 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64')
}

export function verifyTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
  signature: string
): boolean {
  const sortedKeys = Object.keys(params).sort()
  const body = sortedKeys.map((key) => key + params[key]).join('')
  const data = url + body
  const hmac = crypto.createHmac('sha1', authToken).update(data).digest('base64')
  if (hmac.length !== signature.length) return false
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature))
}

function truncateMessage(body: string, maxLen = 4096): string {
  if (body.length <= maxLen) return body
  return body.slice(0, maxLen - 100) + '\n\n[Message truncated...]'
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

async function sendWelcomeMessage(
  accountSid: string,
  authToken: string,
  phoneNumber: string,
  toNumber: string,
  agentName: string,
  agentId: string
) {
  const toolList = await loadAgentToolList(agentId)
  const welcome = `👋 Hi! I'm *${agentName || 'your AI assistant'}*. How can I help you today?\n\n📌 _Commands:_ Send "clear" or "reset" anytime to start a fresh conversation.${toolList}`
  return sendWhatsAppMessage(accountSid, authToken, phoneNumber, toNumber, welcome)
}

export async function sendWhatsAppMessage(
  accountSid: string,
  authToken: string,
  from: string,
  to: string,
  body: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  try {
    const cleanFrom = from.includes('whatsapp:') ? from : `whatsapp:${from}`
    const cleanTo = to.includes('whatsapp:') ? to : `whatsapp:${to}`

    const params = new URLSearchParams({
      To: cleanTo,
      From: cleanFrom,
      Body: truncateMessage(body),
    })

    const res = await fetch(`${TWILIO_API}/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': getBasicAuth(accountSid, authToken),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const data = await res.json() as { sid?: string; message?: string; status?: number }
    if (!res.ok) {
      return { success: false, error: data.message || `Twilio API error (${res.status})` }
    }

    return { success: true, messageSid: data.sid }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send WhatsApp message'
    return { success: false, error: message }
  }
}

export interface TwilioIncomingMessage {
  MessageSid: string
  From: string
  To: string
  Body: string
  NumMedia?: string
  MediaUrl0?: string
  MediaContentType0?: string
  SmsStatus?: string
  MessageStatus?: string
  ProfileName?: string
  [key: string]: string | undefined
}

export async function processIncomingMessage(
  deploymentId: string,
  config: Record<string, unknown>,
  payload: TwilioIncomingMessage
): Promise<{ response?: string; error?: string }> {
  try {
    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId },
      include: { agent: true },
    })
    if (!deployment) return { error: 'Deployment not found' }

    const agentId = deployment.agentId
    const fromNumber = payload.From.replace('whatsapp:', '')
    const text = payload.Body
    const contactName = payload.ProfileName || undefined

    const already = await prisma.message.findFirst({
      where: {
        role: 'user',
        conversation: { agentId, channel: 'whatsapp', contactPhone: fromNumber },
        metadata: { path: ['providerMessageId'], equals: payload.MessageSid },
      },
      select: { id: true },
    })
    if (already) return { response: undefined }

    let conversation = await findOrCreateConversation(agentId, 'whatsapp', fromNumber, contactName)

    const existingCount = await prisma.conversation.count({
      where: { agentId, channel: 'whatsapp', contactPhone: fromNumber },
    })

    if (existingCount <= 1) {
      const accountSid = config.accountSid as string
      const authToken = config.authToken as string
      const phoneNumber = config.phoneNumber as string
      if (accountSid && authToken && phoneNumber) {
        sendWelcomeMessage(accountSid, authToken, phoneNumber, fromNumber, deployment.agent.name || '', agentId).catch(() => {})
      }
    } else if (contactName && !conversation.contactName) {
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: { contactName },
      })
    }

    const trimmed = text.trim().toLowerCase()
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
      const accountSid = config.accountSid as string
      const authToken = config.authToken as string
      const phoneNumber = config.phoneNumber as string
      const sendResult = await sendWhatsAppMessage(accountSid, authToken, phoneNumber, fromNumber, reply)
      if (!sendResult.success) {
        return { error: sendResult.error || 'Failed to send reply' }
      }
      return { response: reply }
    }

    const mediaCount = parseInt(payload.NumMedia || '0', 10)
    const metadata: Record<string, unknown> = { from: fromNumber, providerMessageId: payload.MessageSid }
    if (mediaCount > 0) {
      const media: Array<{ url: string; contentType: string }> = []
      for (let i = 0; i < mediaCount; i++) {
        const url = payload[`MediaUrl${i}`]
        const contentType = payload[`MediaContentType${i}`]
        if (url) {
          media.push({ url, contentType: contentType || 'unknown' })
        }
      }
      metadata.media = media
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: text || (mediaCount > 0 ? '[Media message]' : ''),
        metadata: metadata as any,
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

    const formattedReply = formatResponse('twilio', reply)

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: reply,
      },
    })

    const accountSid = config.accountSid as string
    const authToken = config.authToken as string
    const phoneNumber = config.phoneNumber as string

    if (!accountSid || !authToken || !phoneNumber) {
      return { error: 'Twilio credentials not configured' }
    }

    const sendResult = await sendWhatsAppMessage(accountSid, authToken, phoneNumber, fromNumber, formattedReply)
    if (!sendResult.success) {
      return { error: sendResult.error || 'Failed to send reply' }
    }

    return { response: formattedReply }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Twilio] processIncomingMessage error:', message)
    return { error: message }
  }
}

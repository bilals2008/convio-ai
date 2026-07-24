import WebSocket from 'ws'
import { prisma } from '@convio/database'
import { chatWithAgent } from '../modules/ai/routes.js'
import { formatResponse } from './formatters/index.js'

const DISCORD_API = 'https://discord.com/api/v10'
const GATEWAY_URL = 'wss://gateway.discord.gg/?v=10&encoding=json'
const BOT_COLOR = 0x22c55e

const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_BASE_DELAY = 5000
const RECONNECT_MAX_DELAY = 30000

let botUserId: string | null = null
let gateway: WebSocket | null = null
let heartbeatInterval: ReturnType<typeof setInterval> | null = null
let sequence: number | null = null
let sessionId: string | null = null
let reconnectAttempts = 0
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

const processedMessageIds = new Set<string>()
const MAX_CACHED_IDS = 500

async function sendEmbedMessage(channelId: string, text: string, botToken: string): Promise<string | null> {
  const url = `${DISCORD_API}/channels/${channelId}/messages`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${botToken}`,
    },
    body: JSON.stringify({
      embeds: [{
        description: text,
        color: BOT_COLOR,
        footer: { text: 'Convio AI' },
      }],
    }),
  })
  if (!res.ok) {
    console.error('[Discord Gateway] Failed to send message:', await res.text().catch(() => 'unknown'))
    return null
  }
  const data = await res.json() as { id: string }
  return data.id
}

async function createThread(
  botToken: string,
  channelId: string,
  messageId: string,
  name: string,
): Promise<string | null> {
  try {
    const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages/${messageId}/threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${botToken}`,
      },
      body: JSON.stringify({ name, auto_archive_duration: 60, type: 12 }),
    })
    if (!res.ok) return null
    const thread = await res.json() as { id: string }
    return thread.id
  } catch {
    return null
  }
}

async function handleMessageCreate(data: any, botToken: string) {
  if (!data.id || data.author?.bot || data.author?.id === botUserId) return

  if (processedMessageIds.has(data.id)) return
  if (processedMessageIds.size >= MAX_CACHED_IDS) processedMessageIds.clear()
  processedMessageIds.add(data.id)

  const isDM = data.guild_id === undefined

  if (!isDM) {
    const isMentioned = data.mentions?.some((m: any) => m.id === botUserId)
    if (!isMentioned) return
  }

  const guildId = data.guild_id
  let deployment: any

  if (guildId) {
    deployment = await prisma.deployment.findFirst({
      where: { channel: 'discord', config: { path: ['guildId'], equals: guildId } },
      include: { agent: true },
    })
  } else {
    const existingConversation = await prisma.conversation.findFirst({
      where: { channel: 'discord', contactPhone: data.author.id, status: { not: 'closed' } },
      orderBy: { createdAt: 'desc' },
    })
    if (existingConversation) {
      deployment = await prisma.deployment.findFirst({
        where: { agentId: existingConversation.agentId, channel: 'discord' },
        include: { agent: true },
      })
    } else {
      deployment = await prisma.deployment.findFirst({
        where: { channel: 'discord', config: { path: ['botToken'], equals: botToken } },
        include: { agent: true },
        orderBy: { createdAt: 'desc' },
      })
    }
  }

  if (!deployment) return

  const text = data.content?.replace(/<@!?(\d+)>/g, '').trim()
  if (!text) return

  const contactId = data.author.id
  const contactName = data.author.global_name || data.author.username

  let conversation = await prisma.conversation.findFirst({
    where: { agentId: deployment.agentId, channel: 'discord', contactPhone: contactId, status: { not: 'closed' } },
    orderBy: { createdAt: 'desc' },
  })

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        agentId: deployment.agentId,
        channel: 'discord',
        status: 'active',
        contactName: contactName || null,
        contactPhone: contactId,
        metadata: { channelId: data.channel_id, guildId },
      },
    })
  } else if (contactName && !conversation.contactName) {
    conversation = await prisma.conversation.update({
      where: { id: conversation.id },
      data: { contactName },
    })
  }

  await prisma.message.create({
    data: { conversationId: conversation.id, role: 'user', content: text, metadata: { userId: contactId } },
  })

  const history = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: 'asc' },
    take: 50,
  })

  try {
    const reply = await chatWithAgent(
      deployment.agentId,
      history.map((m) => ({ role: m.role, content: m.content }))
    )

    const replyText = formatResponse('discord', reply || 'Sorry, I could not generate a response. Please try again.')

    await prisma.message.create({
      data: { conversationId: conversation.id, role: 'assistant', content: reply },
    })

    const messageId = await sendEmbedMessage(
      data.channel_id,
      isDM ? replyText : `<@${contactId}> ${replyText}`,
      botToken,
    )

    const convMeta = (conversation.metadata || {}) as Record<string, unknown>
    if (!isDM && messageId && !convMeta.threadId) {
      const threadName = `Chat with ${deployment.agent?.name || 'ai'}`
      const threadId = await createThread(botToken, data.channel_id, messageId, threadName)
      if (threadId) {
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { metadata: { ...convMeta, threadId } },
        })
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Discord Gateway] AI reply error:', message)
    await sendEmbedMessage(
      data.channel_id,
      isDM
        ? 'Sorry, an error occurred while generating a response. Please try again.'
        : `<@${contactId}> Sorry, an error occurred while generating a response. Please try again.`,
      botToken,
    )
  }
}

async function sendWelcomeMessage(guild: any, botToken: string) {
  try {
    const guildId = guild.id
    if (!guildId) return

    const deployment = await prisma.deployment.findFirst({
      where: { channel: 'discord', config: { path: ['guildId'], equals: guildId } },
      include: { agent: true },
    })
    if (!deployment) return

    const conversations = await prisma.conversation.count({
      where: { agentId: deployment.agentId, channel: 'discord', metadata: { path: ['guildId'], equals: guildId } },
    })
    if (conversations > 0) return

    const channels = guild.channels as any[] | undefined
    if (!channels || !Array.isArray(channels)) return

    const textChannel = channels.find(
      (c: any) => c.type === 0 && c.permissions && (BigInt(c.permissions) & BigInt(2048)) === BigInt(2048)
    )
    if (!textChannel) return

    const url = `${DISCORD_API}/channels/${textChannel.id}/messages`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${botToken}`,
      },
      body: JSON.stringify({
        embeds: [{
          title: '👋 Hi, I\'m your Convio AI assistant!',
          description: 'I\'m here to help. Here\'s how to use me:\n\n' +
            '• **@mention me** — Send a message and I\'ll reply\n' +
            '• **`/chat`** — Start a conversation with a message\n' +
            '• **`/reset`** — Clear your chat history and start fresh\n' +
            '• **`/session`** — View your chat details (messages, duration)\n\n' +
            'Every conversation is private and scoped to you. Try saying hi!',
          color: BOT_COLOR,
          footer: { text: 'Convio AI' },
        }],
      }),
    })
    if (!res.ok) {
      console.error('[Discord Gateway] Failed to send welcome message:', await res.text().catch(() => 'unknown'))
    }
  } catch (err) {
    console.error('[Discord Gateway] Welcome message error:', err)
  }
}

function startGateway(botToken: string) {
  if (gateway) return

  gateway = new WebSocket(GATEWAY_URL)

  gateway.on('open', () => {
    console.log('[Discord Gateway] Connected')
    reconnectAttempts = 0
  })

  gateway.on('message', async (raw) => {
    try {
      const payload = JSON.parse(raw.toString())
      const { op, t, d, s } = payload

      if (s) sequence = s

      switch (op) {
        case 10: {
          const { heartbeat_interval } = d
          if (heartbeatInterval) clearInterval(heartbeatInterval)
          heartbeatInterval = setInterval(() => {
            gateway?.send(JSON.stringify({ op: 1, d: sequence }))
          }, heartbeat_interval)

          const GUILD_MESSAGES = 1 << 9
          const DIRECT_MESSAGES = 1 << 12
          const MESSAGE_CONTENT = 1 << 15
          gateway?.send(JSON.stringify({
            op: 2,
            d: {
              token: `Bot ${botToken}`,
              intents: GUILD_MESSAGES | DIRECT_MESSAGES | MESSAGE_CONTENT,
              properties: { os: 'linux', browser: 'convio', device: 'convio' },
            },
          }))
          break
        }
        case 0: {
          if (t === 'READY') {
            botUserId = d.user?.id
            sessionId = d.session_id
            console.log('[Discord Gateway] Ready — bot user:', botUserId)
          }
          if (t === 'MESSAGE_CREATE') {
            void handleMessageCreate(d, botToken)
          }
          if (t === 'GUILD_CREATE') {
            void sendWelcomeMessage(d, botToken)
          }
          break
        }
        case 7: {
          console.log('[Discord Gateway] Reconnect requested')
          reconnect(botToken)
          break
        }
        case 9: {
          console.error('[Discord Gateway] Invalid session')
          reconnect(botToken)
          break
        }
      }
    } catch (err) {
      console.error('[Discord Gateway] Parse error:', err)
    }
  })

  gateway.on('close', (code, reason) => {
    console.log(`[Discord Gateway] Closed (${code}): ${reason}`)
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) reconnect(botToken)
  })

  gateway.on('error', (err) => {
    console.error('[Discord Gateway] Error:', err.message)
  })
}

function stopGateway() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
    heartbeatInterval = null
  }
  if (gateway) {
    gateway.onclose = null
    gateway.onerror = null
    gateway.close()
    gateway = null
  }
  botUserId = null
  sessionId = null
  sequence = null
  reconnectAttempts = 0
}

function reconnect(botToken: string) {
  stopGateway()
  reconnectAttempts++
  if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
    console.log(`[Discord Gateway] Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Giving up.`)
    return
  }
  const delay = Math.min(RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts - 1), RECONNECT_MAX_DELAY)
  console.log(`[Discord Gateway] Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`)
  reconnectTimer = setTimeout(() => startGateway(botToken), delay)
}

export function initDiscordGateway(botToken?: string) {
  if (!botToken) {
    console.log('[Discord Gateway] No bot token — skipping Gateway connection')
    return
  }
  startGateway(botToken)
}

export function shutdownDiscordGateway() {
  stopGateway()
}

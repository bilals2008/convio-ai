import WebSocket from 'ws'
import { prisma } from '@convio/database'
import { chatWithAgent } from '../modules/ai/routes.js'
import { formatResponse } from './formatters/index.js'
import { handleMessageUpdate, handleMessageReaction, handleGuildCreate } from './discord/gateway.js'
import { sendChannelMessage, createThread, BOT_COLOR } from './discord/client.js'

const DISCORD_API = 'https://discord.com/api/v10'
const GATEWAY_URL = 'wss://gateway.discord.gg/?v=10&encoding=json'

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

async function handleMessageCreate(data: any, botToken: string) {
  if (!data.id || data.author?.bot || data.author?.id === botUserId) return

  // In-memory dedup (same process)
  if (processedMessageIds.has(data.id)) return
  if (processedMessageIds.size >= MAX_CACHED_IDS) processedMessageIds.clear()
  processedMessageIds.add(data.id)

  // DB-level dedup (across instances — Railway + local)
  const existing = await prisma.message.findFirst({
    where: { metadata: { path: ['providerMessageId'], equals: data.id } },
  })
  if (existing) return

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
    data: { conversationId: conversation.id, role: 'user', content: text, metadata: { userId: contactId, providerMessageId: data.id } },
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

    const assistantMsg = await prisma.message.create({
      data: { conversationId: conversation.id, role: 'assistant', content: reply },
    })

    const sentMsg = await sendChannelMessage(
      botToken, data.channel_id,
      {
        embeds: [{ description: isDM ? replyText : `<@${contactId}> ${replyText}`, color: BOT_COLOR, footer: { text: 'Convio AI' } }],
      },
    )

    // Store discord message id for edit support
    if (sentMsg?.id) {
      await prisma.message.update({
        where: { id: assistantMsg.id },
        data: { metadata: { discordMessageId: sentMsg.id } as any },
      })
    }

    const convMeta = (conversation.metadata || {}) as Record<string, unknown>
    if (!isDM && sentMsg?.id && !convMeta.threadId) {
      const threadName = `Chat with ${deployment.agent?.name || 'ai'}`
      const threadId = await createThread(botToken, data.channel_id, sentMsg.id, threadName)
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
    await sendChannelMessage(
      botToken, data.channel_id,
      {
        embeds: [{
          description: isDM
            ? 'Sorry, an error occurred. Please try again.'
            : `<@${contactId}> Sorry, an error occurred. Please try again.`,
          color: BOT_COLOR,
        }],
      },
    )
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
          const GUILD_MESSAGE_REACTIONS = 1 << 10
          gateway?.send(JSON.stringify({
            op: 2,
            d: {
              token: `Bot ${botToken}`,
              intents: GUILD_MESSAGES | DIRECT_MESSAGES | MESSAGE_CONTENT | GUILD_MESSAGE_REACTIONS,
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
          if (t === 'MESSAGE_UPDATE') {
            void handleMessageUpdate(d, botToken)
          }
          if (t === 'MESSAGE_REACTION_ADD') {
            void handleMessageReaction(d, botToken)
          }
          if (t === 'GUILD_CREATE') {
            void handleGuildCreate(d, botToken)
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
    reconnect(botToken)
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
  if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) reconnectAttempts = 0
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

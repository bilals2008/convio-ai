import WebSocket from 'ws'
import { prisma } from '@convio/database'
import { chatWithAgent } from '../modules/ai/routes.js'
import { formatResponse } from './formatters/index.js'
import { handleMessageUpdate, handleMessageReaction, handleGuildCreate } from './discord/gateway.js'
import { sendChannelMessage, createThread, BOT_COLOR } from './discord/client.js'

const GATEWAY_URL = 'wss://gateway.discord.gg/?v=10&encoding=json'

const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_BASE_DELAY = 5000
const RECONNECT_MAX_DELAY = 30000

// One connection per bot token (platform bot + per-user BYOK bots)
interface Connection {
  socket: WebSocket
  token: string
  heartbeat: ReturnType<typeof setInterval> | null
  heartbeatIntervalMs: number
  lastAck: number
  seq: number | null
  sessionId: string | null
  botUserId: string | null
  reconnectAttempts: number
  reconnectTimer: ReturnType<typeof setTimeout> | null
}

const connections = new Map<string, Connection>()
let enabled = true

const processedMessageIds = new Set<string>()
const MAX_CACHED_IDS = 500

async function handleMessageCreate(data: any, botToken: string, botUserId: string | null) {
  if (!data.id || data.author?.bot || data.author?.id === botUserId) return

  // In-memory dedup per bot token (same message arrives on every bot in the guild)
  const dedupKey = `${botToken}:${data.id}`
  if (processedMessageIds.has(dedupKey)) return
  if (processedMessageIds.size >= MAX_CACHED_IDS) processedMessageIds.clear()
  processedMessageIds.add(dedupKey)

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
    // Resolve by the mentioned bot's token (all bots in a guild share the guildId)
    deployment = await prisma.deployment.findFirst({
      where: { channel: 'discord', config: { path: ['botToken'], equals: botToken } },
      include: { agent: true },
      orderBy: { createdAt: 'desc' },
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

function startGateway(token: string) {
  if (connections.has(token)) return

  const conn: Connection = {
    socket: new WebSocket(GATEWAY_URL),
    token,
    heartbeat: null,
    heartbeatIntervalMs: 0,
    lastAck: Date.now(),
    seq: null,
    sessionId: null,
    botUserId: null,
    reconnectAttempts: 0,
    reconnectTimer: null,
  }
  connections.set(token, conn)
  const gw = conn.socket

  gw.on('open', () => {
    console.log(`[Discord Gateway] Connected (token ${token.slice(-6)})`)
    conn.reconnectAttempts = 0
  })

  gw.on('message', async (raw) => {
    try {
      const payload = JSON.parse(raw.toString())
      const { op, t, d, s } = payload

      if (s) conn.seq = s

      // Heartbeat ACK watchdog: Discord closes the socket after a single
      // missed ACK, so if we haven't heard back in ~2.5 intervals, force a
      // close to trigger the reconnect path.
      if (op === 11) {
        conn.lastAck = Date.now()
      }

      switch (op) {
        case 10: {
          const { heartbeat_interval } = d
          conn.heartbeatIntervalMs = heartbeat_interval
          if (conn.heartbeat) clearInterval(conn.heartbeat)
          conn.lastAck = Date.now()
          conn.heartbeat = setInterval(() => {
            if (Date.now() - conn.lastAck > conn.heartbeatIntervalMs * 2.5) {
              console.warn(`[Discord Gateway] No heartbeat ACK (token ${token.slice(-6)}) — forcing reconnect`)
              conn.socket.terminate()
              return
            }
            conn.socket.send(JSON.stringify({ op: 1, d: conn.seq }))
          }, heartbeat_interval)

          const GUILD_MESSAGES = 1 << 9
          const DIRECT_MESSAGES = 1 << 12
          const MESSAGE_CONTENT = 1 << 15
          const GUILD_MESSAGE_REACTIONS = 1 << 10
          conn.socket.send(JSON.stringify({
            op: 2,
            d: {
              token: `Bot ${token}`,
              intents: GUILD_MESSAGES | DIRECT_MESSAGES | MESSAGE_CONTENT | GUILD_MESSAGE_REACTIONS,
              properties: { os: 'linux', browser: 'convio', device: 'convio' },
            },
          }))
          break
        }
        case 0: {
          if (t === 'READY') {
            conn.botUserId = d.user?.id
            conn.sessionId = d.session_id
            console.log(`[Discord Gateway] Ready — bot user: ${conn.botUserId} (token ${token.slice(-6)})`)
          }
          if (t === 'MESSAGE_CREATE') {
            void handleMessageCreate(d, token, conn.botUserId)
          }
          if (t === 'MESSAGE_UPDATE') {
            void handleMessageUpdate(d, token)
          }
          if (t === 'MESSAGE_REACTION_ADD') {
            void handleMessageReaction(d, token)
          }
          if (t === 'GUILD_CREATE') {
            void handleGuildCreate(d, token)
          }
          break
        }
        case 7: {
          console.log(`[Discord Gateway] Reconnect requested (token ${token.slice(-6)})`)
          stopConnection(conn)
          reconnect(conn)
          break
        }
        case 9: {
          console.error(`[Discord Gateway] Invalid session (token ${token.slice(-6)})`)
          stopConnection(conn)
          reconnect(conn)
          break
        }
      }
    } catch (err) {
      console.error('[Discord Gateway] Parse error:', err)
    }
  })

  gw.on('close', (code, reason) => {
    console.log(`[Discord Gateway] Closed (${code}): ${reason.toString()} (token ${token.slice(-6)})`)
    stopConnection(conn)
    reconnect(conn)
  })

  gw.on('error', (err) => {
    console.error(`[Discord Gateway] Error (token ${token.slice(-6)}):`, err.message)
  })
}

function stopConnection(conn: Connection) {
  if (conn.reconnectTimer) {
    clearTimeout(conn.reconnectTimer)
    conn.reconnectTimer = null
  }
  if (conn.heartbeat) {
    clearInterval(conn.heartbeat)
    conn.heartbeat = null
  }
  if (connections.get(conn.token) === conn) connections.delete(conn.token)
  try {
    conn.socket.close()
  } catch {
    // already closed
  }
}

function reconnect(conn: Connection) {
  // Reconnects are scheduled on the Connection object itself, which survives
  // stopConnection() — the previous implementation looked the token up in the
  // map after deletion and always bailed, killing the bot permanently.
  if (conn.reconnectTimer) return
  conn.reconnectAttempts++
  // Backoff stays capped at RECONNECT_MAX_DELAY and never resets, so a dead
  // bot keeps retrying forever at 30s instead of cycling 5s..30s..5s.
  const delay = Math.min(RECONNECT_BASE_DELAY * Math.pow(2, conn.reconnectAttempts - 1), RECONNECT_MAX_DELAY)
  console.log(`[Discord Gateway] Reconnecting in ${delay}ms (attempt ${conn.reconnectAttempts}) (token ${conn.token.slice(-6)})`)
  conn.reconnectTimer = setTimeout(() => {
    conn.reconnectTimer = null
    startGateway(conn.token)
  }, delay)
}

// Idempotent — safe to call whenever a new discord deployment is created
export function ensureDiscordGateway(token: string | undefined) {
  if (!enabled || !token) return
  startGateway(token)
}

export async function initDiscordGateway(tokens?: string | string[]) {
  enabled = Boolean(tokens)
  if (!enabled) {
    console.log('[Discord Gateway] Disabled via DISCORD_GATEWAY_ENABLED=false')
    return
  }

  const all = new Set(([] as string[]).concat(tokens ?? []).filter(Boolean))
  try {
    // Bring in every user's bot token so BYOK bots get gateway events too
    const deployments = await prisma.deployment.findMany({
      where: { channel: 'discord' },
      select: { config: true },
    })
    for (const d of deployments) {
      const t = (d.config as Record<string, unknown> | null)?.botToken as string | undefined
      if (t) all.add(t)
    }
  } catch (err) {
    console.error('[Discord Gateway] Failed to load deployment tokens:', err)
  }

  for (const t of all) startGateway(t)
  console.log(`[Discord Gateway] Managing ${all.size} bot connection(s)`)
}

export function shutdownDiscordGateway() {
  for (const conn of connections.values()) stopConnection(conn)
  connections.clear()
}
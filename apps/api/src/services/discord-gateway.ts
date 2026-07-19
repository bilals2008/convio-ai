import WebSocket from 'ws'
import { prisma } from '@convio/database'
import { chatWithAgent } from '../modules/ai/routes.js'

const DISCORD_API = 'https://discord.com/api/v10'
const GATEWAY_URL = 'wss://gateway.discord.gg/?v=10&encoding=json'

let botUserId: string | null = null
let gateway: WebSocket | null = null
let heartbeatInterval: ReturnType<typeof setInterval> | null = null
let sequence: number | null = null
let sessionId: string | null = null

async function sendChannelMessage(channelId: string, content: string, botToken: string) {
  const url = `${DISCORD_API}/channels/${channelId}/messages`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${botToken}`,
    },
    body: JSON.stringify({ content }),
  })
  if (!res.ok) {
    console.error('[Discord Gateway] Failed to send message:', await res.text().catch(() => 'unknown'))
  }
}

async function handleMessageCreate(data: any, botToken: string) {
  if (!botUserId || data.author?.id === botUserId) return
  if (data.guild_id === undefined) return

  const isMentioned = data.mentions?.some((m: any) => m.id === botUserId)
  if (!isMentioned) return

  const guildId = data.guild_id
  const deployment = await prisma.deployment.findFirst({
    where: { channel: 'discord', config: { path: ['guildId'], equals: guildId } },
    include: { agent: true },
  })
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

    await prisma.message.create({
      data: { conversationId: conversation.id, role: 'assistant', content: reply },
    })

    const mention = `<@${contactId}>`
    await sendChannelMessage(data.channel_id, `${mention} ${reply}`, botToken)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Discord Gateway] AI reply error:', message)
  }
}

function startGateway(botToken: string) {
  if (gateway) return

  gateway = new WebSocket(GATEWAY_URL)

  gateway.on('open', () => {
    console.log('[Discord Gateway] Connected')
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
          const MESSAGE_CONTENT = 1 << 15
          gateway?.send(JSON.stringify({
            op: 2,
            d: {
              token: `Bot ${botToken}`,
              intents: GUILD_MESSAGES | MESSAGE_CONTENT,
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
    setTimeout(() => reconnect(botToken), 5000)
  })

  gateway.on('error', (err) => {
    console.error('[Discord Gateway] Error:', err.message)
  })
}

function stopGateway() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
    heartbeatInterval = null
  }
  if (gateway) {
    gateway.close()
    gateway = null
  }
  botUserId = null
  sessionId = null
  sequence = null
}

function reconnect(botToken: string) {
  stopGateway()
  setTimeout(() => startGateway(botToken), 3000)
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

import { prisma } from '@convio/database'
import crypto from 'node:crypto'
import { chatWithAgent } from '../modules/ai/routes.js'

const DISCORD_API = 'https://discord.com/api/v10'

// Discord interaction types
const INTERACTION_TYPE_PING = 1
const INTERACTION_TYPE_APPLICATION_COMMAND = 2

// Discord interaction response types
const RESPONSE_TYPE_PONG = 1
const RESPONSE_TYPE_CHANNEL_MESSAGE = 4

interface DiscordInteractionOption {
  name: string
  type: number
  value?: string
}

interface DiscordInteractionMember {
  user?: { id: string; username?: string; global_name?: string }
}

export interface DiscordInteraction {
  id: string
  type: number
  token?: string
  channel_id?: string
  guild_id?: string
  member?: DiscordInteractionMember
  user?: { id: string; username?: string; global_name?: string }
  data?: {
    name?: string
    options?: DiscordInteractionOption[]
  }
}

/**
 * Send a message to a Discord channel via the Bot API.
 */
export async function sendDiscordMessage(
  botToken: string,
  channelId: string,
  text: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${botToken}`,
      },
      body: JSON.stringify({ content: text }),
    })

    if (!res.ok) {
      const errBody = (await res.json().catch(() => ({}))) as { message?: string }
      return { success: false, error: errBody.message || `Discord API error (${res.status})` }
    }

    const data = (await res.json()) as { id: string }
    return { success: true, messageId: data.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send Discord message'
    return { success: false, error: message }
  }
}

/**
 * Verify a Discord interaction request signature (Ed25519).
 * Discord signs the raw request body with the timestamp header.
 */
export function verifyDiscordSignature(
  publicKey: string,
  signature: string,
  timestamp: string,
  rawBody: string
): boolean {
  try {
    if (!publicKey || !signature || !timestamp) return false

    const message = Buffer.from(timestamp + rawBody)
    const sig = Buffer.from(signature, 'hex')
    const key = crypto.createPublicKey({
      key: Buffer.concat([
        // SPKI header for Ed25519 public key
        Buffer.from('302a300506032b6570032100', 'hex'),
        Buffer.from(publicKey, 'hex'),
      ]),
      format: 'der',
      type: 'spki',
    })

    return crypto.verify(null, message, key, sig)
  } catch {
    return false
  }
}

function extractUserMessage(interaction: DiscordInteraction): string | undefined {
  const options = interaction.data?.options
  if (!options || options.length === 0) return undefined
  const messageOption = options.find((o) => o.name === 'message') ?? options[0]
  return typeof messageOption?.value === 'string' ? messageOption.value : undefined
}

/**
 * Process a verified Discord interaction. Returns the interaction response body
 * to be sent back synchronously (PONG for pings, message for slash commands).
 */
export async function processDiscordInteraction(
  deploymentId: string,
  interaction: DiscordInteraction
): Promise<{ type: number; data?: { content: string } }> {
  // Respond to Discord's PING handshake
  if (interaction.type === INTERACTION_TYPE_PING) {
    return { type: RESPONSE_TYPE_PONG }
  }

  if (interaction.type !== INTERACTION_TYPE_APPLICATION_COMMAND) {
    return { type: RESPONSE_TYPE_CHANNEL_MESSAGE, data: { content: 'Unsupported interaction.' } }
  }

  const text = extractUserMessage(interaction)
  if (!text) {
    return { type: RESPONSE_TYPE_CHANNEL_MESSAGE, data: { content: 'Please provide a message.' } }
  }

  try {
    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId },
      include: { agent: true },
    })
    if (!deployment) {
      return { type: RESPONSE_TYPE_CHANNEL_MESSAGE, data: { content: 'Deployment not found.' } }
    }

    const agentId = deployment.agentId
    const discordUser = interaction.member?.user ?? interaction.user
    const contactId = discordUser?.id || interaction.channel_id || interaction.id
    const contactName = discordUser?.global_name || discordUser?.username || undefined

    let conversation = await prisma.conversation.findFirst({
      where: { agentId, channel: 'discord', contactPhone: contactId, status: { not: 'closed' } },
      orderBy: { createdAt: 'desc' },
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          agentId,
          channel: 'discord',
          status: 'active',
          contactName: contactName || null,
          contactPhone: contactId,
          metadata: { channelId: interaction.channel_id, guildId: interaction.guild_id },
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
        metadata: { userId: discordUser?.id },
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

    return { type: RESPONSE_TYPE_CHANNEL_MESSAGE, data: { content: reply } }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Discord] processDiscordInteraction error:', message)
    return { type: RESPONSE_TYPE_CHANNEL_MESSAGE, data: { content: `Sorry, an error occurred: ${message}` } }
  }
}

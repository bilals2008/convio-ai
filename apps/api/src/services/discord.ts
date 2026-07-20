import { prisma } from '@convio/database'
import crypto from 'node:crypto'
import { chatWithAgent } from '../modules/ai/routes.js'

const DISCORD_API = 'https://discord.com/api/v10'

const INTERACTION_TYPE_PING = 1
const INTERACTION_TYPE_APPLICATION_COMMAND = 2

const RESPONSE_TYPE_PONG = 1
const RESPONSE_TYPE_CHANNEL_MESSAGE = 4
const RESPONSE_TYPE_DEFERRED_CHANNEL_MESSAGE = 5

const BOT_COLOR = 0x22c55e

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
  application_id: string
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

const CHAT_COMMAND = {
  name: 'chat',
  description: 'Chat with this agent',
  options: [{
    type: 3,
    name: 'message',
    description: 'Your message',
    required: true,
  }],
}

const RESET_COMMAND = {
  name: 'reset',
  description: 'Start a new conversation (clears chat history)',
}

const SESSION_COMMAND = {
  name: 'session',
  description: 'View your current chat session details (messages, duration)',
}

/**
 * Register (upsert) the /chat and /reset slash commands with Discord.
 * When guildId is provided the command is registered at the guild level
 * (updates instantly), otherwise globally (takes up to an hour to propagate).
 */
export async function registerDiscordCommands(
  botToken: string,
  applicationId: string,
  guildId?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = guildId
      ? `${DISCORD_API}/applications/${applicationId}/guilds/${guildId}/commands`
      : `${DISCORD_API}/applications/${applicationId}/commands`

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${botToken}`,
      },
      body: JSON.stringify([CHAT_COMMAND, RESET_COMMAND, SESSION_COMMAND]),
    })

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string }
      return { success: false, error: body.message || `Discord API error (${res.status})` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to register commands' }
  }
}

/**
 * Remove all global slash commands for the application.
 */
export async function removeDiscordCommands(
  botToken: string,
  applicationId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${DISCORD_API}/applications/${applicationId}/commands`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${botToken}`,
      },
      body: '[]',
    })

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string }
      return { success: false, error: body.message || `Discord API error (${res.status})` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to remove commands' }
  }
}

/**
 * Set the bot's nickname in a Discord guild (server).
 * Discord API: PATCH /guilds/{guildId}/members/{botUserId}
 * Bot user ID is typically the same as the application/client ID.
 */
export async function setBotNickname(
  botToken: string,
  guildId: string,
  botUserId: string,
  nickname: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${DISCORD_API}/guilds/${guildId}/members/${botUserId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${botToken}`,
      },
      body: JSON.stringify({ nick: nickname }),
    })

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string }
      return { success: false, error: body.message || `Discord API error (${res.status})` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to set nickname' }
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
 * to be sent back synchronously (PONG for pings, deferred for slash commands).
 *
 * Slash commands use a deferred response (type 5) to get past Discord's 3-second
 * timeout, then the AI reply is patched in via the webhook endpoint.
 */
export async function processDiscordInteraction(
  deploymentId: string,
  interaction: DiscordInteraction
): Promise<{ type: number; data?: { content?: string; flags?: number } }> {
  // Respond to Discord's PING handshake
  if (interaction.type === INTERACTION_TYPE_PING) {
    return { type: RESPONSE_TYPE_PONG }
  }

  if (interaction.type !== INTERACTION_TYPE_APPLICATION_COMMAND) {
    return { type: RESPONSE_TYPE_CHANNEL_MESSAGE, data: { content: 'Unsupported interaction.' } }
  }

  const commandName = interaction.data?.name

  // Handle /reset — close active conversation, start fresh
  if (commandName === 'reset') {
    void handleDiscordReset(deploymentId, interaction)
    return { type: RESPONSE_TYPE_DEFERRED_CHANNEL_MESSAGE }
  }

  // Handle /session — show chat metadata
  if (commandName === 'session') {
    void handleDiscordSession(deploymentId, interaction)
    return { type: RESPONSE_TYPE_DEFERRED_CHANNEL_MESSAGE }
  }

  const text = extractUserMessage(interaction)
  if (!text) {
    return { type: RESPONSE_TYPE_CHANNEL_MESSAGE, data: { content: 'Please provide a message.' } }
  }

  const discordUser = interaction.member?.user ?? interaction.user
  const contactId = discordUser?.id || interaction.channel_id || interaction.id
  const contactName = discordUser?.global_name || discordUser?.username || undefined
  const interactionToken = interaction.token

  // Return deferred response immediately (Discord gives us 15 minutes to follow up)
  void handleDiscordAiReply(deploymentId, text, contactId, contactName, interaction)
    .catch((err) => {
      console.error('[Discord] background processing error:', err)
    })

  return { type: RESPONSE_TYPE_DEFERRED_CHANNEL_MESSAGE }
}

async function handleDiscordReset(
  deploymentId: string,
  interaction: DiscordInteraction,
): Promise<void> {
  try {
    const deployment = await prisma.deployment.findUnique({ where: { id: deploymentId } })
    if (!deployment) {
      await patchDiscordEmbed(interaction, 'Deployment not found.')
      return
    }

    const discordUser = interaction.member?.user ?? interaction.user
    const contactId = discordUser?.id || interaction.channel_id || interaction.id

    // Close any active conversation for this user
    await prisma.conversation.updateMany({
      where: {
        agentId: deployment.agentId,
        channel: 'discord',
        contactPhone: contactId,
        status: { notIn: ['closed', 'archived'] },
      },
      data: { status: 'closed' },
    })

    await patchDiscordEmbed(interaction, '✅ Conversation reset! New chat started. Use `/chat message:...` to begin.')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Discord] handleDiscordReset error:', message)
    await patchDiscordEmbed(interaction, `Sorry, an error occurred: ${message}`)
  }
}

async function handleDiscordSession(
  deploymentId: string,
  interaction: DiscordInteraction,
): Promise<void> {
  try {
    const deployment = await prisma.deployment.findUnique({ where: { id: deploymentId } })
    if (!deployment) {
      await patchDiscordEmbed(interaction, 'Deployment not found.')
      return
    }

    const discordUser = interaction.member?.user ?? interaction.user
    const contactId = discordUser?.id || interaction.channel_id || interaction.id

    const conversation = await prisma.conversation.findFirst({
      where: {
        agentId: deployment.agentId,
        channel: 'discord',
        contactPhone: contactId,
        status: { notIn: ['closed', 'archived'] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { messages: true } },
      },
    })

    if (!conversation) {
      await patchDiscordEmbed(
        interaction,
        '📭 No active chat session found. Send a message with `/chat message:...` or @mention me to start one!',
      )
      return
    }

    const createdAt = conversation.createdAt.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    })
    const messageCount = conversation._count.messages
    const lastActivity = conversation.updatedAt.toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    })

    await patchDiscordEmbed(
      interaction,
      `📊 **Chat Session**\n\n` +
      `**Started:** ${createdAt}\n` +
      `**Last message:** ${lastActivity}\n` +
      `**Total messages:** ${messageCount}\n` +
      `**Status:** ${conversation.status}\n\n` +
      `Use \`/reset\` to start a fresh conversation.`,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Discord] handleDiscordSession error:', message)
    await patchDiscordEmbed(interaction, `Sorry, an error occurred: ${message}`)
  }
}

async function handleDiscordAiReply(
  deploymentId: string,
  text: string,
  contactId: string,
  contactName: string | undefined,
  interaction: DiscordInteraction,
): Promise<void> {
  try {
    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId },
      include: { agent: true },
    })
    if (!deployment) {
      await patchDiscordEmbed(interaction, 'Deployment not found.')
      return
    }

    const config = deployment.config as Record<string, unknown>
    const applicationId = config.applicationId as string | undefined
    const interactionToken = interaction.token

    if (!applicationId || !interactionToken) {
      await patchDiscordEmbed(interaction, 'Missing Discord configuration.')
      return
    }

    const agentId = deployment.agentId
    const discordUser = interaction.member?.user ?? interaction.user

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

    const replyText = reply || 'Sorry, I could not generate a response. Please try again.'

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: replyText,
      },
    })

    // Send embed reply
    const replied = await patchDiscordEmbed(interaction, replyText)
    const botToken = config.botToken as string | undefined

    // Create thread on first interaction for this conversation
    const convMeta = (conversation?.metadata || {}) as Record<string, unknown>
    if (botToken && replied.messageId && replied.channelId && !convMeta.threadId) {
      const threadName = `Chat with ${deployment.agent?.name || 'ai'}`
      const threadId = await createThread(botToken, replied.channelId, replied.messageId, threadName)
      if (threadId) {
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { metadata: { ...convMeta, threadId } },
        })
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Discord] handleDiscordAiReply error:', message)
    await patchDiscordEmbed(interaction, `Sorry, an error occurred: ${message}`)
  }
}

/**
 * Update the deferred Discord interaction response with an embed reply.
 */
async function patchDiscordEmbed(
  interaction: DiscordInteraction,
  text: string,
): Promise<{ messageId?: string; channelId?: string }> {
  if (!interaction.token) return {}
  try {
    const url = `${DISCORD_API}/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          description: text,
          color: BOT_COLOR,
          footer: { text: 'Convio AI' },
        }],
      }),
    })
    const data = res.ok ? await res.json().catch(() => ({})) : {}
    return { messageId: (data as { id?: string }).id, channelId: (data as { channel_id?: string }).channel_id }
  } catch (err) {
    console.error('[Discord] failed to patch embed reply:', err)
    return {}
  }
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

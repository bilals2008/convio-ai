import { prisma } from '@convio/database'
import { chatWithAgent } from '../../modules/ai/routes.js'
import { formatResponse } from '../formatters/index.js'
import { patchWebhookMessage, sendFollowupMessage, BOT_COLOR, sendChannelMessage, createThread, buildActionRow, buildButton } from './client.js'
import { checkRolePermission } from './permissions.js'
import type { DiscordInteraction, InteractionResponse } from './types.js'

const INTERACTION_TYPE_PING = 1
const INTERACTION_TYPE_APPLICATION_COMMAND = 2
const INTERACTION_TYPE_MESSAGE_COMPONENT = 3
const INTERACTION_TYPE_MODAL_SUBMIT = 5

const RESPONSE_TYPE_PONG = 1
const RESPONSE_TYPE_CHANNEL_MESSAGE = 4
const RESPONSE_TYPE_DEFERRED_CHANNEL_MESSAGE = 5
const RESPONSE_TYPE_DEFERRED_UPDATE = 6

const processedInteractions = new Set<string>()
const MAX_CACHED_INTERACTIONS = 500

async function getDeployment(deploymentId: string) {
  return prisma.deployment.findUnique({
    where: { id: deploymentId },
    include: { agent: true },
  })
}

function getContactInfo(interaction: DiscordInteraction) {
  const discordUser = interaction.member?.user ?? interaction.user
  return {
    userId: discordUser?.id || interaction.channel_id || interaction.id,
    name: discordUser?.global_name || discordUser?.username || undefined,
  }
}

export async function processDiscordInteraction(
  deploymentId: string,
  interaction: DiscordInteraction
): Promise<InteractionResponse> {
  if (processedInteractions.has(interaction.id)) {
    return { type: RESPONSE_TYPE_DEFERRED_CHANNEL_MESSAGE }
  }
  if (processedInteractions.size >= MAX_CACHED_INTERACTIONS) processedInteractions.clear()
  processedInteractions.add(interaction.id)

  if (interaction.type === INTERACTION_TYPE_PING) {
    return { type: RESPONSE_TYPE_PONG }
  }

  const deployment = await getDeployment(deploymentId)
  if (!deployment) {
    return { type: RESPONSE_TYPE_CHANNEL_MESSAGE, data: { content: 'Deployment not found.', flags: 64 } }
  }

  const config = deployment.config as Record<string, unknown>
  const allowedRoles = config.allowedRoles as string[] | undefined
  const userRoles = interaction.member?.roles

  if (!checkRolePermission(userRoles, allowedRoles)) {
    return {
      type: RESPONSE_TYPE_CHANNEL_MESSAGE,
      data: { content: '❌ You don\'t have permission to use this command.', flags: 64 },
    }
  }

  if (interaction.type === INTERACTION_TYPE_MESSAGE_COMPONENT) {
    return handleComponentInteraction(deploymentId, interaction)
  }

  if (interaction.type === INTERACTION_TYPE_MODAL_SUBMIT) {
    return handleModalSubmit(deploymentId, interaction)
  }

  if (interaction.type !== INTERACTION_TYPE_APPLICATION_COMMAND) {
    return { type: RESPONSE_TYPE_CHANNEL_MESSAGE, data: { content: 'Unsupported interaction.' } }
  }

  const commandName = interaction.data?.name

  if (commandName === 'reset') {
    void handleReset(deploymentId, interaction)
    return { type: RESPONSE_TYPE_DEFERRED_CHANNEL_MESSAGE, data: { flags: 64 } }
  }

  if (commandName === 'session') {
    void handleSession(deploymentId, interaction)
    return { type: RESPONSE_TYPE_DEFERRED_CHANNEL_MESSAGE, data: { flags: 64 } }
  }

  if (commandName === 'chat') {
    const text = extractUserMessage(interaction)
    if (!text) {
      return { type: RESPONSE_TYPE_CHANNEL_MESSAGE, data: { content: 'Please provide a message.', flags: 64 } }
    }
    void handleAiReply(deploymentId, text, interaction)
    return { type: RESPONSE_TYPE_DEFERRED_CHANNEL_MESSAGE }
  }

  return { type: RESPONSE_TYPE_CHANNEL_MESSAGE, data: { content: `Unknown command: /${commandName}`, flags: 64 } }
}

function handleComponentInteraction(
  deploymentId: string,
  interaction: DiscordInteraction
): InteractionResponse {
  const customId = interaction.data?.custom_id || ''

  // ponytail: simple component routing, expand when more component types needed
  if (customId.startsWith('help_')) {
    const section = customId.replace('help_', '')
    const helpContent: Record<string, string> = {
      chat: 'Use `/chat message:your text` or @mention me anywhere to start a conversation.',
      reset: 'Use `/reset` to clear your chat history and start fresh.',
      session: 'Use `/session` to see your active conversation stats.',
    }
    void patchWebhookMessage(interaction.application_id, interaction.token!, {
      embeds: [{ description: helpContent[section] || 'Select a topic above.', color: BOT_COLOR }],
      components: [
        buildActionRow([
          buildButton('help_chat', 'Chat', 2),
          buildButton('help_reset', 'Reset', 2),
          buildButton('help_session', 'Session', 2),
        ]),
      ],
    })
    return { type: RESPONSE_TYPE_DEFERRED_UPDATE }
  }

  return { type: RESPONSE_TYPE_DEFERRED_UPDATE }
}

function handleModalSubmit(
  _deploymentId: string,
  _interaction: DiscordInteraction
): InteractionResponse {
  // ponytail: modal handler, add when modals are used for structured input
  return { type: RESPONSE_TYPE_CHANNEL_MESSAGE, data: { content: 'Modal received.', flags: 64 } }
}

function extractUserMessage(interaction: DiscordInteraction): string | undefined {
  const options = interaction.data?.options
  if (!options || options.length === 0) return undefined
  const messageOption = options.find((o) => o.name === 'message') ?? options[0]
  return typeof messageOption?.value === 'string' ? messageOption.value : undefined
}

async function handleReset(deploymentId: string, interaction: DiscordInteraction) {
  try {
    const deployment = await getDeployment(deploymentId)
    if (!deployment) {
      await patchWebhookMessage(interaction.application_id, interaction.token!, {
        embeds: [{ description: 'Deployment not found.', color: BOT_COLOR }],
      })
      return
    }

    const { userId, name: contactName } = getContactInfo(interaction)

    // Close active conversation (kept for analytics), create a new one
    await prisma.conversation.updateMany({
      where: { agentId: deployment.agentId, channel: 'discord', contactPhone: userId, status: 'active' },
      data: { status: 'closed' },
    })

    await prisma.conversation.create({
      data: {
        agentId: deployment.agentId,
        channel: 'discord',
        status: 'active',
        contactName: contactName || null,
        contactPhone: userId,
        metadata: { channelId: interaction.channel_id, guildId: interaction.guild_id },
      },
    })

    await patchWebhookMessage(interaction.application_id, interaction.token!, {
      embeds: [{
        description: '✅ Conversation reset! New chat started. Use `/chat message:...` to begin.',
        color: BOT_COLOR,
      }],
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Discord] reset error:', message)
    await patchWebhookMessage(interaction.application_id, interaction.token!, {
      embeds: [{ description: `Sorry, an error occurred: ${message}`, color: BOT_COLOR }],
    })
  }
}

async function handleSession(deploymentId: string, interaction: DiscordInteraction) {
  try {
    const deployment = await getDeployment(deploymentId)
    if (!deployment) {
      await patchWebhookMessage(interaction.application_id, interaction.token!, {
        embeds: [{ description: 'Deployment not found.', color: BOT_COLOR }],
      })
      return
    }

    const { userId } = getContactInfo(interaction)

    const conversation = await prisma.conversation.findFirst({
      where: {
        agentId: deployment.agentId,
        channel: 'discord',
        contactPhone: userId,
        status: { notIn: ['closed', 'archived'] },
      },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { messages: true } } },
    })

    if (!conversation) {
      await patchWebhookMessage(interaction.application_id, interaction.token!, {
        embeds: [{
          description: '📭 No active chat session found. Use `/chat message:...` or @mention me to start one!',
          color: BOT_COLOR,
        }],
      })
      return
    }

    const started = conversation.createdAt.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
    })
    const last = conversation.updatedAt.toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    })

    await patchWebhookMessage(interaction.application_id, interaction.token!, {
      embeds: [{
        description:
          `📊 **Chat Session**\n\n**Started:** ${started}\n**Last message:** ${last}\n` +
          `**Total messages:** ${conversation._count.messages}\n**Status:** ${conversation.status}`,
        color: BOT_COLOR,
      }],
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Discord] session error:', message)
    await patchWebhookMessage(interaction.application_id, interaction.token!, {
      embeds: [{ description: `Sorry, an error occurred: ${message}`, color: BOT_COLOR }],
    })
  }
}

async function handleAiReply(
  deploymentId: string,
  text: string,
  interaction: DiscordInteraction,
) {
  try {
    const deployment = await getDeployment(deploymentId)
    if (!deployment) {
      await patchWebhookMessage(interaction.application_id, interaction.token!, {
        embeds: [{ description: 'Deployment not found.', color: BOT_COLOR }],
      })
      return
    }

    const config = deployment.config as Record<string, unknown>
    const botToken = config.botToken as string | undefined
    const contactId = getContactInfo(interaction).userId
    const contactName = getContactInfo(interaction).name

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
      data: { conversationId: conversation.id, role: 'user', content: text, metadata: { userId: contactId, providerMessageId: interaction.id } },
    })

    const history = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 50,
    })

    const reply = await chatWithAgent(
      deployment.agentId,
      history.map((m) => ({ role: m.role, content: m.content }))
    )

    const replyText = formatResponse('discord', reply || 'Sorry, I could not generate a response. Please try again.')

    const assistantMsg = await prisma.message.create({
      data: { conversationId: conversation.id, role: 'assistant', content: reply },
    })

    let replied: { id?: string; channel_id?: string } = {}
    try {
      replied = await patchWebhookMessage(interaction.application_id, interaction.token!, {
        embeds: [{ description: replyText, color: BOT_COLOR, footer: { text: 'Convio AI' } }],
      })
    } catch {
        replied = await sendFollowupMessage(interaction.application_id, interaction.token!, {
        embeds: [{ description: replyText, color: BOT_COLOR, footer: { text: 'Convio AI' } }],
      })
    }

    // Store message ID for edit support
    if (replied.id) {
      await prisma.message.update({
        where: { id: assistantMsg.id },
        data: { metadata: { discordMessageId: replied.id } as any },
      })
    }

    // Per-user thread (not per-conversation) for multi-channel support
    const convMeta = (conversation?.metadata || {}) as Record<string, unknown>
    if (botToken && replied.id && replied.channel_id && !convMeta.threadId) {
      const threadName = `Chat with ${deployment.agent?.name || 'ai'}`
      const threadId = await createThread(botToken, replied.channel_id, replied.id, threadName)
      if (threadId) {
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { metadata: { ...convMeta, threadId } },
        })
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Discord] AI reply error:', message)
    try {
      await patchWebhookMessage(interaction.application_id, interaction.token!, {
        embeds: [{ description: `Sorry, an error occurred: ${message}`, color: BOT_COLOR }],
      })
    } catch {
      await sendFollowupMessage(interaction.application_id, interaction.token!, {
        embeds: [{ description: `Sorry, an error occurred: ${message}`, color: BOT_COLOR }],
      }).catch(() => {})
    }
  }
}

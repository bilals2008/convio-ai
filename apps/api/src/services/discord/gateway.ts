import { prisma } from '@convio/database'
import { chatWithAgent } from '../../modules/ai/routes.js'
import { formatResponse } from '../formatters/index.js'
import { sendChannelMessage, editMessage, deleteMessage, BOT_COLOR } from './client.js'
import { sendOnboarding } from './onboarding.js'

export async function handleMessageUpdate(data: any, botToken: string) {
  // ponytail: only handle content edits, ignore embed/attachment changes
  if (!data.id || !data.content || data.author?.bot) return

  const message = await prisma.message.findFirst({
    where: { metadata: { path: ['discordMessageId'], equals: data.id } },
    select: { id: true, content: true, conversationId: true },
  })
  if (!message || message.content === data.content) return

  // Update the stored message content
  await prisma.message.update({
    where: { id: message.id },
    data: { content: data.content },
  })

  // Find the bot's reply to this user message and regenerate
  const botReply = await prisma.message.findFirst({
    where: { conversationId: message.conversationId, role: 'assistant' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, content: true },
  })
  if (!botReply) return

  const conversation = await prisma.conversation.findUnique({
    where: { id: message.conversationId },
    include: { agent: { include: { deployments: { where: { channel: 'discord' } } } } },
  })
  if (!conversation) return

  const deployment = conversation.agent.deployments[0]
  if (!deployment) return

  const config = deployment.config as Record<string, unknown>
  const channelId = (conversation.metadata as Record<string, unknown>)?.channelId as string | undefined
  if (!channelId) return

  // Find the bot's reply message ID from metadata
  const botMsg = await prisma.message.findUnique({
    where: { id: botReply.id },
    select: { metadata: true },
  })
  const botMessageId = (botMsg?.metadata as Record<string, unknown>)?.discordMessageId as string | undefined
  if (!botMessageId) return

  // Re-generate with updated context
  const history = await prisma.message.findMany({
    where: { conversationId: message.conversationId },
    orderBy: { createdAt: 'asc' },
    take: 50,
  })

  try {
    const reply = await chatWithAgent(
      deployment.agentId,
      history.map((m) => ({ role: m.role, content: m.content }))
    )

    const replyText = formatResponse('discord', reply || 'Sorry, I could not generate a response.')

    await editMessage(botToken, channelId, botMessageId, {
      embeds: [{ description: replyText, color: BOT_COLOR, footer: { text: 'Convio AI (edited)' } }],
    })

    await prisma.message.update({
      where: { id: botReply.id },
      data: { content: reply },
    })
  } catch (err) {
    console.error('[Discord Gateway] Message update error:', err)
  }
}

const EMOJI_ACTIONS: Record<string, (botToken: string, channelId: string, messageId: string) => Promise<void>> = {
  '👍': async (botToken, channelId) => {
    await sendChannelMessage(botToken, channelId, {
      embeds: [{ description: 'Glad that helped! 👍', color: BOT_COLOR }],
    })
  },
  '❌': async (botToken, channelId, messageId) => {
    await deleteMessage(botToken, channelId, messageId)
  },
}

export async function handleMessageReaction(data: any, botToken: string) {
  // ponytail: skip own reactions and non-bot-message reactions
  if (!data.message_id || data.member?.user?.id === data.user_id) return

  const emoji = data.emoji?.name
  if (!emoji) return

  const action = EMOJI_ACTIONS[emoji]
  if (!action) return

  await action(botToken, data.channel_id, data.message_id)
}

export async function handleGuildCreate(data: any, botToken: string) {
  const guildId = data.id
  if (!guildId) return

  const channels = data.channels as any[] | undefined
  if (!channels || !Array.isArray(channels)) return

  const textChannel = channels.find(
    (c: any) => c.type === 0 && c.permissions && (BigInt(c.permissions) & BigInt(2048)) === BigInt(2048)
  )
  if (!textChannel) return

  await sendOnboarding(guildId, botToken, textChannel.id)
}

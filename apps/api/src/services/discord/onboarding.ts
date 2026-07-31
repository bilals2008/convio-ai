import { prisma } from '@convio/database'
import { sendChannelMessage, BOT_COLOR, buildActionRow, buildLinkButton } from './client.js'

export async function sendOnboarding(
  guildId: string,
  botToken: string,
  textChannelId: string
): Promise<void> {
  const deployment = await prisma.deployment.findFirst({
    where: { channel: 'discord', config: { path: ['guildId'], equals: guildId } },
    include: { agent: true },
  })
  if (!deployment) return

  const conversations = await prisma.conversation.count({
    where: { agentId: deployment.agentId, channel: 'discord', metadata: { path: ['guildId'], equals: guildId } },
  })
  if (conversations > 0) return

  const agentName = deployment.agent?.name || 'AI assistant'

  await sendChannelMessage(botToken, textChannelId, {
    embeds: [{
      title: `👋 Hi! I'm ${agentName}, your Convio AI assistant!`,
      description:
        'I\'m here to help your server. Here\'s how to use me:\n\n' +
        `• **@mention me** — Send a message anywhere and I'll reply\n` +
        '• **`/chat message:...`** — Chat with me using slash commands\n' +
        '• **`/reset`** — Clear your chat history and start fresh\n' +
        '• **`/session`** — Check your current conversation status\n\n' +
        'Every conversation is private. Try saying hi!',
      color: BOT_COLOR,
      footer: { text: 'Convio AI' },
    }],
    components: [
      buildActionRow([
        buildLinkButton('Get Started', 'https://convio-blush.vercel.app/docs/discord'),
        buildLinkButton('Configure', `https://convio-blush.vercel.app/settings?tab=deployments`),
      ]),
    ],
  })
}

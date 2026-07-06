import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Demo Org',
      slug: 'demo',
    },
  })

  const agent = await prisma.agent.upsert({
    where: { id: 'demo-agent' },
    update: {},
    create: {
      id: 'demo-agent',
      organizationId: org.id,
      name: 'Support Bot',
      model: 'gpt-4o-mini',
      systemPrompt: 'You are a helpful support agent.',
      temperature: 0.7,
      maxTokens: 2048,
    },
  })

  const bot = await prisma.bot.upsert({
    where: { id: 'demo-bot' },
    update: {},
    create: {
      id: 'demo-bot',
      organizationId: org.id,
      agentId: agent.id,
      name: 'Demo Widget Bot',
      widgetColor: '#fb923c',
      welcomeMessage: 'Hi! How can I help you today?',
      status: 'active',
    },
  })

  console.log('Seeded:', { org: org.name, agent: agent.name, bot: bot.name })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

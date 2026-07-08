import { getPrisma } from '../src/index.js'

const prisma = getPrisma()

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

async function main() {
  const profile = await prisma.profile.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: {
      id: DEMO_USER_ID,
      email: 'demo@convio.dev',
      name: 'Demo User',
    },
  })

  const org = await prisma.organization.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Demo Org',
      slug: 'demo',
    },
  })

  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: DEMO_USER_ID, organizationId: org.id } },
    update: {},
    create: {
      userId: DEMO_USER_ID,
      organizationId: org.id,
      role: 'owner',
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

  console.log('Seeded:', { profile: profile.name, org: org.name, agent: agent.name, bot: bot.name })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

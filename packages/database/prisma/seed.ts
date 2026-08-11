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
      name: 'Support Agent',
      model: 'gpt-4o-mini',
      systemPrompt: 'You are a helpful support agent.',
      temperature: 0.7,
      maxTokens: 2048,
      widgetColor: '#fb923c',
      welcomeMessage: 'Hi! How can I help you today?',
      status: 'active',
    },
  })

  const DEFAULT_PLANS = [
    {
      key: 'free',
      name: 'Free',
      description: 'Perfect for getting started',
      price: '$0',
      priceMonthly: 0,
      yearlyPrice: '$0',
      period: 'forever',
      features: [
        { text: '1 AI agent' },
        { text: '1 knowledge base' },
        { text: '500 messages/mo' },
        { text: 'Web widget' },
        { text: 'Basic analytics' },
      ],
      limits: { agents: 1, messagesPerMonth: 500, knowledgeBases: 1, organizations: 1 },
      cta: 'Get Started',
      href: '/signup',
      variant: 'outline',
      highlighted: false,
      icon: 'zap',
      iconColor: 'text-muted-foreground',
      sortOrder: 0,
    },
    {
      key: 'starter',
      name: 'Starter',
      description: 'For small businesses',
      price: '$19',
      priceMonthly: 19,
      yearlyPrice: '$15',
      period: '/month',
      badge: 'Best Value',
      features: [
        { text: '3 AI agents' },
        { text: '3 knowledge bases' },
        { text: '5,000 messages/mo' },
        { text: 'Web + WhatsApp' },
        { text: 'API access' },
      ],
      limits: { agents: 3, messagesPerMonth: 5000, knowledgeBases: 3, organizations: 1 },
      cta: 'Start Free Trial',
      href: '/signup',
      variant: 'outline',
      highlighted: false,
      icon: 'star',
      iconColor: 'text-info',
      sortOrder: 1,
    },
    {
      key: 'pro',
      name: 'Pro',
      description: 'For growing businesses',
      price: '$39',
      priceMonthly: 39,
      yearlyPrice: '$31',
      period: '/month',
      badge: 'Most Popular',
      features: [
        { text: '10 AI agents' },
        { text: '10 knowledge bases' },
        { text: '25,000 messages/mo' },
        { text: 'All channels' },
        { text: 'Advanced analytics' },
        { text: 'API access' },
        { text: 'Priority support' },
      ],
      limits: { agents: 10, messagesPerMonth: 25000, knowledgeBases: 10, organizations: 3 },
      cta: 'Start Free Trial',
      href: '/signup',
      variant: 'default',
      highlighted: true,
      icon: 'crown',
      iconColor: 'text-primary',
      sortOrder: 2,
    },
    {
      key: 'business',
      name: 'Business',
      description: 'For growing teams',
      price: '$99',
      priceMonthly: 99,
      yearlyPrice: '$79',
      period: '/month',
      features: [
        { text: 'Unlimited AI agents' },
        { text: '50 knowledge bases' },
        { text: '150,000 messages/mo' },
        { text: 'Custom branding' },
        { text: 'Priority support' },
      ],
      limits: { agents: null, messagesPerMonth: 150000, knowledgeBases: 50, organizations: 5 },
      cta: 'Start Free Trial',
      href: '/signup',
      variant: 'outline',
      highlighted: false,
      icon: 'shield',
      iconColor: 'text-chart-3',
      sortOrder: 3,
    },
    {
      key: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations',
      price: 'Custom',
      priceMonthly: null,
      period: '',
      features: [
        { text: 'Unlimited AI agents' },
        { text: 'Unlimited knowledge bases' },
        { text: 'Unlimited messages' },
        { text: 'SSO / SAML' },
        { text: 'Dedicated onboarding' },
        { text: 'Volume discounts' },
        { text: 'SLA guarantee' },
      ],
      limits: { agents: null, messagesPerMonth: null, knowledgeBases: null, organizations: null },
      cta: 'Contact Sales',
      href: 'mailto:teambilaldev@gmail.com',
      variant: 'outline',
      highlighted: false,
      icon: 'shield',
      iconColor: 'text-chart-4',
      sortOrder: 4,
    },
  ]

  for (const plan of DEFAULT_PLANS) {
    const existing = await prisma.plan.findUnique({ where: { key: plan.key } })
    if (!existing) {
      await prisma.plan.create({ data: plan as any })
    }
  }

  console.log('Seeded:', { profile: profile.name, org: org.name, agent: agent.name, plans: DEFAULT_PLANS.length })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

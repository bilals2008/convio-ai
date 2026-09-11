export interface PlanFeature {
  text: string
  included?: boolean
}

export interface PlanLimits {
  agents: number | 'unlimited'
  knowledgeBases: number | 'unlimited'
  messagesPerMonth: number | 'unlimited'
  deploymentChannels: string[]
  tools: boolean
  mcpServers: boolean
  knowledgeBaseRag: boolean
  capabilities: boolean
  guardrails: boolean
}

export interface PlanConfig {
  key: string
  name: string
  description: string
  price: string
  yearlyPrice?: string
  period: string
  badge?: string
  comingSoon?: boolean
  features: PlanFeature[]
  limits: PlanLimits
  cta: string
  href: string
  variant: 'default' | 'outline'
  highlighted: boolean
  icon?: 'zap' | 'shield' | 'star' | 'crown'
  iconColor?: string
}

export interface PricingConfig {
  plans: PlanConfig[]
  footer: string
  section: {
    eyebrow: string
    title: string
    description: string
  }
}

export function getPlanFeatures(planKey: string): PlanLimits {
  const plan = pricingConfig.plans.find((p) => p.key === planKey)
  if (!plan) return DEFAULT_LIMITS
  return plan.limits
}

export const DEFAULT_LIMITS: PlanLimits = {
  agents: 1,
  knowledgeBases: 1,
  messagesPerMonth: 500,
  deploymentChannels: ['web-chat-widget'],
  tools: false,
  mcpServers: false,
  knowledgeBaseRag: false,
  capabilities: false,
  guardrails: false,
}

export const pricingConfig: PricingConfig = {
  section: {
    eyebrow: 'Pricing',
    title: 'Simple, transparent pricing',
    description:
      'Start free and upgrade as you grow. Every plan includes access to RAG and community support.',
  },
  plans: [
    {
      key: 'free',
      name: 'Free',
      description: 'Perfect for getting started',
      price: '$0',
      yearlyPrice: '$0',
      period: 'forever',
      features: [
        { text: '1 AI agent' },
        { text: '1 knowledge base' },
        { text: '500 messages/mo' },
        { text: 'Web widget' },
        { text: 'Basic analytics' },
      ],
      limits: {
        agents: 1,
        knowledgeBases: 1,
        messagesPerMonth: 500,
        deploymentChannels: ['web-chat-widget'],
        tools: false,
        mcpServers: false,
        knowledgeBaseRag: true,
        capabilities: false,
        guardrails: false,
      },
      cta: 'Get Started',
      href: '/signup',
      variant: 'outline',
      highlighted: false,
      icon: 'zap',
      iconColor: 'text-muted-foreground',
    },
    {
      key: 'starter',
      name: 'Starter',
      description: 'For small businesses',
      price: '$19',
      yearlyPrice: '$15',
      period: '/month',
      features: [
        { text: '3 AI agents' },
        { text: '3 knowledge bases' },
        { text: '5,000 messages/mo' },
        { text: 'Web + WhatsApp' },
        { text: 'API access' },
        { text: '14-day free trial' },
      ],
      limits: {
        agents: 3,
        knowledgeBases: 3,
        messagesPerMonth: 5000,
        deploymentChannels: ['web-chat-widget', 'whatsapp'],
        tools: false,
        mcpServers: false,
        knowledgeBaseRag: true,
        capabilities: true,
        guardrails: true,
      },
      cta: 'Start Free Trial',
      href: '/signup',
      variant: 'outline',
      highlighted: false,
      icon: 'star',
      iconColor: 'text-info',
    },
    {
      key: 'pro',
      name: 'Pro',
      description: 'For growing businesses',
      price: '$39',
      yearlyPrice: '$31',
      period: '/month',
      badge: 'Best Value',
      features: [
        { text: '10 AI agents' },
        { text: '10 knowledge bases' },
        { text: '25,000 messages/mo' },
        { text: 'All channels' },
        { text: 'Advanced analytics' },
        { text: 'API access' },
        { text: 'Priority support' },
        { text: '14-day free trial' },
      ],
      limits: {
        agents: 10,
        knowledgeBases: 10,
        messagesPerMonth: 25000,
        deploymentChannels: ['web-chat-widget', 'shareable-link', 'whatsapp'],
        tools: true,
        mcpServers: true,
        knowledgeBaseRag: true,
        capabilities: true,
        guardrails: true,
      },
      cta: 'Start Free Trial',
      href: '/signup',
      variant: 'default',
      highlighted: true,
      icon: 'crown',
      iconColor: 'text-primary',
    },
    {
      key: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations',
      price: 'Custom',
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
      limits: {
        agents: 'unlimited',
        knowledgeBases: 'unlimited',
        messagesPerMonth: 'unlimited',
        deploymentChannels: ['web-chat-widget', 'shareable-link', 'whatsapp'],
        tools: true,
        mcpServers: true,
        knowledgeBaseRag: true,
        capabilities: true,
        guardrails: true,
      },
      cta: 'Contact Sales',
      href: 'mailto:teambilaldev@gmail.com',
      variant: 'outline',
      highlighted: false,
      icon: 'shield',
      iconColor: 'text-chart-4',
    },
  ],
  footer: 'All plans include RAG and community access. Prices in USD.',
}

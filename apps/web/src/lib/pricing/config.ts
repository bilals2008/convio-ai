export interface PlanFeature {
  text: string
  included?: boolean
}

export interface PlanLimits {
  agents: number | 'unlimited'
  knowledgeBases: number | 'unlimited'
  messagesPerMonth: number | 'unlimited'
  organizations: number | 'unlimited'
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

const NUMERIC_LIMIT_KEYS = ['agents', 'messagesPerMonth', 'knowledgeBases', 'organizations'] as const

// The API returns the limits billing actually enforces; the local config only carries
// the capability flags it does not send. Remote numbers therefore win, and the local
// config stays a pure fallback for when the API is unavailable.
export function mergePlanLimits(remote?: Partial<PlanLimits> | null, planKey?: string): PlanLimits {
  const base = planKey ? getPlanFeatures(planKey) : DEFAULT_LIMITS
  if (!remote) return base

  const merged = { ...base }
  for (const key of NUMERIC_LIMIT_KEYS) {
    const value = remote[key]
    if (typeof value === 'number' || value === 'unlimited') merged[key] = value
  }
  return merged
}

export const DEFAULT_LIMITS: PlanLimits = {
  agents: 1,
  knowledgeBases: 1,
  messagesPerMonth: 500,
  organizations: 1,
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
        messagesPerMonth: 1000,
        organizations: 1,
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
      key: 'business',
      name: 'Business',
      description: 'For growing teams',
      price: '$99',
      yearlyPrice: '$79',
      period: '/month',
      features: [
        { text: 'Unlimited AI agents' },
        { text: '50 knowledge bases' },
        { text: '150,000 messages/mo' },
        { text: 'Custom branding' },
        { text: 'All channels' },
        { text: 'Priority support' },
      ],
      limits: {
        agents: 'unlimited',
        knowledgeBases: 50,
        messagesPerMonth: 150000,
        organizations: 5,
        deploymentChannels: ['web-chat-widget', 'shareable-link', 'whatsapp'],
        tools: true,
        mcpServers: true,
        knowledgeBaseRag: true,
        capabilities: true,
        guardrails: true,
      },
      cta: 'Get started',
      href: '/signup',
      variant: 'outline',
      highlighted: false,
      icon: 'star',
      iconColor: 'text-chart-3',
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
      ],
      limits: {
        agents: 10,
        knowledgeBases: 10,
        messagesPerMonth: 25000,
        organizations: 10,
        deploymentChannels: ['web-chat-widget', 'shareable-link', 'whatsapp'],
        tools: true,
        mcpServers: true,
        knowledgeBaseRag: true,
        capabilities: true,
        guardrails: true,
      },
      cta: 'Get started',
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
        organizations: 'unlimited',
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

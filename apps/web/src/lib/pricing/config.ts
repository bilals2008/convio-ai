export interface PlanFeature {
  text: string
  included?: boolean
}

export interface PlanConfig {
  key: string
  name: string
  description: string
  price: string
  period: string
  badge?: string
  features: PlanFeature[]
  cta: string
  href: string
  variant: 'default' | 'outline'
  highlighted: boolean
  productId?: string
  variantId?: string
  icon?: 'zap' | 'shield' | 'star'
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
      period: 'forever',
      features: [
        { text: '1 AI agent' },
        { text: '1 knowledge base' },
        { text: '500 messages/mo' },
        { text: 'Web widget' },
        { text: 'Basic analytics' },
      ],
      cta: 'Get Started',
      href: '/signup',
      variant: 'outline',
      highlighted: false,
    },
    {
      key: 'pro',
      name: 'Pro',
      description: 'For growing businesses',
      price: '$39',
      period: '/month',
      badge: 'Most Popular',
      features: [
        { text: '5 agents' },
        { text: '10 knowledge bases' },
        { text: '25,000 messages/mo' },
        { text: 'Multi-channel' },
        { text: 'Advanced analytics' },
      ],
      cta: 'Start Free Trial',
      href: '/signup',
      variant: 'default',
      highlighted: true,
      icon: 'zap',
    },
    {
      key: 'business',
      name: 'Business',
      description: 'For scaling teams',
      price: '$99',
      period: '/month',
      badge: 'Best Value',
      features: [
        { text: 'Unlimited agents' },
        { text: '50 knowledge bases' },
        { text: '150,000 messages/mo' },
        { text: 'Multi-channel' },
        { text: 'Custom branding' },
        { text: 'Priority support' },
      ],
      cta: 'Get Started',
      href: '/signup',
      variant: 'outline',
      highlighted: false,
      icon: 'star',
    },
    {
      key: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations',
      price: 'Custom',
      period: '',
      features: [
        { text: 'Unlimited agents' },
        { text: 'Unlimited knowledge bases' },
        { text: 'Unlimited messages' },
        { text: 'SSO / SAML' },
        { text: 'Dedicated support' },
        { text: 'SLA guarantee' },
      ],
      cta: 'Contact Sales',
      href: 'mailto:sales@convio.ai',
      variant: 'outline',
      highlighted: false,
      icon: 'shield',
    },
  ],
  footer: 'All plans include RAG and community access. Prices in USD.',
}

export interface PlanFeature {
  text: string
  included?: boolean
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
      badge: 'Best Value',
      features: [
        { text: '3 AI agents' },
        { text: '3 knowledge bases' },
        { text: '5,000 messages/mo' },
        { text: 'Web + WhatsApp' },
        { text: 'API access' },
      ],
      cta: 'Start Free Trial',
      href: '/signup',
      variant: 'outline',
      highlighted: false,
      icon: 'star',
      iconColor: 'text-blue-500',
    },
    {
      key: 'pro',
      name: 'Pro',
      description: 'For growing businesses',
      price: '$39',
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
      cta: 'Start Free Trial',
      href: '/signup',
      variant: 'default',
      highlighted: true,
      icon: 'crown',
      iconColor: 'text-emerald-500',
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
      cta: 'Contact Sales',
      href: 'mailto:teambilaldev@gmail.com',
      variant: 'outline',
      highlighted: false,
      icon: 'shield',
      iconColor: 'text-violet-500',
    },
  ],
  footer: 'All plans include RAG and community access. Prices in USD.',
}

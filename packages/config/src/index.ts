// App config
export const APP_NAME = 'Convio'
export const APP_DESCRIPTION = 'AI Agent Management Platform'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// API config
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
export const API_PREFIX = '/v1'

// Auth config
export const AUTH_SECRET = process.env.AUTH_SECRET || ''
export const AUTH_URL = `${API_URL}/api/auth`

// Database config
export const DATABASE_URL = process.env.DATABASE_URL || ''

// AI config
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''
export const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || ''
export const GROQ_API_KEY = process.env.GROQ_API_KEY || ''

// Storage config
export const STORAGE_BUCKET = process.env.STORAGE_BUCKET || 'convio'

// Billing config
export const CREEM_API_KEY = process.env.CREEM_API_KEY || ''
export const CREEM_WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET || ''
export const CREEM_TEST_MODE = process.env.NODE_ENV !== 'production'

export const PLANS: Record<string, {
  label: string
  features: string[]
  limits: { agents: number; messagesPerMonth: number; knowledgeBases: number }
  price: string
  priceMonthly: number
  providerProductId?: string
}> = {
  free: {
    label: 'Free',
    features: ['1 agent', '1,000 messages/mo', 'Web widget', 'Basic analytics'],
    limits: { agents: 1, messagesPerMonth: 1000, knowledgeBases: 1 },
    price: '$0',
    priceMonthly: 0,
  },
  pro: {
    label: 'Pro',
    features: ['Unlimited agents', '50,000 messages/mo', 'Multi-channel', 'Advanced analytics', 'Custom branding'],
    limits: { agents: Infinity, messagesPerMonth: 50000, knowledgeBases: 10 },
    price: '$29/mo',
    priceMonthly: 29,
    providerProductId: process.env.CREEM_PRO_PRODUCT_ID || '',
  },
  enterprise: {
    label: 'Enterprise',
    features: ['Everything in Pro', 'Unlimited messages', 'SSO', 'Dedicated support', 'SLA'],
    limits: { agents: Infinity, messagesPerMonth: Infinity, knowledgeBases: Infinity },
    price: 'Custom',
    priceMonthly: 0,
    providerProductId: process.env.CREEM_ENTERPRISE_PRODUCT_ID || '',
  },
}

export const LIMITS = Object.fromEntries(
  Object.entries(PLANS).map(([k, v]) => [k, v.limits])
) as Record<string, { agents: number; messagesPerMonth: number; knowledgeBases: number }>

// Channels
export const CHANNELS = ['web', 'api', 'whatsapp', 'telegram', 'discord', 'slack'] as const

// AI Models
export const AI_MODELS = [
  { id: 'gpt-4o', provider: 'openai', name: 'GPT-4o' },
  { id: 'gpt-4o-mini', provider: 'openai', name: 'GPT-4o Mini' },
  { id: 'claude-3-5-sonnet', provider: 'anthropic', name: 'Claude 3.5 Sonnet' },
  { id: 'claude-3-haiku', provider: 'anthropic', name: 'Claude 3 Haiku' },
  { id: 'gemini-1.5-pro', provider: 'google', name: 'Gemini 1.5 Pro' },
  { id: 'gemini-1.5-flash', provider: 'google', name: 'Gemini 1.5 Flash' },
  { id: 'llama-3.1-70b', provider: 'groq', name: 'Llama 3.1 70B' },
] as const

// Routes
export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  agents: '/agents',
  agentEditor: (id: string) => `/agents/${id}`,
  deployments: '/deployments',
  conversations: '/conversations',
  chat: (id: string) => `/conversations/${id}`,
  knowledge: '/knowledge',
  analytics: '/analytics',
  settings: '/settings',
} as const

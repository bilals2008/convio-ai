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

// Limits
export const LIMITS = {
  free: {
    agents: 1,
    messagesPerDay: 100,
    knowledgeBases: 1,
    documentsPerKB: 5,
  },
  pro: {
    agents: Infinity,
    messagesPerDay: 10000,
    knowledgeBases: 10,
    documentsPerKB: 100,
  },
  enterprise: {
    agents: Infinity,
    messagesPerDay: Infinity,
    knowledgeBases: Infinity,
    documentsPerKB: Infinity,
  },
} as const

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

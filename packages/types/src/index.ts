// User types
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

// Organization types
export interface Organization {
  id: string
  name: string
  slug: string
  logo?: string
  plan: 'free' | 'pro' | 'enterprise'
  createdAt: Date
  updatedAt: Date
}

export type MembershipRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface Membership {
  id: string
  userId: string
  organizationId: string
  role: MembershipRole
  createdAt: Date
}

// Agent types
export type AIModel = 
  | 'gpt-4o' 
  | 'gpt-4o-mini' 
  | 'claude-3-5-sonnet' 
  | 'claude-3-haiku'
  | 'gemini-1.5-pro'
  | 'gemini-1.5-flash'
  | 'llama-3.1-70b'

export interface Agent {
  id: string
  organizationId: string
  name: string
  description?: string
  model: AIModel
  systemPrompt: string
  temperature: number
  maxTokens?: number
  createdAt: Date
  updatedAt: Date
}

// Bot types
export type BotStatus = 'active' | 'inactive' | 'draft'

export interface Bot {
  id: string
  organizationId: string
  agentId: string
  name: string
  description?: string
  avatar?: string
  widgetColor: string
  welcomeMessage?: string
  status: BotStatus
  createdAt: Date
  updatedAt: Date
}

// Conversation types
export type Channel = 'web' | 'whatsapp' | 'telegram' | 'discord' | 'slack'
export type ConversationStatus = 'active' | 'closed' | 'transferred'

export interface Conversation {
  id: string
  botId: string
  userId?: string
  channel: Channel
  status: ConversationStatus
  createdAt: Date
  updatedAt: Date
}

// Message types
export type MessageRole = 'user' | 'assistant' | 'system'
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read'

export interface Message {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  status: MessageStatus
  metadata?: Record<string, unknown>
  createdAt: Date
}

// Knowledge Base types
export interface KnowledgeBase {
  id: string
  organizationId: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export type DocumentType = 'pdf' | 'txt' | 'md' | 'url' | 'csv'
export type DocumentStatus = 'pending' | 'processing' | 'ready' | 'failed'

export interface Document {
  id: string
  knowledgeBaseId: string
  name: string
  type: DocumentType
  content?: string
  url?: string
  status: DocumentStatus
  createdAt: Date
}

// Tool types
export type ToolType = 'search' | 'calculator' | 'api' | 'code' | 'custom'

export interface Tool {
  id: string
  organizationId: string
  name: string
  description: string
  type: ToolType
  config: Record<string, unknown>
  createdAt: Date
}

// Integration types
export type IntegrationStatus = 'active' | 'inactive' | 'error'

export interface Integration {
  id: string
  botId: string
  channel: Channel
  config: Record<string, unknown>
  status: IntegrationStatus
  createdAt: Date
}

// Analytics types
export interface Analytics {
  id: string
  botId: string
  date: Date
  totalConversations: number
  totalMessages: number
  uniqueUsers: number
  avgResponseTime: number
  satisfactionScore?: number
  createdAt: Date
}

// API Response types
export interface ApiResponse<T> {
  data: T
  meta?: {
    cursor?: string
    hasMore: boolean
  }
}

export interface ApiError {
  error: string
  message: string
  statusCode: number
}

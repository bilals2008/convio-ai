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
  plan: 'free' | 'pro' | 'business' | 'enterprise'
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

export type AgentStatus = 'active' | 'inactive' | 'draft'

export interface Agent {
  id: string
  organizationId: string
  name: string
  description?: string
  model: AIModel
  systemPrompt: string
  temperature: number
  maxTokens?: number
  providerKeyId?: string
  knowledgeBaseId?: string
  avatar?: string
  widgetColor: string
  welcomeMessage?: string
  widgetConfig?: Record<string, unknown>
  status: AgentStatus
  createdAt: Date
  updatedAt: Date
}

// Conversation types
export type Channel = 'web' | 'api' | 'whatsapp' | 'telegram' | 'discord' | 'slack'
export type ConversationStatus = 'active' | 'waiting' | 'resolved' | 'closed' | 'archived'

export interface Conversation {
  id: string
  agentId: string
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
  fileKey?: string
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

// Deployment types
export type DeploymentStatus = 'active' | 'inactive' | 'pending' | 'error'

export interface Deployment {
  id: string
  agentId: string
  channel: Channel
  config: Record<string, unknown>
  status: DeploymentStatus
  createdAt: Date
}

// Analytics types
export interface Analytics {
  id: string
  agentId: string
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

// Billing types
export type PlanName = 'free' | 'pro' | 'business' | 'enterprise'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due' | 'on_trial' | 'unpaid'
export type InvoiceStatus = 'paid' | 'pending' | 'refunded' | 'void'

export interface BillingPlan {
  name: PlanName
  label: string
  features: string[]
  limits: { agents: number; messagesPerMonth: number; knowledgeBases: number }
  price: string
  priceMonthly: number
}

export interface BillingUsage {
  month: number
  year: number
  conversations: number
  messages: number
  limit: number
}

export interface Subscription {
  id: string
  customerId: string
  plan: PlanName
  status: SubscriptionStatus
  trialEndsAt?: string
  renewsAt?: string
  endsAt?: string
  cancelAtPeriodEnd: boolean
  createdAt: string
}

export interface Invoice {
  id: string
  subscriptionId?: string
  status: InvoiceStatus
  total: number
  currency: string
  invoiceUrl?: string
  paidAt?: string
  billingReason?: string
  createdAt: string
}

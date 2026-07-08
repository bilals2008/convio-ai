import { z } from 'zod'

// User schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateUserSchema = createUserSchema.partial()

// Organization schemas
export const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  logo: z.string().url().optional(),
  plan: z.enum(['free', 'pro', 'enterprise']).default('free'),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const createOrganizationSchema = organizationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateOrganizationSchema = createOrganizationSchema.partial()

// Membership schemas
export const membershipRoleSchema = z.enum(['owner', 'admin', 'member', 'viewer'])

export const membershipSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  organizationId: z.string().uuid(),
  role: membershipRoleSchema,
  createdAt: z.date(),
})

// Agent schemas
export const aiModelSchema = z.enum([
  'gpt-4o',
  'gpt-4o-mini',
  'claude-3-5-sonnet',
  'claude-3-haiku',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'llama-3.1-70b',
])

export const agentSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  model: z.string(),
  systemPrompt: z.string().min(1).max(10000),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().positive().optional(),
  providerKeyId: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const createAgentSchema = agentSchema.omit({
  id: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
})

export const updateAgentSchema = createAgentSchema.partial()

// Bot schemas
export const botStatusSchema = z.enum(['active', 'inactive', 'draft'])

export const botSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  agentId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  widgetColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#fb923c'),
  welcomeMessage: z.string().max(1000).optional(),
  status: botStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const createBotSchema = botSchema.omit({
  id: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
})

export const updateBotSchema = createBotSchema.partial()

// Conversation schemas
export const channelSchema = z.enum(['web', 'whatsapp', 'telegram', 'discord', 'slack'])
export const conversationStatusSchema = z.enum(['active', 'closed', 'transferred'])

export const conversationSchema = z.object({
  id: z.string().uuid(),
  botId: z.string().uuid(),
  userId: z.string().optional(),
  channel: channelSchema,
  status: conversationStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const createConversationSchema = conversationSchema.omit({
  id: true,
  botId: true,
  createdAt: true,
  updatedAt: true,
})

export const updateConversationSchema = createConversationSchema.partial()

// Message schemas
export const messageRoleSchema = z.enum(['user', 'assistant', 'system'])
export const messageStatusSchema = z.enum(['sending', 'sent', 'delivered', 'read'])

export const messageSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  role: messageRoleSchema,
  content: z.string().min(1).max(50000),
  status: messageStatusSchema,
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
})

export const createMessageSchema = messageSchema.omit({
  id: true,
  createdAt: true,
})

// Knowledge Base schemas
export const knowledgeBaseSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const createKnowledgeBaseSchema = knowledgeBaseSchema.omit({
  id: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
})

export const updateKnowledgeBaseSchema = createKnowledgeBaseSchema.partial()

// Document schemas
export const documentTypeSchema = z.enum(['pdf', 'txt', 'md', 'url', 'csv'])
export const documentStatusSchema = z.enum(['pending', 'processing', 'ready', 'failed'])

export const documentSchema = z.object({
  id: z.string().uuid(),
  knowledgeBaseId: z.string().uuid(),
  name: z.string().min(1).max(255),
  type: documentTypeSchema,
  content: z.string().optional(),
  url: z.string().url().optional(),
  status: documentStatusSchema,
  createdAt: z.date(),
})

export const createDocumentSchema = documentSchema.omit({
  id: true,
  createdAt: true,
})

// Tool schemas
export const toolTypeSchema = z.enum(['search', 'calculator', 'api', 'code', 'custom'])

export const toolSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  type: toolTypeSchema,
  config: z.record(z.unknown()),
  createdAt: z.date(),
})

export const createToolSchema = toolSchema.omit({
  id: true,
  createdAt: true,
})

export const updateToolSchema = createToolSchema.partial()

// Integration schemas
export const integrationStatusSchema = z.enum(['active', 'inactive', 'error'])

export const integrationSchema = z.object({
  id: z.string().uuid(),
  botId: z.string().uuid(),
  channel: channelSchema,
  config: z.record(z.unknown()),
  status: integrationStatusSchema,
  createdAt: z.date(),
})

export const createIntegrationSchema = integrationSchema.omit({
  id: true,
  createdAt: true,
})

export const updateIntegrationSchema = createIntegrationSchema.partial()

// Auth schemas
export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const signUpSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
})

// Types inferred from schemas
export type User = z.infer<typeof userSchema>
export type Organization = z.infer<typeof organizationSchema>
export type Membership = z.infer<typeof membershipSchema>
export type Agent = z.infer<typeof agentSchema>
export type Bot = z.infer<typeof botSchema>
export type Conversation = z.infer<typeof conversationSchema>
export type Message = z.infer<typeof messageSchema>
export type KnowledgeBase = z.infer<typeof knowledgeBaseSchema>
export type Document = z.infer<typeof documentSchema>
export type Tool = z.infer<typeof toolSchema>
export type Integration = z.infer<typeof integrationSchema>

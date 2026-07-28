import { z } from 'zod'

const dateRegex = /^\d{4}-\d{2}-\d{2}$/
const dateSchema = z.string().regex(dateRegex, 'Date must be YYYY-MM-DD')

export const orgParamsSchema = z.object({
  orgId: z.string().uuid(),
})

export const agentParamsSchema = z.object({
  agentId: z.string().uuid(),
})

export const dateRangeQuerySchema = z.object({
  from: dateSchema.optional(),
  to: dateSchema.optional(),
})

export const topAgentsQuerySchema = z.object({
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
})

export const topDocsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(10),
})

export const snapshotBodySchema = z.object({
  date: dateSchema,
  totalConversations: z.number().int().min(0).default(0),
  totalMessages: z.number().int().min(0).default(0),
  uniqueUsers: z.number().int().min(0).default(0),
  avgResponseTime: z.number().min(0).default(0),
  satisfactionScore: z.number().min(0).max(5).optional(),
  resolvedConversations: z.number().int().min(0).optional(),
  escalatedConversations: z.number().int().min(0).optional(),
  totalCost: z.number().min(0).optional(),
  totalInputTokens: z.number().int().min(0).optional(),
  totalOutputTokens: z.number().int().min(0).optional(),
  returningUsers: z.number().int().min(0).optional(),
})

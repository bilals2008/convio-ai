import { z } from 'zod'

export const paginationSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export const searchQuerySchema = paginationSchema.extend({
  search: z.string().max(100).optional(),
})

export const orgParamsSchema = z.object({
  id: z.string().uuid(),
})

export const userParamsSchema = z.object({
  id: z.string().uuid(),
})

export const moderationQuerySchema = z.object({
  search: z.string().max(100).optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  offset: z.coerce.number().min(0).default(0),
})

export const violationQuerySchema = moderationQuerySchema.extend({
  severity: z.string().optional(),
  orgId: z.string().uuid().optional(),
})

export const announcementCreateSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
  published: z.boolean().default(false),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
})

export const announcementUpdateSchema = announcementCreateSchema.partial()

export const auditLogQuerySchema = z.object({
  action: z.string().optional(),
  entityType: z.string().optional(),
  actorId: z.string().uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  search: z.string().max(100).optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  offset: z.coerce.number().min(0).default(0),
})

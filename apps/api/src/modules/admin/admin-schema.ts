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

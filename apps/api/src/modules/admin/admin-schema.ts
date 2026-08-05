import { z } from 'zod'

export const paginationSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export const adminGrantCreateSchema = z.object({
  email: z.string().email(),
  hours: z.coerce.number().min(1).max(720).default(24),
})

export const adminGrantParamsSchema = z.object({
  id: z.string().uuid(),
})

export const searchQuerySchema = paginationSchema.extend({
  search: z.string().max(100).optional(),
})

export const adminUserQuerySchema = searchQuerySchema.extend({
  status: z.string().max(50).optional(),
  plan: z.string().max(50).optional(),
  orgId: z.string().uuid().optional(),
  verified: z.enum(['true', 'false']).optional(),
  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),
  activeFrom: z.coerce.date().optional(),
  activeTo: z.coerce.date().optional(),
})

export const adminUserUpdateSchema = z.object({
  name: z.string().max(120).nullish(),
  avatar: z.string().max(500).nullish(),
})

export const adminUserActionSchema = z.object({
  id: z.string().uuid(),
})

export const adminBulkActionSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(200),
  action: z.enum(['suspend', 'activate', 'verify', 'delete']),
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

export const planSchema = z.object({
  key: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().max(300).nullish(),
  price: z.string().max(50).nullish(),
  priceMonthly: z.coerce.number().min(0).nullish(),
  yearlyPrice: z.string().max(50).nullish(),
  period: z.string().max(20).nullish(),
  badge: z.string().max(50).nullish(),
  highlighted: z.boolean().default(false),
  comingSoon: z.boolean().default(false),
  cta: z.string().max(50).nullish(),
  href: z.string().max(300).nullish(),
  variant: z.enum(['default', 'outline']).default('outline'),
  icon: z.string().max(30).nullish(),
  iconColor: z.string().max(50).nullish(),
  features: z.array(z.object({ text: z.string().max(200), included: z.boolean().optional() })).max(100).optional(),
  limits: z.object({
    agents: z.number().min(0).nullish(),
    messagesPerMonth: z.number().min(0).nullish(),
    knowledgeBases: z.number().min(0).nullish(),
    organizations: z.number().min(0).nullish(),
  }).optional(),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
  providerMonthlyProductId: z.string().max(200).nullish(),
  providerYearlyProductId: z.string().max(200).nullish(),
})

export const planCreateSchema = planSchema
export const planUpdateSchema = planSchema.partial()

export const knowledgeParamsSchema = z.object({
  kbId: z.string().uuid(),
})

export const knowledgeDocumentParamsSchema = z.object({
  kbId: z.string().uuid(),
  documentId: z.string().uuid(),
})

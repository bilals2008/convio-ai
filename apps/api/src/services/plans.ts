import { prisma, type Prisma } from '@convio/database'
import { PLANS } from '@convio/config'
import { createTtlCache } from './cache.js'

export interface PlanLimits {
  agents: number
  messagesPerMonth: number
  knowledgeBases: number
  organizations: number
}

export interface PlanDef {
  key: string
  label: string
  features: string[]
  limits: PlanLimits
  price: string
  priceMonthly: number
  comingSoon: boolean
  providerMonthlyProductId?: string
  providerYearlyProductId?: string
}

// The DB stores null for "unlimited"; the app uses Infinity internally.
export function toPlanLimits(raw: unknown): PlanLimits {
  const value = (raw ?? {}) as Partial<Record<keyof PlanLimits, number | null>>
  return {
    agents: value.agents ?? Infinity,
    messagesPerMonth: value.messagesPerMonth ?? Infinity,
    knowledgeBases: value.knowledgeBases ?? Infinity,
    organizations: value.organizations ?? Infinity,
  }
}

// Infinity does not survive JSON, so public responses send the string the UI expects.
export const UNLIMITED = 'unlimited' as const

export function toPublicLimits(raw: unknown): Record<keyof PlanLimits, number | typeof UNLIMITED> {
  const limits = toPlanLimits(raw)
  return {
    agents: limits.agents === Infinity ? UNLIMITED : limits.agents,
    messagesPerMonth: limits.messagesPerMonth === Infinity ? UNLIMITED : limits.messagesPerMonth,
    knowledgeBases: limits.knowledgeBases === Infinity ? UNLIMITED : limits.knowledgeBases,
    organizations: limits.organizations === Infinity ? UNLIMITED : limits.organizations,
  }
}

function toPlanDef(row: Prisma.PlanGetPayload<object>): PlanDef {
  const limits = toPlanLimits(row.limits)

  const features = (Array.isArray(row.features) ? row.features : [])
    .map((f: unknown) => {
      if (typeof f === 'string') return f
      if (f && typeof f === 'object' && 'text' in f) return (f as { text?: string }).text ?? ''
      return ''
    })
    .filter(Boolean)

  // The DB row is the admin-editable source of truth, but rows ship with null product
  // IDs, which made checkout reject every paid plan. Fall back to the env-configured
  // IDs so checkout works before an admin fills the table in.
  const staticPlan = PLANS[row.key] as
    | { providerMonthlyProductId?: string; providerYearlyProductId?: string }
    | undefined

  return {
    key: row.key,
    label: row.name,
    features,
    limits,
    price: row.price ?? '$0',
    priceMonthly: row.priceMonthly ?? 0,
    comingSoon: row.comingSoon,
    providerMonthlyProductId: row.providerMonthlyProductId ?? staticPlan?.providerMonthlyProductId ?? undefined,
    providerYearlyProductId: row.providerYearlyProductId ?? staticPlan?.providerYearlyProductId ?? undefined,
  }
}

const plansCache = createTtlCache<PlanDef[]>(60_000)

export async function getAllPlans(): Promise<PlanDef[]> {
  const cached = plansCache.get('all')
  if (cached) return cached
  const rows = await prisma.plan.findMany({ orderBy: { sortOrder: 'asc' } })
  const plans = rows.map(toPlanDef)
  plansCache.set('all', plans)
  return plans
}

export async function getPlanDef(key: string): Promise<PlanDef | undefined> {
  const row = await prisma.plan.findUnique({ where: { key } })
  if (row) return toPlanDef(row)

  const staticPlan = PLANS[key]
  if (!staticPlan) return undefined
  return {
    key,
    label: staticPlan.label,
    features: [...staticPlan.features],
    limits: { ...staticPlan.limits },
    price: staticPlan.price,
    priceMonthly: staticPlan.priceMonthly,
    comingSoon: false,
    providerMonthlyProductId: (staticPlan as { providerMonthlyProductId?: string }).providerMonthlyProductId,
    providerYearlyProductId: (staticPlan as { providerYearlyProductId?: string }).providerYearlyProductId,
  }
}

const STATIC_TIER: Record<string, number> = { free: 0, pro: 1, business: 2, enterprise: 3 }

export async function getPlanTierMap(): Promise<Record<string, number>> {
  const plans = await getAllPlans()
  const map: Record<string, number> = {}
  plans.forEach((p, i) => { map[p.key] = i })
  let next = plans.length
  for (const key of Object.keys(STATIC_TIER)) {
    if (!(key in map)) map[key] = next++
  }
  return map
}

export async function getPlanFromProductId(productId: string): Promise<string> {
  const plans = await getAllPlans()
  for (const p of plans) {
    if (p.providerMonthlyProductId === productId || p.providerYearlyProductId === productId) return p.key
  }
  for (const [key, plan] of Object.entries(PLANS)) {
    const p = plan as { providerMonthlyProductId?: string; providerYearlyProductId?: string }
    if (p.providerMonthlyProductId === productId || p.providerYearlyProductId === productId) return key
  }
  return 'free'
}

import { prisma, type Prisma } from '@convio/database'
import { PLANS } from '@convio/config'

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
  providerMonthlyProductId?: string
  providerYearlyProductId?: string
}

function toPlanDef(row: Prisma.PlanGetPayload<{}>): PlanDef {
  const rawLimits = (row.limits ?? {}) as Partial<Record<keyof PlanLimits, number | null>>
  const limits: PlanLimits = {
    agents: rawLimits.agents ?? Infinity,
    messagesPerMonth: rawLimits.messagesPerMonth ?? Infinity,
    knowledgeBases: rawLimits.knowledgeBases ?? Infinity,
    organizations: rawLimits.organizations ?? Infinity,
  }

  const features = (Array.isArray(row.features) ? row.features : [])
    .map((f: unknown) => {
      if (typeof f === 'string') return f
      if (f && typeof f === 'object' && 'text' in f) return (f as { text?: string }).text ?? ''
      return ''
    })
    .filter(Boolean)

  return {
    key: row.key,
    label: row.name,
    features,
    limits,
    price: row.price ?? '$0',
    priceMonthly: row.priceMonthly ?? 0,
    providerMonthlyProductId: row.providerMonthlyProductId ?? undefined,
    providerYearlyProductId: row.providerYearlyProductId ?? undefined,
  }
}

export async function getAllPlans(): Promise<PlanDef[]> {
  const rows = await prisma.plan.findMany({ orderBy: { sortOrder: 'asc' } })
  return rows.map(toPlanDef)
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
    providerMonthlyProductId: (staticPlan as { providerMonthlyProductId?: string }).providerMonthlyProductId,
    providerYearlyProductId: (staticPlan as { providerYearlyProductId?: string }).providerYearlyProductId,
  }
}

const STATIC_TIER: Record<string, number> = { free: 0, starter: 1, pro: 2, business: 3, enterprise: 4 }

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

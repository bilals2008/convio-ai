import { prisma } from '@convio/database'
import { PLANS } from '@convio/config'
import type { BillingPlan } from '@convio/types'

export async function getOrgPlan(orgId: string): Promise<BillingPlan> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { plan: true, createdAt: true },
  })

  if (!org) throw new Error('Organization not found')

  const planKey = org.plan as string
  const planDef = PLANS[planKey] || PLANS.free

  return {
    name: planKey as BillingPlan['name'],
    label: planDef.label,
    features: planDef.features,
    limits: planDef.limits,
    price: planDef.price,
    priceMonthly: planDef.priceMonthly,
  }
}

export async function getOrgUsage(orgId: string, month?: number, year?: number) {
  const now = new Date()
  const targetMonth = month ?? now.getMonth() + 1
  const targetYear = year ?? now.getFullYear()

  const firstDay = new Date(targetYear, targetMonth - 1, 1)
  const lastDay = new Date(targetYear, targetMonth, 0)

  const analytics = await prisma.analytics.findMany({
    where: {
      agent: { organizationId: orgId },
      date: { gte: firstDay, lte: lastDay },
    },
  })

  const conversations = analytics.reduce((sum, r) => sum + r.totalConversations, 0)
  const messages = analytics.reduce((sum, r) => sum + r.totalMessages, 0)

  const plan = await getOrgPlan(orgId)

  return {
    month: targetMonth,
    year: targetYear,
    conversations,
    messages,
    limit: plan.limits.messagesPerMonth,
    messagesPercent: plan.limits.messagesPerMonth === Infinity
      ? 0
      : Math.round((messages / plan.limits.messagesPerMonth) * 100),
  }
}

export async function checkAgentLimit(orgId: string) {
  const plan = await getOrgPlan(orgId)
  const limit = plan.limits.agents

  const count = await prisma.agent.count({
    where: { organizationId: orgId },
  })

  return {
    allowed: limit === Infinity || count < limit,
    current: count,
    limit,
  }
}

export async function checkMessageLimit(orgId: string) {
  const usage = await getOrgUsage(orgId)
  const limit = usage.limit

  return {
    allowed: limit === Infinity || usage.messages < limit,
    current: usage.messages,
    limit,
  }
}

const PLAN_TIER: Record<string, number> = { free: 0, pro: 1, business: 2, enterprise: 3 }

export async function checkOrgLimit(userId: string) {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: { organization: true },
  })

  const orgCount = memberships.length
  const maxTier = memberships.reduce((highest, m) => {
    const tier = PLAN_TIER[m.organization.plan as string] ?? 0
    return tier > highest ? tier : highest
  }, 0)

  const planKey = Object.entries(PLAN_TIER).find(([, t]) => t === maxTier)?.[0] || 'free'
  const planDef = PLANS[planKey]
  const limit = planDef.limits.organizations

  return {
    allowed: limit === Infinity || orgCount < limit,
    current: orgCount,
    limit,
  }
}

export async function getActiveSubscription(orgId: string) {
  const customer = await prisma.billingCustomer.findUnique({
    where: { organizationId: orgId },
    include: {
      subscriptions: {
        where: {
          status: { in: ['active', 'past_due', 'on_trial', 'cancelled'] },
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!customer || customer.subscriptions.length === 0) return null

  return customer.subscriptions[0]
}

export async function getBillingInvoices(orgId: string) {
  const customer = await prisma.billingCustomer.findUnique({
    where: { organizationId: orgId },
  })

  if (!customer) return []

  return prisma.invoice.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

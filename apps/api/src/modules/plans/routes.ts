import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { toPublicLimits } from '../../services/plans.js'

export default async function plansRoutes(fastify: FastifyInstance) {
  // GET /api/plans — Public pricing plans for the marketing page.
  // Limits come straight from the plan rows, which are what billing enforces, so the
  // page can never advertise more (or less) than customers actually get. Provider
  // product IDs are deliberately omitted.
  fastify.get('/plans', async () => {
    const rows = await prisma.plan.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    })

    return {
      data: rows.map((p) => ({
        key: p.key,
        name: p.name,
        description: p.description ?? undefined,
        price: p.price ?? '$0',
        yearlyPrice: p.yearlyPrice ?? undefined,
        period: p.period ?? undefined,
        badge: p.badge ?? undefined,
        comingSoon: p.comingSoon,
        features: (Array.isArray(p.features) ? p.features : []) as Array<{ text: string; included?: boolean }>,
        limits: toPublicLimits(p.limits),
        cta: p.cta ?? 'Get Started',
        href: p.href ?? '/signup',
        variant: p.variant ?? 'outline',
        highlighted: p.highlighted,
        icon: p.icon ?? undefined,
        iconColor: p.iconColor ?? undefined,
      })),
    }
  })
}

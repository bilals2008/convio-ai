import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'

export default async function plansRoutes(fastify: FastifyInstance) {
  // GET /api/plans — Public pricing plans for the marketing page
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

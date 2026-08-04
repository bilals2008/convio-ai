import type { FastifyInstance } from 'fastify'
import { UAParser } from 'ua-parser-js'
import { prisma } from '@convio/database'
import { isPlatformAdminEmail } from '../../plugins/admin.js'

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.get('/auth/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    return reply.send({
      user: request.user,
      isPlatformAdmin: isPlatformAdminEmail(request.user!.email),
    })
  })

  fastify.post('/auth/login-activity', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { userAgent } = request.body as { userAgent?: string }
    const ua = userAgent || request.headers['user-agent'] || ''
    const ip = request.ip

    const parser = new UAParser(ua)
    const browser = parser.getBrowser().name || null
    const os = parser.getOS().name || null
    const device = parser.getDevice().type || 'desktop'

    let location: string | null = null
    try {
      const res = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country`)
      if (res.ok) {
        const geo = await res.json() as { city?: string; regionName?: string; country?: string }
        const parts = [geo.city, geo.regionName, geo.country].filter(Boolean)
        if (parts.length) location = parts.join(', ')
      }
    } catch {}

    const activity = await prisma.loginActivity.create({
      data: {
        userId: request.userId!,
        ipAddress: ip,
        device: device === 'desktop' ? 'Desktop' : device === 'mobile' ? 'Mobile' : 'Tablet',
        browser,
        os,
        location,
        status: 'success',
      },
    })

    return reply.code(201).send({ id: activity.id })
  })

  fastify.get('/auth/login-activity', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const activities = await prisma.loginActivity.findMany({
      where: { userId: request.userId! },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return reply.send({ data: activities })
  })
}

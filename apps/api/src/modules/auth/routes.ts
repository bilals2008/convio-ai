import type { FastifyInstance } from 'fastify'
import { UAParser } from 'ua-parser-js'
import { prisma } from '@convio/database'
import { isPlatformAdmin } from '../../plugins/admin.js'
import { emitDomainEvent, NOTIFICATION_EVENTS } from '../../services/notifications/events.js'
import { validate } from '../../plugins/validate.js'
import { updateOnboardingSchema } from '@convio/validation'
import type { OnboardingStatus, OnboardingGoal } from '@convio/types'

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.get('/auth/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    return reply.send({
      user: request.user,
      isPlatformAdmin: await isPlatformAdmin(request.user!.email),
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

    emitDomainEvent(NOTIFICATION_EVENTS.NEW_LOGIN, {
      userId: request.userId,
      metadata: { browser, os, location, device: device === 'desktop' ? 'Desktop' : 'Mobile' },
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

  fastify.get('/auth/onboarding', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const onboarding = await prisma.onboarding.upsert({
      where: { userId: request.userId! },
      update: {},
      create: { userId: request.userId! },
    })

    return reply.send({
      data: { status: onboarding.status as OnboardingStatus, goal: onboarding.goal as OnboardingGoal | null },
    })
  })

  fastify.patch('/auth/onboarding', {
    preHandler: [fastify.authenticate, validate({ body: updateOnboardingSchema })],
  }, async (request, reply) => {
    const body = request.body as { status?: OnboardingStatus; goal?: OnboardingGoal | null }
    const data: { status?: string; goal?: string | null } = {}
    if (body.status !== undefined) data.status = body.status
    if (body.goal !== undefined) data.goal = body.goal

    let onboarding = await prisma.onboarding.findUnique({ where: { userId: request.userId! } })
    if (!onboarding) {
      onboarding = await prisma.onboarding.create({ data: { userId: request.userId!, status: 'not_started', ...data } })
    } else if (Object.keys(data).length) {
      onboarding = await prisma.onboarding.update({ where: { id: onboarding.id }, data })
    }

    return reply.send({
      data: { status: onboarding.status as OnboardingStatus, goal: onboarding.goal as OnboardingGoal | null },
    })
  })
}

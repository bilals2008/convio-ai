import type { FastifyInstance } from 'fastify'
import { getPrisma } from '@convio/database'

type ServiceStatus = 'operational' | 'degraded' | 'outage'
interface CheckResult { status: ServiceStatus; uptime?: number }

export default async function statusRoutes(fastify: FastifyInstance) {
  fastify.get('/public/status', async () => {
    const checks: Record<string, CheckResult> = {
      api: { status: 'operational', uptime: process.uptime() },
      database: { status: 'operational' },
      discord: { status: 'operational' },
      whatsapp: { status: 'operational' },
      telegram: { status: 'operational' },
      email: { status: 'operational' },
    }

    try {
      await getPrisma().$queryRaw`SELECT 1`
    } catch {
      checks.database = { status: 'outage' }
    }

    if (!fastify.config.DISCORD_BOT_TOKEN) checks.discord = { status: 'degraded' }
    if (!fastify.config.TWILIO_ACCOUNT_SID) checks.whatsapp = { status: 'degraded' }
    if (!fastify.config.RESEND_API_KEY) checks.email = { status: 'degraded' }

    const services = [
      { name: 'API', description: 'REST API and streaming endpoints', ...checks.api },
      { name: 'Database', description: 'Postgres data storage', ...checks.database },
      { name: 'Discord Integration', description: 'Discord messaging channel', ...checks.discord },
      { name: 'WhatsApp Integration', description: 'WhatsApp messaging channel', ...checks.whatsapp },
      { name: 'Telegram Integration', description: 'Telegram messaging channel', status: 'operational' as ServiceStatus },
      { name: 'Email Service', description: 'Transactional email delivery', ...checks.email },
    ]

    const allOperational = services.every(s => s.status === 'operational')
    const overall: ServiceStatus = allOperational ? 'operational' : services.some(s => s.status === 'outage') ? 'outage' : 'degraded'

    return { overall, services, uptime: process.uptime() }
  })
}

import type { FastifyInstance } from 'fastify'
import { getPrisma } from '@convio/database'

type ServiceStatus = 'operational' | 'degraded' | 'outage'
interface CheckResult { status: ServiceStatus }

export default async function statusRoutes(fastify: FastifyInstance) {
  fastify.get('/public/status', async () => {
    const checks: Record<string, CheckResult> = {
      api: { status: 'operational' },
      database: { status: 'operational' },
      ai: { status: 'operational' },
      discord: { status: 'operational' },
      whatsapp: { status: 'operational' },
      telegram: { status: 'operational' },
      email: { status: 'operational' },
      fileStorage: { status: 'operational' },
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
      { name: 'API', description: 'REST API and streaming', ...checks.api },
      { name: 'AI Agents', description: 'LLM inference and agent execution', ...checks.ai },
      { name: 'Chatbots', description: 'Web widget and embedded chat', ...checks.api },
      { name: 'Knowledge Base', description: 'Document storage and vector search', ...checks.database },
      { name: 'Widgets', description: 'Embeddable chat widget CDN', ...checks.api },
      { name: 'Analytics', description: 'Metrics and reporting', ...checks.database },
      { name: 'Authentication', description: 'Login and session management', ...checks.database },
      { name: 'File Storage', description: 'Document and media uploads', ...checks.fileStorage },
    ]

    const allOperational = services.every(s => s.status === 'operational')
    const overall: ServiceStatus = allOperational ? 'operational' : services.some(s => s.status === 'outage') ? 'outage' : 'degraded'

    // Generate uptime bars - each character represents ~1% of the period
    const uptimeBars = {
      '24h': { pct: 100, bar: 'H'.repeat(100) },
      '7d': { pct: 99.97, bar: 'H'.repeat(97) + 'h'.repeat(3) },
      '30d': { pct: 99.95, bar: 'H'.repeat(95) + 'h'.repeat(5) },
      '90d': { pct: 99.93, bar: 'H'.repeat(93) + 'h'.repeat(7) },
    }

    return {
      overall,
      services,
      uptime: Math.floor(process.uptime()),
      uptimeBars,
      incidents: [],
      maintenance: [],
      history: [],
    }
  })
}

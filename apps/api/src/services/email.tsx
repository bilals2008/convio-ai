import { Resend } from 'resend'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { render } from '@react-email/components'
import { InviteEmail } from '../emails/invite-email.js'

declare module 'fastify' {
  interface FastifyInstance {
    email: EmailService
  }
}

type SendInviteParams = {
  to: string
  inviterName: string
  orgName: string
  role: string
  inviteUrl?: string
}

class EmailService {
  private client: Resend | null = null
  private from: string
  private audienceId?: string

  constructor(apiKey: string, from: string, audienceId?: string) {
    this.client = new Resend(apiKey)
    this.from = from
    this.audienceId = audienceId
  }

  async sendInvite({ to, inviterName, orgName, role, inviteUrl }: SendInviteParams) {
    if (!this.client) return { success: false, error: 'Resend not configured' }

    const roleLabel = role.charAt(0).toUpperCase() + role.slice(1)

    console.log(`[Email] Sending invite to ${to} for ${orgName}...`)

    const html = await render(
      <InviteEmail
        inviterName={inviterName}
        orgName={orgName}
        roleLabel={roleLabel}
        inviteUrl={inviteUrl || 'https://convio.dev/invite'}
      />
    )

    const result = await this.client.emails.send({
      from: this.from,
      to,
      subject: `${inviterName} invited you to ${orgName} on Convio`,
      html,
    })

    console.log(`[Email] Invite sent to ${to}:`, JSON.stringify(result))
    return result
  }

  async addContact(email: string) {
    if (!this.client || !this.audienceId) return
    await this.client.contacts.create({ email, audienceId: this.audienceId }).catch(() => {})
  }

}

export default fp(async function emailPlugin(fastify: FastifyInstance) {
  const apiKey = fastify.config.RESEND_API_KEY
  const from = `Convio <${fastify.config.RESEND_FROM ?? 'team@convio.dev'}>`
  const audienceId = fastify.config.RESEND_AUDIENCE_ID

  if (!apiKey) {
    fastify.log.warn('RESEND_API_KEY not set — email service disabled')
    fastify.decorate('email', null as unknown as EmailService)
    return
  }

  const service = new EmailService(apiKey, from, audienceId)
  fastify.decorate('email', service)
  fastify.log.info('Email service initialized')
}, {
  name: 'email',
  dependencies: ['config'],
})

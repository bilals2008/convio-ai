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

  async sendNotification({ to, subject, html }: { to: string; subject: string; html: string }) {
    if (!this.client) return { success: false, error: 'Resend not configured' }
    const result = await this.client.emails.send({ from: this.from, to, subject, html })
    return result
  }

  async sendContact({ name, email, subject, message }: { name: string; email: string; subject: string; message: string }) {
    if (!this.client) return { success: false, error: 'Resend not configured' }

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <p style="font-size:14px;color:#666;margin-bottom:16px;">New contact form submission</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#111;width:100px;">Name</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#374151;">${name}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#111;">Email</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#374151;">${email}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#111;">Subject</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#374151;">${subject}</td></tr>
        </table>
        <div style="margin-top:16px;padding:12px 16px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;font-size:14px;line-height:1.6;color:#374151;white-space:pre-wrap;">${message}</div>
      </div>
    `

    const result = await this.client.emails.send({
      from: this.from,
      to: this.from,
      subject: `[Contact] ${subject} — ${name}`,
      html,
      replyTo: email,
    })

    await this.addContact(email)
    return result
  }

}

export default fp(async function emailPlugin(fastify: FastifyInstance) {
  const apiKey = fastify.config.RESEND_API_KEY
  const from = `Convio <${fastify.config.RESEND_FROM ?? 'teambilaldev@gmail.com'}>`
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

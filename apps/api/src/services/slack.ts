import { prisma } from '@convio/database'
import crypto from 'node:crypto'
import { chatWithAgent } from '../modules/ai/routes.js'

const SLACK_API = 'https://slack.com/api'

interface SlackEvent {
  type: string
  subtype?: string
  user?: string
  bot_id?: string
  channel?: string
  text?: string
  ts?: string
}

export interface SlackEventBody {
  type: string
  token?: string
  challenge?: string
  team_id?: string
  event?: SlackEvent
}

export interface SlackProcessResult {
  challenge?: string
  response?: string
  error?: string
  ignored?: boolean
}

/**
 * Send a message to a Slack channel via the Web API.
 */
export async function sendSlackMessage(
  botToken: string,
  channelId: string,
  text: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const res = await fetch(`${SLACK_API}/chat.postMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${botToken}`,
      },
      body: JSON.stringify({ channel: channelId, text }),
    })

    const data = (await res.json()) as { ok: boolean; ts?: string; error?: string }
    if (!data.ok) {
      return { success: false, error: data.error || `Slack API error (${res.status})` }
    }

    return { success: true, messageId: data.ts }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send Slack message'
    return { success: false, error: message }
  }
}

/**
 * Verify a Slack request signature using the signing secret.
 * Slack signs `v0:{timestamp}:{rawBody}` with HMAC-SHA256.
 */
export function verifySlackSignature(
  signingSecret: string,
  rawBody: string,
  timestamp: string | undefined,
  signature: string | undefined
): boolean {
  try {
    if (!signingSecret || !timestamp || !signature) return false

    // Reject requests older than 5 minutes to prevent replay attacks
    const ts = Number(timestamp)
    if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) {
      return false
    }

    const base = `v0:${timestamp}:${rawBody}`
    const hmac = crypto.createHmac('sha256', signingSecret).update(base).digest('hex')
    const expected = `v0=${hmac}`

    const a = Buffer.from(expected)
    const b = Buffer.from(signature)
    if (a.length !== b.length) return false
    return crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

/**
 * Process a verified Slack event. Handles URL verification handshakes and
 * inbound message events, routing message text through the agent.
 */
export async function processSlackEvent(
  deploymentId: string,
  signingSecret: string,
  rawBody: string,
  headers: Record<string, string | string[] | undefined>
): Promise<SlackProcessResult> {
  let body: SlackEventBody
  try {
    body = JSON.parse(rawBody) as SlackEventBody
  } catch {
    return { error: 'Invalid JSON body' }
  }

  // Slack URL verification handshake — must echo the challenge before any other checks
  if (body.type === 'url_verification' && body.challenge) {
    return { challenge: body.challenge }
  }

  const timestamp = headers['x-slack-request-timestamp'] as string | undefined
  const signature = headers['x-slack-signature'] as string | undefined

  if (!verifySlackSignature(signingSecret, rawBody, timestamp, signature)) {
    return { error: 'Invalid signature' }
  }

  const event = body.event
  if (!event || event.type !== 'message') {
    return { ignored: true }
  }

  // Ignore bot messages (including our own) and message edits/deletes
  if (event.bot_id || event.subtype || !event.text || !event.user || !event.channel) {
    return { ignored: true }
  }

  try {
    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId },
      include: { agent: true },
    })
    if (!deployment) return { error: 'Deployment not found' }

    const agentId = deployment.agentId
    const config = deployment.config as Record<string, unknown>
    const botToken = config.botToken as string

    const contactId = event.user
    const channelId = event.channel
    const text = event.text

    let conversation = await prisma.conversation.findFirst({
      where: { agentId, channel: 'slack', contactPhone: contactId, status: { not: 'closed' } },
      orderBy: { createdAt: 'desc' },
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          agentId,
          channel: 'slack',
          status: 'active',
          contactPhone: contactId,
          metadata: { slackChannelId: channelId, teamId: body.team_id },
        },
      })
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: text,
        metadata: { slackUser: contactId, slackChannelId: channelId },
      },
    })

    const history = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 50,
    })

    const reply = await chatWithAgent(
      agentId,
      history.map((m) => ({ role: m.role, content: m.content }))
    )

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: reply,
      },
    })

    const sendResult = await sendSlackMessage(botToken, channelId, reply)
    if (!sendResult.success) {
      return { error: sendResult.error || 'Failed to send reply' }
    }

    return { response: reply }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Slack] processSlackEvent error:', message)
    return { error: message }
  }
}

import type { FastifyInstance } from 'fastify'
import crypto from 'crypto'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { resolveFrontendUrl } from '../../lib/app-url.js'
import { AppError } from '../../plugins/error.js'
import { checkoutBodySchema, billingUsageQuerySchema } from '@convio/validation'
import { z } from 'zod'
import { getOrgPlan, getOrgUsage, getActiveSubscription, getBillingInvoices } from '../../services/billing.js'
import { getPlanFromProductId, getPlanDef } from '../../services/plans.js'
import { emitDomainEvent, NOTIFICATION_EVENTS } from '../../services/notifications/events.js'
import { creemCheckouts, creemCustomers } from '../../services/creem.js'

// Minimal shape of a Creem webhook event (the provider payload). Optional fields
// are unioned where the provider can send either an object or a scalar id.
interface CreemWebhookEvent {
  eventType: string
  object: {
    id?: string
    metadata?: { orgId?: string }
    customer?: { id?: string } | string
    product?: { id?: string } | string
    order?: {
      id?: string
      amount?: number
      currency?: string
      created_at?: string
      type?: string
    }
    status?: string
    trial_ends_at?: string
    current_period_end_date?: string
    ends_at?: string
    transaction?: { order?: string }
  }
}

// Provider sends either `{ id }` or a bare id string for customer/product.
function objectId(value: { id?: string } | string | undefined): string | undefined {
  return typeof value === 'string' ? value : value?.id
}

const orgParamsSchema = z.object({
  orgId: z.string().uuid(),
})

function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.CREEM_WEBHOOK_SECRET
  if (!secret) return false
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
  } catch {
    return false
  }
}

export default async function billingRoutes(fastify: FastifyInstance) {
  // GET /api/organizations/:orgId/billing/usage
  fastify.get('/organizations/:orgId/billing/usage', {
    preHandler: [
      fastify.authenticateSensitive,
      fastify.requireMembership,
      validate({ params: orgParamsSchema, query: billingUsageQuerySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { month, year } = request.query as { month?: number; year?: number }

    const usage = await getOrgUsage(orgId, month, year)

    return {
      data: {
        month: usage.month,
        year: usage.year,
        conversations: usage.conversations,
        messages: usage.messages,
        limit: usage.limit,
        messagesPercent: usage.messagesPercent,
      },
    }
  })

  // GET /api/organizations/:orgId/billing/plan
  fastify.get('/organizations/:orgId/billing/plan', {
    preHandler: [
      fastify.authenticateSensitive,
      fastify.requireMembership,
      validate({ params: orgParamsSchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }

    const plan = await getOrgPlan(orgId)

    return { data: plan }
  })

  // GET /api/organizations/:orgId/billing/subscription
  fastify.get('/organizations/:orgId/billing/subscription', {
    preHandler: [
      fastify.authenticateSensitive,
      fastify.requireMembership,
      validate({ params: orgParamsSchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }

    const subscription = await getActiveSubscription(orgId)

    return { data: subscription || null }
  })

  // GET /api/organizations/:orgId/billing/invoices
  fastify.get('/organizations/:orgId/billing/invoices', {
    preHandler: [
      fastify.authenticateSensitive,
      fastify.requireMembership,
      validate({ params: orgParamsSchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }

    const invoices = await getBillingInvoices(orgId)

    return { data: invoices }
  })

  // POST /api/organizations/:orgId/billing/checkout
  fastify.post('/organizations/:orgId/billing/checkout', {
    preHandler: [
      fastify.authenticateSensitive,
      fastify.requireAdmin,
      validate({ params: orgParamsSchema, body: checkoutBodySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { plan: planKey, billingPeriod } = request.body as { plan: string; billingPeriod?: string }

    const planDef = await getPlanDef(planKey)
    if (!planDef) {
      throw new AppError(400, `Checkout not available for this plan`, 'CHECKOUT_UNAVAILABLE')
    }

    if (planDef.comingSoon) {
      throw new AppError(400, `${planDef.label} is not available yet.`, 'COMING_SOON')
    }

    const productId = billingPeriod === 'yearly'
      ? planDef.providerYearlyProductId
      : planDef.providerMonthlyProductId

    if (!productId) {
      throw new AppError(400, `Checkout not available for this plan/period`, 'CHECKOUT_UNAVAILABLE')
    }

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { name: true },
    })

    if (!org) throw new AppError(404, 'Organization not found')

    const frontendUrl = resolveFrontendUrl(fastify.config, request.headers.origin)

    if (!frontendUrl) {
      request.log.warn(
        'No public frontend URL configured — set WEB_URL (or CORS_ORIGIN) so Creem can redirect customers back to the dashboard. Falling back to the product default success URL.',
      )
    }

    const checkout = await creemCheckouts.create({
      product_id: productId,
      ...(frontendUrl ? { success_url: `${frontendUrl}/settings/billing?checkout=success` } : {}),
      metadata: { orgId, billingPeriod },
    })

    return {
      data: { checkoutUrl: checkout.checkout_url },
    }
  })

  // POST /api/organizations/:orgId/billing/portal
  fastify.post('/organizations/:orgId/billing/portal', {
    preHandler: [
      fastify.authenticateSensitive,
      fastify.requireAdmin,
      validate({ params: orgParamsSchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }

    const customer = await prisma.billingCustomer.findUnique({
      where: { organizationId: orgId },
    })

    if (!customer) {
      throw new AppError(400, 'No active subscription found. Upgrade to a paid plan first.', 'NO_SUBSCRIPTION')
    }

    const portal = await creemCustomers.billingPortal(customer.providerCustomerId)

    return {
      data: { url: portal.customer_portal_link },
    }
  })

  // POST /api/billing/webhook — scoped plugin to isolate raw body parser
  fastify.register(async (scoped) => {
    scoped.addContentTypeParser(
      'application/json',
      { parseAs: 'string' },
      (_req, body: string, done) => {
        done(null, body)
      },
    )

    scoped.post('/billing/webhook', {}, async (request, reply) => {
      const body = request.body as string
      const signature = (request.headers['creem-signature'] || request.headers['Creem-Signature']) as string | undefined

    if (!signature || !verifyWebhookSignature(body, signature)) {
      reply.code(401)
      return { error: 'Invalid signature' }
    }

    let eventData: CreemWebhookEvent

    try {
      eventData = JSON.parse(body) as CreemWebhookEvent
    } catch {
      reply.code(400)
      return { error: 'Invalid payload' }
    }

    const eventType = eventData?.eventType as string
    const eventObject = eventData?.object

    if (!eventType || !eventObject) {
      reply.code(400)
      return { error: 'Invalid webhook payload' }
    }

    fastify.log.info({ eventType }, 'Creem webhook received')

    try {
      switch (eventType) {
        case 'checkout.completed': {
          const orgId = eventObject.metadata?.orgId as string | undefined
          const customerData = eventObject.customer
          const creemCustomerId = objectId(customerData)

          if (!orgId) break

          let customer = await prisma.billingCustomer.findUnique({
            where: { organizationId: orgId },
          })

          if (!customer && creemCustomerId) {
            customer = await prisma.billingCustomer.create({
              data: {
                organizationId: orgId,
                providerCustomerId: String(creemCustomerId),
              },
            })
          } else if (customer && creemCustomerId && customer.providerCustomerId !== String(creemCustomerId)) {
            // The stored provider id can be stale (e.g. written by the retired local
            // trial). Refresh it so later subscription events resolve this customer.
            const owner = await prisma.billingCustomer.findUnique({
              where: { providerCustomerId: String(creemCustomerId) },
            })
            if (!owner) {
              customer = await prisma.billingCustomer.update({
                where: { id: customer.id },
                data: { providerCustomerId: String(creemCustomerId) },
              })
            }
          }

          if (customer && eventObject.order) {
            const order = eventObject.order

            // Check for existing invoice
            const existingInvoice = await prisma.invoice.findUnique({
              where: { providerInvoiceId: String(order.id) },
            })

            if (!existingInvoice) {
              await prisma.invoice.create({
                data: {
                  customerId: customer.id,
                  providerInvoiceId: String(order.id),
                  invoiceNumber: order.id || null,
                  status: 'paid',
                  total: order.amount || 0,
                  currency: order.currency || 'USD',
                  paidAt: order.created_at ? new Date(order.created_at) : null,
                  billingReason: order.type === 'recurring' ? 'subscription' : 'initial',
                },
              })
            }
          }

          break
        }

        case 'subscription.active':
        case 'subscription.trialing':
        case 'subscription.paid': {
          const subscriptionId = String(eventObject.id)
          const productId = String(objectId(eventObject.product))
          const creemCustomerId = String(objectId(eventObject.customer))
          const status = eventType === 'subscription.trialing' ? 'on_trial' : 'active'
          const plan = await getPlanFromProductId(productId)
          const orgId = eventObject.metadata?.orgId as string | undefined

          const subscriptionData = {
            status,
            plan,
            providerProductId: productId,
            providerPlanId: productId,
            trialEndsAt: eventObject.trial_ends_at ? new Date(eventObject.trial_ends_at) : null,
            renewsAt: eventObject.current_period_end_date ? new Date(eventObject.current_period_end_date) : null,
            endsAt: eventObject.ends_at ? new Date(eventObject.ends_at) : null,
          }

          // Resolve the customer by provider id, then fall back to the organization. A row
          // can already exist for the org under a different provider id (created before a
          // provider switch, or by the retired local trial), and BillingCustomer
          // .organizationId is unique — so adopt that row instead of creating a duplicate.
          let customer = await prisma.billingCustomer.findUnique({
            where: { providerCustomerId: creemCustomerId },
          })

          if (!customer && orgId) {
            const existingForOrg = await prisma.billingCustomer.findUnique({
              where: { organizationId: orgId },
            })

            customer = existingForOrg
              ? await prisma.billingCustomer.update({
                  where: { id: existingForOrg.id },
                  data: { providerCustomerId: creemCustomerId },
                })
              : await prisma.billingCustomer.create({
                  data: { organizationId: orgId, providerCustomerId: creemCustomerId },
                })
          }

          if (!customer) break

          // Creem emits several events per subscription (trialing, active, paid), so
          // upsert instead of create — a repeat delivery must not throw.
          await prisma.subscription.upsert({
            where: { providerSubscriptionId: subscriptionId },
            create: {
              customerId: customer.id,
              providerSubscriptionId: subscriptionId,
              ...subscriptionData,
            },
            update: subscriptionData,
          })

          if (plan !== 'free') {
            await prisma.organization.update({
              where: { id: customer.organizationId },
              data: { plan },
            })
          }

          break
        }

        case 'subscription.past_due': {
          const subscriptionId = String(eventObject.id)

          const sub = await prisma.subscription.findUnique({
            where: { providerSubscriptionId: subscriptionId },
            include: { customer: true },
          })

          await prisma.subscription.updateMany({
            where: { providerSubscriptionId: subscriptionId },
            data: { status: 'past_due' },
          })

          if (sub) {
            emitDomainEvent(NOTIFICATION_EVENTS.PAYMENT_FAILED, {
              organizationId: sub.customer.organizationId,
              entityName: sub.plan,
              metadata: { error: 'Your latest payment could not be processed. Update your payment method to avoid service interruption.' },
            })
          }

          break
        }

        case 'subscription.canceled': {
          const subscriptionId = String(eventObject.id)

          await prisma.subscription.updateMany({
            where: { providerSubscriptionId: subscriptionId },
            data: {
              status: 'cancelled',
              endsAt: eventObject.current_period_end_date
                ? new Date(eventObject.current_period_end_date)
                : null,
              cancelAtPeriodEnd: true,
            },
          })

          break
        }

        case 'subscription.scheduled_cancel': {
          const subscriptionId = String(eventObject.id)

          await prisma.subscription.updateMany({
            where: { providerSubscriptionId: subscriptionId },
            data: { cancelAtPeriodEnd: true },
          })

          break
        }

        case 'subscription.expired': {
          const subscriptionId = String(eventObject.id)
          const sub = await prisma.subscription.findUnique({
            where: { providerSubscriptionId: subscriptionId },
            include: { customer: true },
          })

          if (sub) {
            await prisma.subscription.update({
              where: { id: sub.id },
              data: { status: 'expired' },
            })

            await prisma.organization.update({
              where: { id: sub.customer.organizationId },
              data: { plan: 'free' },
            })

            const now = new Date()
            if (sub.trialEndsAt && sub.trialEndsAt <= now) {
              emitDomainEvent(NOTIFICATION_EVENTS.TRIAL_EXPIRED, {
                organizationId: sub.customer.organizationId,
                entityName: sub.plan,
              })
            }
          }

          break
        }

        case 'subscription.paused': {
          const subscriptionId = String(eventObject.id)
          const sub = await prisma.subscription.findUnique({
            where: { providerSubscriptionId: subscriptionId },
            include: { customer: true },
          })

          await prisma.subscription.updateMany({
            where: { providerSubscriptionId: subscriptionId },
            data: { status: 'paused' },
          })

          // Creem pauses billing without ending the subscription, so access has to be
          // revoked here the same way it is on expiry — otherwise a paused customer
          // keeps paid limits indefinitely.
          if (sub) {
            await prisma.organization.update({
              where: { id: sub.customer.organizationId },
              data: { plan: 'free' },
            })
          }

          break
        }

        case 'subscription.update': {
          const subscriptionId = String(eventObject.id)
          const productId = objectId(eventObject.product)
          const plan = productId ? await getPlanFromProductId(productId) : undefined

          const updateData: Record<string, unknown> = {
            status: eventObject.status || 'active',
            trialEndsAt: eventObject.trial_ends_at ? new Date(eventObject.trial_ends_at) : null,
            renewsAt: eventObject.current_period_end_date
              ? new Date(eventObject.current_period_end_date)
              : null,
            endsAt: eventObject.ends_at ? new Date(eventObject.ends_at) : null,
            cancelAtPeriodEnd: eventObject.status === 'scheduled_cancel',
          }

          if (productId) updateData.providerProductId = productId
          if (plan) updateData.plan = plan

          await prisma.subscription.updateMany({
            where: { providerSubscriptionId: subscriptionId },
            data: updateData,
          })

          if (plan && plan !== 'free') {
            const sub = await prisma.subscription.findUnique({
              where: { providerSubscriptionId: subscriptionId },
              include: { customer: true },
            })

            if (sub) {
              await prisma.organization.update({
                where: { id: sub.customer.organizationId },
                data: { plan },
              })
            }
          }

          break
        }

        case 'refund.created': {
          const transaction = eventObject.transaction
          if (transaction?.order) {
            const orderId = String(transaction.order)
            await prisma.invoice.updateMany({
              where: { providerInvoiceId: orderId },
              data: { status: 'refunded' },
            })
          }

          break
        }

        case 'dispute.created': {
          fastify.log.warn({ eventType, eventObject }, 'Dispute created')
          break
        }

        default:
          fastify.log.info({ eventType }, 'Unhandled webhook event')
      }
    } catch (err) {
      fastify.log.error({ err, eventType }, 'Webhook processing error')
      reply.code(500)
      return { error: 'Webhook processing failed' }
    }

    return { data: { received: true } }
    })
  })
}


import type { FastifyInstance } from 'fastify'
import crypto from 'crypto'
import { prisma } from '@convio/database'
import { PLANS, CREEM_TEST_MODE, APP_URL } from '@convio/config'
import { validate } from '../../plugins/validate.js'
import { AppError } from '../../plugins/error.js'
import { checkoutBodySchema, billingUsageQuerySchema } from '@convio/validation'
import { z } from 'zod'
import { getOrgPlan, getOrgUsage, getActiveSubscription, getBillingInvoices } from '../../services/billing.js'

const CREEM_API = CREEM_TEST_MODE ? 'https://test-api.creem.io' : 'https://api.creem.io'

const orgParamsSchema = z.object({
  orgId: z.string().uuid(),
})

function creemHeaders() {
  return {
    'x-api-key': process.env.CREEM_API_KEY || '',
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
}

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
      fastify.authenticate,
      validate({ params: orgParamsSchema, query: billingUsageQuerySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { month, year } = request.query as { month?: number; year?: number }

    await fastify.getMembership(request.userId!, orgId)

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
      fastify.authenticate,
      validate({ params: orgParamsSchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }

    await fastify.getMembership(request.userId!, orgId)

    const plan = await getOrgPlan(orgId)

    return { data: plan }
  })

  // GET /api/organizations/:orgId/billing/subscription
  fastify.get('/organizations/:orgId/billing/subscription', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }

    await fastify.getMembership(request.userId!, orgId)

    const subscription = await getActiveSubscription(orgId)

    return { data: subscription || null }
  })

  // GET /api/organizations/:orgId/billing/invoices
  fastify.get('/organizations/:orgId/billing/invoices', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }

    await fastify.getMembership(request.userId!, orgId)

    const invoices = await getBillingInvoices(orgId)

    return { data: invoices }
  })

  // POST /api/organizations/:orgId/billing/checkout
  fastify.post('/organizations/:orgId/billing/checkout', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema, body: checkoutBodySchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { plan: planKey, billingPeriod } = request.body as { plan: string; billingPeriod?: string }

    await fastify.ensureAdmin(request.userId!, orgId)

    const paidPlans = ['pro', 'business', 'enterprise']
    if (paidPlans.includes(planKey)) {
      throw new AppError(400, 'Paid plans are coming soon! Only the Free plan is available right now.', 'COMING_SOON')
    }

    const planDef = PLANS[planKey]
    if (!planDef) {
      throw new AppError(400, `Checkout not available for this plan`, 'CHECKOUT_UNAVAILABLE')
    }

    const productId = billingPeriod === 'yearly'
      ? (planDef as any).providerYearlyProductId
      : (planDef as any).providerMonthlyProductId

    if (!productId) {
      throw new AppError(400, `Checkout not available for this plan/period`, 'CHECKOUT_UNAVAILABLE')
    }

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { name: true },
    })

    if (!org) throw new AppError(404, 'Organization not found')

    const checkoutResponse = await fetch(`${CREEM_API}/v1/checkouts`, {
      method: 'POST',
      headers: creemHeaders(),
      body: JSON.stringify({
        product_id: productId,
        success_url: `${APP_URL}/settings/billing?checkout=success`,
        metadata: { orgId, billingPeriod },
      }),
    })

    if (!checkoutResponse.ok) {
      const err = await checkoutResponse.text()
      fastify.log.error({ err }, 'Creem checkout failed')
      throw new AppError(500, 'Failed to create checkout session')
    }

    const checkout = await checkoutResponse.json() as { checkout_url: string }

    return {
      data: { checkoutUrl: checkout.checkout_url },
    }
  })

  // POST /api/organizations/:orgId/billing/portal
  fastify.post('/organizations/:orgId/billing/portal', {
    preHandler: [
      fastify.authenticate,
      validate({ params: orgParamsSchema }),
    ],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }

    await fastify.ensureAdmin(request.userId!, orgId)

    const customer = await prisma.billingCustomer.findUnique({
      where: { organizationId: orgId },
    })

    if (!customer) {
      throw new AppError(400, 'No active subscription found. Upgrade to a paid plan first.', 'NO_SUBSCRIPTION')
    }

    const portalResponse = await fetch(`${CREEM_API}/v1/customers/billing`, {
      method: 'POST',
      headers: creemHeaders(),
      body: JSON.stringify({
        customer_id: customer.providerCustomerId,
      }),
    })

    if (!portalResponse.ok) {
      fastify.log.error('Failed to create customer portal')
      throw new AppError(500, 'Failed to create customer portal')
    }

    const portal = await portalResponse.json() as { customer_portal_link: string }

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

    let eventData: any

    try {
      eventData = JSON.parse(body)
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

          if (!orgId) break

          let customer = await prisma.billingCustomer.findUnique({
            where: { organizationId: orgId },
          })

          if (!customer && customerData?.id) {
            customer = await prisma.billingCustomer.create({
              data: {
                organizationId: orgId,
                providerCustomerId: String(customerData.id),
              },
            })
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
          const productId = String(eventObject.product?.id || eventObject.product)
          const creemCustomerId = String(eventObject.customer?.id || eventObject.customer)
          const status = eventType === 'subscription.trialing' ? 'on_trial' : 'active'
          const plan = getPlanFromProductId(productId)
          const orgId = eventObject.metadata?.orgId as string | undefined

          const bc = await prisma.billingCustomer.findUnique({
            where: { providerCustomerId: creemCustomerId },
          })

          if (bc) {
            const existing = await prisma.subscription.findUnique({
              where: { providerSubscriptionId: subscriptionId },
            })

            if (existing) {
              await prisma.subscription.update({
                where: { providerSubscriptionId: subscriptionId },
                data: {
                  status,
                  plan,
                  providerProductId: productId,
                  trialEndsAt: eventObject.trial_ends_at ? new Date(eventObject.trial_ends_at) : null,
                  renewsAt: eventObject.current_period_end_date ? new Date(eventObject.current_period_end_date) : null,
                  endsAt: eventObject.ends_at ? new Date(eventObject.ends_at) : null,
                },
              })
            } else {
              await prisma.subscription.create({
                data: {
                  customerId: bc.id,
                  providerSubscriptionId: subscriptionId,
                  providerProductId: productId,
                  providerPlanId: productId,
                  plan,
                  status,
                  trialEndsAt: eventObject.trial_ends_at ? new Date(eventObject.trial_ends_at) : null,
                  renewsAt: eventObject.current_period_end_date ? new Date(eventObject.current_period_end_date) : null,
                  endsAt: eventObject.ends_at ? new Date(eventObject.ends_at) : null,
                },
              })
            }

            if (plan !== 'free') {
              await prisma.organization.update({
                where: { id: bc.organizationId },
                data: { plan },
              })
            }
          } else if (orgId) {
            const newCustomer = await prisma.billingCustomer.create({
              data: {
                organizationId: orgId,
                providerCustomerId: creemCustomerId,
              },
            })

            await prisma.subscription.create({
              data: {
                customerId: newCustomer.id,
                providerSubscriptionId: subscriptionId,
                providerProductId: productId,
                providerPlanId: productId,
                plan,
                status,
                trialEndsAt: eventObject.trial_ends_at ? new Date(eventObject.trial_ends_at) : null,
                renewsAt: eventObject.current_period_end_date ? new Date(eventObject.current_period_end_date) : null,
              },
            })

            if (plan !== 'free') {
              await prisma.organization.update({
                where: { id: orgId },
                data: { plan },
              })
            }
          }

          break
        }

        case 'subscription.past_due': {
          const subscriptionId = String(eventObject.id)

          await prisma.subscription.updateMany({
            where: { providerSubscriptionId: subscriptionId },
            data: { status: 'past_due' },
          })

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
          }

          break
        }

        case 'subscription.paused': {
          const subscriptionId = String(eventObject.id)

          await prisma.subscription.updateMany({
            where: { providerSubscriptionId: subscriptionId },
            data: { status: 'paused' },
          })

          break
        }

        case 'subscription.update': {
          const subscriptionId = String(eventObject.id)
          const productId = eventObject.product?.id
            ? String(eventObject.product.id)
            : eventObject.product
              ? String(eventObject.product)
              : undefined
          const plan = productId ? getPlanFromProductId(productId) : undefined

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

function getPlanFromProductId(productId: string): string {
  for (const [key, plan] of Object.entries(PLANS)) {
    const p = plan as any
    if (p.providerMonthlyProductId === productId || p.providerYearlyProductId === productId) return key
  }
  return 'free'
}

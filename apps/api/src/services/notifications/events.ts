// ponytail: only high-signal events notify users. Activity-level noise (agent
// created/updated, doc upload progress, new logins, key generated, etc.) is
// deliberately not in this catalog. Add an event here only if a user must act on it.
export const NOTIFICATION_EVENTS = {
  // System
  PLATFORM_UPDATE: 'system.platform_update',
  NEW_FEATURE: 'system.new_feature',
  MAINTENANCE: 'system.maintenance',
  SECURITY_ALERT: 'system.security_alert',
  INCIDENT: 'system.incident',
  DOWNTIME: 'system.downtime',
  // Organization
  MEMBER_INVITED: 'member.invited',
  MEMBER_REMOVED: 'member.removed',
  MEMBER_ROLE_CHANGED: 'member.role_changed',
  // Agent
  AGENT_DELETED: 'agent.deleted',
  AGENT_FAILED: 'agent.failed',
  AGENT_QUOTA_EXCEEDED: 'agent.quota_exceeded',
  // Conversation
  CONVERSATION_ASSIGNED: 'conversation.assigned',
  CONVERSATION_NEEDS_ATTENTION: 'conversation.needs_attention',
  CONVERSATION_HIGH_PRIORITY: 'conversation.high_priority',
  CONVERSATION_ESCALATED: 'conversation.escalated',
  // Knowledge
  DOCUMENT_UPLOAD_FAILED: 'document.upload_failed',
  DOCUMENT_FAILED: 'document.failed',
  // Integration
  WHATSAPP_DISCONNECTED: 'whatsapp.disconnected',
  API_KEY_EXPIRED: 'api_key.expired',
  INTEGRATION_ERROR: 'integration.error',
  // Billing
  PAYMENT_FAILED: 'payment.failed',
  TRIAL_ENDING: 'trial.ending',
  TRIAL_EXPIRED: 'trial.expired',
  USAGE_LIMIT_REACHED: 'usage.limit_reached',
  // Analytics
  TRAFFIC_SPIKE: 'analytics.traffic_spike',
  PERFORMANCE_DROP: 'analytics.performance_drop',
  // Security
  FAILED_LOGINS: 'security.failed_logins',
  PASSWORD_CHANGED: 'security.password_changed',
  SUSPICIOUS_ACTIVITY: 'security.suspicious_activity',
  // User
  WELCOME: 'user.welcome',
  // Support tickets
  TICKET_CREATED: 'ticket.created',
} as const

export type NotificationEventType = (typeof NOTIFICATION_EVENTS)[keyof typeof NOTIFICATION_EVENTS]

export interface NotificationEventPayload {
  organizationId?: string
  userId?: string
  actorId?: string
  entityId?: string
  entityName?: string
  actionUrl?: string
  metadata?: Record<string, unknown>
}

// Module-level bus so services without Fastify access (processor, channel
// handlers, billing) can emit domain events that notification handlers listen to.
import { EventEmitter } from 'events'

export const domainEvents = new EventEmitter()
domainEvents.setMaxListeners(200)

export function emitDomainEvent(event: NotificationEventType, payload: NotificationEventPayload): void {
  domainEvents.emit(event, payload)
}

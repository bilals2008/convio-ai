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
  MEMBER_JOINED: 'member.joined',
  MEMBER_REMOVED: 'member.removed',
  MEMBER_ROLE_CHANGED: 'member.role_changed',
  ORG_SETTINGS_UPDATED: 'org.settings_updated',
  // Agent
  AGENT_CREATED: 'agent.created',
  AGENT_UPDATED: 'agent.updated',
  AGENT_DELETED: 'agent.deleted',
  AGENT_PUBLISHED: 'agent.published',
  AGENT_FAILED: 'agent.failed',
  AGENT_QUOTA_EXCEEDED: 'agent.quota_exceeded',
  // Conversation
  CONVERSATION_STARTED: 'conversation.started',
  CONVERSATION_ASSIGNED: 'conversation.assigned',
  CONVERSATION_NEEDS_ATTENTION: 'conversation.needs_attention',
  CONVERSATION_HIGH_PRIORITY: 'conversation.high_priority',
  CONVERSATION_ESCALATED: 'conversation.escalated',
  // Knowledge
  DOCUMENT_UPLOADED: 'document.uploaded',
  DOCUMENT_UPLOAD_FAILED: 'document.upload_failed',
  DOCUMENT_PROCESSING: 'document.processing',
  DOCUMENT_PROCESSED: 'document.processed',
  DOCUMENT_EMBEDDED: 'document.embedded',
  DOCUMENT_FAILED: 'document.failed',
  // Integration
  WHATSAPP_CONNECTED: 'whatsapp.connected',
  WHATSAPP_DISCONNECTED: 'whatsapp.disconnected',
  TELEGRAM_CONNECTED: 'telegram.connected',
  DISCORD_CONNECTED: 'discord.connected',
  SLACK_CONNECTED: 'slack.connected',
  API_KEY_EXPIRED: 'api_key.expired',
  INTEGRATION_ERROR: 'integration.error',
  // Billing
  SUBSCRIPTION_RENEWED: 'subscription.renewed',
  PAYMENT_FAILED: 'payment.failed',
  TRIAL_ENDING: 'trial.ending',
  TRIAL_EXPIRED: 'trial.expired',
  INVOICE_GENERATED: 'invoice.generated',
  USAGE_LIMIT_REACHED: 'usage.limit_reached',
  // Analytics
  TRAFFIC_SPIKE: 'analytics.traffic_spike',
  PERFORMANCE_DROP: 'analytics.performance_drop',
  HIGH_USAGE: 'analytics.high_usage',
  MONTHLY_REPORT: 'analytics.monthly_report',
  // Security
  NEW_LOGIN: 'security.new_login',
  FAILED_LOGINS: 'security.failed_logins',
  PASSWORD_CHANGED: 'security.password_changed',
  API_KEY_GENERATED: 'security.api_key_generated',
  API_KEY_REVOKED: 'security.api_key_revoked',
  SUSPICIOUS_ACTIVITY: 'security.suspicious_activity',
  // User
  WELCOME: 'user.welcome',
  ONBOARDING_STEP: 'user.onboarding_step',
  PROFILE_INCOMPLETE: 'user.profile_incomplete',
  FEATURE_SUGGESTION: 'user.feature_suggestion',
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

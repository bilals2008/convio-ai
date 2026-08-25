import type { NotificationCategory, NotificationPriority } from '@convio/database'
import { NOTIFICATION_EVENTS, type NotificationEventPayload, type NotificationEventType } from './events.js'

export type RecipientKind = 'actor' | 'target' | 'org_admins' | 'org_members'

export interface NotificationTemplate {
  category: NotificationCategory
  priority: NotificationPriority
  recipients: RecipientKind[]
  title: (p: NotificationEventPayload) => string
  message?: (p: NotificationEventPayload) => string
  actionUrl?: (p: NotificationEventPayload) => string
}

export const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  // System
  [NOTIFICATION_EVENTS.PLATFORM_UPDATE]: {
    category: 'system', priority: 'info', recipients: ['target'],
    title: (p) => `Platform update: ${p.entityName ?? 'what\'s new'}`,
    message: (p) => String(p.metadata?.summary ?? ''),
  },
  [NOTIFICATION_EVENTS.NEW_FEATURE]: {
    category: 'system', priority: 'low', recipients: ['target'],
    title: (p) => `New feature: ${p.entityName ?? ''}`,
    message: (p) => String(p.metadata?.summary ?? ''),
  },
  [NOTIFICATION_EVENTS.MAINTENANCE]: {
    category: 'system', priority: 'medium', recipients: ['target'],
    title: () => 'Scheduled maintenance',
    message: (p) => String(p.metadata?.summary ?? 'The platform will be briefly unavailable during the maintenance window.'),
  },
  [NOTIFICATION_EVENTS.SECURITY_ALERT]: {
    category: 'system', priority: 'high', recipients: ['target'],
    title: () => 'Security alert',
    message: (p) => String(p.metadata?.summary ?? 'Please review your account security.'),
  },
  [NOTIFICATION_EVENTS.INCIDENT]: {
    category: 'system', priority: 'critical', recipients: ['target'],
    title: () => 'Service incident',
    message: (p) => String(p.metadata?.summary ?? 'We are investigating a service incident.'),
  },
  [NOTIFICATION_EVENTS.DOWNTIME]: {
    category: 'system', priority: 'critical', recipients: ['target'],
    title: () => 'Scheduled downtime',
    message: (p) => String(p.metadata?.summary ?? 'The platform will be unavailable during this window.'),
  },
  // Organization
  [NOTIFICATION_EVENTS.MEMBER_INVITED]: {
    category: 'organization', priority: 'medium', recipients: ['org_admins', 'target'],
    title: (p) => `${p.entityName ?? 'A new member'} was invited to your organization`,
    message: () => 'An invitation was sent.',
  },
  [NOTIFICATION_EVENTS.MEMBER_REMOVED]: {
    category: 'organization', priority: 'medium', recipients: ['org_admins', 'target'],
    title: (p) => p.userId ? 'You were removed from the organization' : `${p.entityName ?? 'A member'} was removed`,
  },
  [NOTIFICATION_EVENTS.MEMBER_ROLE_CHANGED]: {
    category: 'organization', priority: 'low', recipients: ['target'],
    title: (p) => `Your role changed to ${String(p.metadata?.role ?? '')}`,
    message: (p) => `${p.actorId ? 'An admin updated your role in ' + (p.entityName ?? 'the organization') : ''}`,
  },
  // Agent
  [NOTIFICATION_EVENTS.AGENT_DELETED]: {
    category: 'agent', priority: 'medium', recipients: ['actor', 'org_admins'],
    title: (p) => `Agent "${p.entityName ?? ''}" deleted`,
  },
  [NOTIFICATION_EVENTS.AGENT_FAILED]: {
    category: 'agent', priority: 'high', recipients: ['actor', 'org_admins'],
    title: (p) => `Agent "${p.entityName ?? ''}" failed`,
    message: (p) => String(p.metadata?.error ?? 'The agent encountered an error.'),
    actionUrl: (p) => `/agents/${p.entityId ?? ''}/edit`,
  },
  [NOTIFICATION_EVENTS.AGENT_QUOTA_EXCEEDED]: {
    category: 'agent', priority: 'high', recipients: ['org_admins'],
    title: () => 'Agent quota exceeded',
    message: (p) => `Your ${p.entityName ?? 'agent'} plan limit has been reached.`,
    actionUrl: () => '/settings/billing',
  },
  // Conversation
  [NOTIFICATION_EVENTS.CONVERSATION_ASSIGNED]: {
    category: 'conversation', priority: 'medium', recipients: ['target'],
    title: () => 'Conversation assigned to you',
    actionUrl: (p) => `/conversations/${p.entityId ?? ''}`,
  },
  [NOTIFICATION_EVENTS.CONVERSATION_NEEDS_ATTENTION]: {
    category: 'conversation', priority: 'medium', recipients: ['org_admins'],
    title: () => 'Conversation needs attention',
    message: (p) => String(p.metadata?.reason ?? ''),
    actionUrl: (p) => `/conversations/${p.entityId ?? ''}`,
  },
  [NOTIFICATION_EVENTS.CONVERSATION_HIGH_PRIORITY]: {
    category: 'conversation', priority: 'high', recipients: ['org_admins'],
    title: () => 'High-priority conversation detected',
    actionUrl: (p) => `/conversations/${p.entityId ?? ''}`,
  },
  [NOTIFICATION_EVENTS.CONVERSATION_ESCALATED]: {
    category: 'conversation', priority: 'high', recipients: ['org_admins', 'target'],
    title: () => 'Conversation escalated',
    actionUrl: (p) => `/conversations/${p.entityId ?? ''}`,
  },
  // Knowledge
  [NOTIFICATION_EVENTS.DOCUMENT_UPLOAD_FAILED]: {
    category: 'knowledge', priority: 'high', recipients: ['actor'],
    title: (p) => `Upload failed for "${p.entityName ?? 'document'}"`,
    message: (p) => String(p.metadata?.error ?? 'Please try again.'),
  },
  [NOTIFICATION_EVENTS.DOCUMENT_FAILED]: {
    category: 'knowledge', priority: 'high', recipients: ['org_admins'],
    title: (p) => `Indexing failed for "${p.entityName ?? 'document'}"`,
    message: (p) => String(p.metadata?.error ?? 'The document could not be processed.'),
  },
  // Integration
  [NOTIFICATION_EVENTS.WHATSAPP_DISCONNECTED]: {
    category: 'integration', priority: 'high', recipients: ['org_admins'],
    title: () => 'WhatsApp disconnected',
    message: (p) => String(p.metadata?.reason ?? 'Reconnect to keep receiving conversations.'),
  },
  [NOTIFICATION_EVENTS.API_KEY_EXPIRED]: {
    category: 'integration', priority: 'high', recipients: ['org_admins'],
    title: (p) => `API key expired for ${p.entityName ?? 'a provider'}`,
    message: () => 'Update your provider key in Settings → Provider Keys.',
    actionUrl: () => '/settings/provider-keys',
  },
  [NOTIFICATION_EVENTS.INTEGRATION_ERROR]: {
    category: 'integration', priority: 'high', recipients: ['org_admins'],
    title: (p) => `Integration error: ${p.entityName ?? 'unknown'}`,
    message: (p) => String(p.metadata?.error ?? ''),
  },
  // Billing
  [NOTIFICATION_EVENTS.PAYMENT_FAILED]: {
    category: 'billing', priority: 'critical', recipients: ['org_admins'],
    title: () => 'Payment failed',
    message: (p) => String(p.metadata?.error ?? 'Update your payment method to avoid service interruption.'),
    actionUrl: () => '/settings/billing',
  },
  [NOTIFICATION_EVENTS.TRIAL_ENDING]: {
    category: 'billing', priority: 'medium', recipients: ['org_admins'],
    title: (p) => `Your trial ends ${String(p.metadata?.endsAt ?? 'soon')}`,
    message: () => 'Add a payment method to keep your plan.',
    actionUrl: () => '/settings/billing',
  },
  [NOTIFICATION_EVENTS.TRIAL_EXPIRED]: {
    category: 'billing', priority: 'high', recipients: ['org_admins'],
    title: () => 'Your trial has ended',
    actionUrl: () => '/settings/billing',
  },
  [NOTIFICATION_EVENTS.USAGE_LIMIT_REACHED]: {
    category: 'billing', priority: 'high', recipients: ['org_admins'],
    title: () => 'Usage limit reached',
    message: (p) => `You have used ${String(p.metadata?.usage ?? '')} of your monthly limit.`,
    actionUrl: () => '/settings/billing',
  },
  // Analytics
  [NOTIFICATION_EVENTS.TRAFFIC_SPIKE]: {
    category: 'analytics', priority: 'medium', recipients: ['org_admins'],
    title: (p) => `Traffic spike detected${p.entityName ? ` for "${p.entityName}"` : ''}`,
    message: (p) => String(p.metadata?.summary ?? ''),
    actionUrl: () => '/dashboard/analytics',
  },
  [NOTIFICATION_EVENTS.PERFORMANCE_DROP]: {
    category: 'analytics', priority: 'high', recipients: ['org_admins'],
    title: () => 'Performance drop detected',
    message: (p) => String(p.metadata?.summary ?? ''),
    actionUrl: () => '/dashboard/analytics',
  },
  // Security
  [NOTIFICATION_EVENTS.FAILED_LOGINS]: {
    category: 'security', priority: 'high', recipients: ['target'],
    title: () => 'Multiple failed login attempts',
    message: (p) => `${String(p.metadata?.count ?? '')} failed attempts detected on your account.`,
    actionUrl: () => '/settings/security',
  },
  [NOTIFICATION_EVENTS.PASSWORD_CHANGED]: {
    category: 'security', priority: 'high', recipients: ['target'],
    title: () => 'Your password was changed',
    message: () => 'If this wasn\'t you, reset your password immediately.',
  },
  [NOTIFICATION_EVENTS.SUSPICIOUS_ACTIVITY]: {
    category: 'security', priority: 'critical', recipients: ['target'],
    title: () => 'Suspicious activity detected',
    message: () => 'Review your recent account activity.',
    actionUrl: () => '/settings/security',
  },
  // User
  [NOTIFICATION_EVENTS.WELCOME]: {
    category: 'user', priority: 'low', recipients: ['target'],
    title: (p) => `Welcome to Convio${p.entityName ? `, ${p.entityName}` : ''}!`,
    message: () => 'Create your first agent to get started.',
    actionUrl: () => '/agents/new',
  },
  // Support tickets
  [NOTIFICATION_EVENTS.TICKET_CREATED]: {
    category: 'organization', priority: 'medium', recipients: ['org_admins'],
    title: (p) => `New support ticket: ${p.entityName ?? ''}`,
    message: () => 'A user reported a problem and is waiting for a response.',
    actionUrl: (p) => `/support/${p.entityId ?? ''}`,
  },
}

export function getTemplate(event: NotificationEventType): NotificationTemplate | undefined {
  return NOTIFICATION_TEMPLATES[event]
}

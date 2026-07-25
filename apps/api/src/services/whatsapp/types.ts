export interface InteractiveButton {
  id: string
  title: string
}

export interface ListRow {
  id: string
  title: string
  description?: string
}

export interface ListSection {
  title: string
  rows: ListRow[]
}

export interface BusinessHoursConfig {
  timezone: string
  days: {
    [key: string]: { open: string; close: string } | null
  }
  offlineMessage?: string
}

export interface BroadcastPayload {
  id: string
  organizationId: string
  agentId: string
  name: string
  templateName: string
  templateLanguage: string
  templateParams: Record<string, string>[]
  contactFilter?: Record<string, unknown>
  scheduleCron?: string
  scheduleAt?: string
}

export interface KapsoWebhookPayload {
  object?: string
  entry?: Array<{
    id?: string
    changes?: Array<{
      value?: {
        messaging_product?: string
        metadata?: { display_phone_number?: string; phone_number_id?: string }
        contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>
        messages?: Array<{
          from?: string
          id?: string
          timestamp?: string
          type?: string
          text?: { body?: string }
          interactive?: {
            type?: string
            button_reply?: { id?: string; title?: string }
            list_reply?: { id?: string; title?: string; description?: string }
          }
          context?: { from?: string; id?: string }
          reaction?: { message_id?: string; emoji?: string }
        }>
        statuses?: Array<{
          id?: string
          status?: string
          timestamp?: string
          recipient_id?: string
          conversation?: { id?: string }
          errors?: Array<{ code?: number; title?: string; details?: string }>
        }>
      }
      field?: string
    }>
  }>
  message?: {
    from?: string
    id?: string
    text?: { body?: string }
    kapso?: { contact_name?: string }
    interactive?: {
      type?: string
      button_reply?: { id?: string; title?: string }
      list_reply?: { id?: string; title?: string; description?: string }
    }
  }
  conversation?: { phone_number?: string; kapso?: { contact_name?: string } }
}

export interface GroupMetadata {
  groupId: string
  groupSubject?: string
  author: string
  authorName?: string
}

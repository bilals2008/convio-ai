import type { InteractiveButton, ListSection } from './types.js'

export function buildInteractiveType(payload: Record<string, unknown>): Record<string, unknown> {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    type: 'interactive',
    interactive: payload,
  }
}

export function buildButtonPayload(bodyText: string, buttons: InteractiveButton[], footerText?: string) {
  return buildInteractiveType({
    type: 'button',
    body: { text: bodyText },
    ...(footerText ? { footer: { text: footerText } } : {}),
    action: {
      buttons: buttons.slice(0, 3).map((b) => ({
        type: 'reply',
        reply: { id: b.id, title: b.title.slice(0, 20) },
      })),
    },
  })
}

export function buildListPayload(
  bodyText: string,
  buttonText: string,
  sections: ListSection[],
  headerText?: string,
  footerText?: string
) {
  return buildInteractiveType({
    type: 'list',
    ...(headerText ? { header: { type: 'text', text: headerText } } : {}),
    body: { text: bodyText },
    ...(footerText ? { footer: { text: footerText } } : {}),
    action: {
      button: buttonText.slice(0, 20),
      sections: sections.map((s) => ({
        title: s.title.slice(0, 24),
        rows: s.rows.map((r) => ({
          id: r.id,
          title: r.title.slice(0, 24),
          ...(r.description ? { description: r.description.slice(0, 72) } : {}),
        })),
      })),
    },
  })
}

export function extractInteractiveReply(message: Record<string, unknown>): {
  type: 'button' | 'list'
  id: string
  title: string
} | null {
  const interactive = message.interactive as Record<string, unknown> | undefined
  if (!interactive) return null

  const buttonReply = interactive.button_reply as { id?: string; title?: string } | undefined
  if (buttonReply?.id) {
    return { type: 'button', id: buttonReply.id, title: buttonReply.title || '' }
  }

  const listReply = interactive.list_reply as { id?: string; title?: string } | undefined
  if (listReply?.id) {
    return { type: 'list', id: listReply.id, title: listReply.title || '' }
  }

  return null
}

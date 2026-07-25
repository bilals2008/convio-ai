const DISCORD_API = 'https://discord.com/api/v10'
export const BOT_COLOR = 0x22c55e

async function discordFetch(path: string, options: RequestInit = {}) {
  const url = `${DISCORD_API}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => 'unknown')
    throw new Error(`Discord API error ${res.status}: ${body}`)
  }
  return res.json()
}

// backward compat: old sendDiscordMessage signature
export async function sendDiscordMessage(
  botToken: string,
  channelId: string,
  text: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const result = await sendChannelMessage(botToken, channelId, { content: text })
    return { success: true, messageId: result.id }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to send message' }
  }
}

export async function sendChannelMessage(
  botToken: string,
  channelId: string,
  payload: Record<string, unknown>
): Promise<{ id?: string; channel_id?: string }> {
  const data = await discordFetch(`/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${botToken}` },
    body: JSON.stringify(payload),
  })
  return data as { id?: string; channel_id?: string }
}

export async function editMessage(
  botToken: string,
  channelId: string,
  messageId: string,
  payload: Record<string, unknown>
) {
  return discordFetch(`/channels/${channelId}/messages/${messageId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bot ${botToken}` },
    body: JSON.stringify(payload),
  })
}

export async function deleteMessage(botToken: string, channelId: string, messageId: string) {
  await fetch(`${DISCORD_API}/channels/${channelId}/messages/${messageId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bot ${botToken}` },
  })
}

export async function createThread(
  botToken: string,
  channelId: string,
  messageId: string,
  name: string
): Promise<string | null> {
  try {
    const data = await discordFetch(`/channels/${channelId}/messages/${messageId}/threads`, {
      method: 'POST',
      headers: { Authorization: `Bot ${botToken}` },
      body: JSON.stringify({ name, auto_archive_duration: 60, type: 12 }),
    })
    return (data as { id: string }).id
  } catch {
    return null
  }
}

export async function patchWebhookMessage(
  applicationId: string,
  interactionToken: string,
  payload: Record<string, unknown>
): Promise<{ id?: string; channel_id?: string }> {
  const data = await discordFetch(`/webhooks/${applicationId}/${interactionToken}/messages/@original`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return data as { id?: string; channel_id?: string }
}

export async function sendFollowupMessage(
  applicationId: string,
  interactionToken: string,
  payload: Record<string, unknown>
) {
  return discordFetch(`/webhooks/${applicationId}/${interactionToken}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function buildActionRow(components: Array<Record<string, unknown>>): Record<string, unknown> {
  return { type: 1, components }
}

export function buildButton(customId: string, label: string, style: number = 1, emoji?: string) {
  return {
    type: 2,
    style,
    label,
    custom_id: customId,
    ...(emoji ? { emoji: { name: emoji } } : {}),
  }
}

export function buildLinkButton(label: string, url: string) {
  return { type: 2, style: 5, label, url }
}

import crypto from 'node:crypto'

const DISCORD_API = 'https://discord.com/api/v10'

const CHAT_COMMAND = {
  name: 'chat',
  description: 'Chat with this agent',
  options: [{ type: 3, name: 'message', description: 'Your message', required: true }],
}

const RESET_COMMAND = { name: 'reset', description: 'Start a new conversation (clears chat history)' }
const SESSION_COMMAND = { name: 'session', description: 'View your current chat session details' }

export async function registerDiscordCommands(
  botToken: string,
  applicationId: string,
  guildId?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = guildId
      ? `${DISCORD_API}/applications/${applicationId}/guilds/${guildId}/commands`
      : `${DISCORD_API}/applications/${applicationId}/commands`

    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bot ${botToken}` },
      body: JSON.stringify([CHAT_COMMAND, RESET_COMMAND, SESSION_COMMAND]),
    })

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string }
      return { success: false, error: body.message || `Discord API error (${res.status})` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to register commands' }
  }
}

export async function removeDiscordCommands(
  botToken: string,
  applicationId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${DISCORD_API}/applications/${applicationId}/commands`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bot ${botToken}` },
      body: '[]',
    })

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string }
      return { success: false, error: body.message || `Discord API error (${res.status})` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to remove commands' }
  }
}

export async function setBotNickname(
  botToken: string,
  guildId: string,
  botUserId: string,
  nickname: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${DISCORD_API}/guilds/${guildId}/members/${botUserId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bot ${botToken}` },
      body: JSON.stringify({ nick: nickname }),
    })

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string }
      return { success: false, error: body.message || `Discord API error (${res.status})` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to set nickname' }
  }
}

export function verifyDiscordSignature(
  publicKey: string,
  signature: string,
  timestamp: string,
  rawBody: string
): boolean {
  try {
    if (!publicKey || !signature || !timestamp) return false

    const message = Buffer.from(timestamp + rawBody)
    const sig = Buffer.from(signature, 'hex')
    const key = crypto.createPublicKey({
      key: Buffer.concat([
        Buffer.from('302a300506032b6570032100', 'hex'),
        Buffer.from(publicKey, 'hex'),
      ]),
      format: 'der',
      type: 'spki',
    })

    return crypto.verify(null, message, key, sig)
  } catch {
    return false
  }
}

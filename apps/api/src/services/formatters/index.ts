/**
 * Channel-specific response formatter.
 *
 * AI models output markdown (e.g., **bold**, # headings, - bullet lists).
 * Each channel supports a different subset of formatting, so we convert
 * the AI's markdown to the channel's native format before sending.
 *
 * Usage:
 *   import { formatResponse } from './formatters/index.js'
 *   const formatted = formatResponse('whatsapp', aiReply)
 */
import { formatForWhatsApp } from './whatsapp.js'
import { formatForTelegram } from './telegram.js'
import { formatForDiscord } from './discord.js'
import { formatForWeb } from './web.js'

export type ChannelFormat = 'whatsapp' | 'telegram' | 'discord' | 'web' | 'slack' | 'api'

export function formatResponse(channel: string, text: string): string {
  if (!text) return text

  switch (channel) {
    case 'whatsapp':
      return formatForWhatsApp(text)
    case 'telegram':
      return formatForTelegram(text)
    case 'discord':
      return formatForDiscord(text)
    case 'slack':
      return formatForWhatsApp(text)
    case 'web':
      return formatForWeb(text)
    case 'api':
      return formatForWeb(text)
    default:
      return text
  }
}

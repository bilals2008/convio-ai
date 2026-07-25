import { cn } from '@/lib/utils'

const base = 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons'

function brandIcon(slug: string, label: string) {
  return ({ className }: { className?: string }) => (
    <img
      src={`${base}/${slug}/default.svg`}
      alt={label}
      className={cn('shrink-0 size-4', className)}
    />
  )
}

export const WhatsAppIcon = brandIcon('whatsapp', 'WhatsApp')
export const TelegramIcon = brandIcon('telegram', 'Telegram')
export const DiscordIcon = brandIcon('discord', 'Discord')
export const SlackIcon = brandIcon('slack', 'Slack')

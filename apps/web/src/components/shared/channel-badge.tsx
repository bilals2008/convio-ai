import { Globe, Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'

const CDN = 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons'

const CHANNEL_LOGO: Record<string, { logo: string | null; fallback: React.ReactNode }> = {
  whatsapp: { logo: `${CDN}/whatsapp/default.svg`, fallback: null },
  slack: { logo: `${CDN}/slack/default.svg`, fallback: null },
  discord: { logo: `${CDN}/discord/default.svg`, fallback: null },
  telegram: { logo: `${CDN}/telegram/default.svg`, fallback: null },
  web: { logo: null, fallback: <Globe className="size-2" /> },
  api: { logo: null, fallback: <Terminal className="size-2" /> },
}

export function ChannelBadge({ channel, className }: { channel: string; className?: string }) {
  const config = CHANNEL_LOGO[channel]
  if (!config) return null

  return (
    <div
      className={cn(
        'absolute -bottom-0.5 -right-0.5 z-10 flex items-center justify-center',
        'size-4 rounded-full ring-[1.5px] ring-background bg-muted',
        className
      )}
    >
      {config.logo ? (
        <img src={config.logo} alt={channel} className="size-2.5" />
      ) : (
        <span className="text-muted-foreground">{config.fallback}</span>
      )}
    </div>
  )
}

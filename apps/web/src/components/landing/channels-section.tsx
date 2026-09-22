import { Globe, type LucideIcon } from 'lucide-react'
import { Reveal } from './motion'

interface Channel {
  name: string
  src?: string
  lucide?: LucideIcon
}

const CHANNELS: Channel[] = [
  { name: 'Web widget', lucide: Globe },
  { name: 'WhatsApp', src: 'https://cdn.simpleicons.org/whatsapp' },
  { name: 'Telegram', src: 'https://cdn.simpleicons.org/telegram' },
  { name: 'Discord', src: 'https://cdn.simpleicons.org/discord' },
  { name: 'Slack', src: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/slack/default.svg' },
]

function ChannelLogo({ channel }: { channel: Channel }) {
  const Icon = channel.lucide
  return (
    <div className="flex items-center gap-2.5 whitespace-nowrap">
      {Icon ? (
        <Icon className="size-6 text-foreground/60" aria-hidden="true" />
      ) : (
        <img src={channel.src} alt="" className="size-6" loading="lazy" />
      )}
      <span className="text-[15px] font-medium text-foreground/60">{channel.name}</span>
    </div>
  )
}

export function ChannelsSection() {
  return (
    <section id="channels" className="relative overflow-hidden border-b border-border bg-background py-12 md:py-16">
      <div className="mx-auto max-w-[1160px] px-5 md:px-10">
        <Reveal y={12} duration={0.5}>
          <p className="mb-8 text-center text-[12px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            One agent, deployed to every channel
          </p>
        </Reveal>

        <Reveal y={16} duration={0.6}>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {CHANNELS.map((channel) => (
              <ChannelLogo key={channel.name} channel={channel} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

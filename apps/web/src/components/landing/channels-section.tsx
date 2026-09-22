import { Globe, type LucideIcon } from 'lucide-react'
import { ScrollReveal } from './scroll-reveal'

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
        <Icon className="size-7 text-foreground/70" aria-hidden="true" />
      ) : (
        <img src={channel.src} alt="" className="size-7" loading="lazy" />
      )}
      <span className="text-[15px] font-medium text-foreground/70">{channel.name}</span>
    </div>
  )
}

export function ChannelsSection() {
  return (
    <section id="channels" className="relative overflow-hidden border-b border-border bg-background py-10 md:py-14">
      <div className="mx-auto max-w-[1160px] px-5 md:px-10">
        <ScrollReveal variant="fadeIn">
          <p className="mb-8 text-center text-[13px] tracking-wide text-muted-foreground uppercase">
            One agent — deployed to every channel
          </p>

        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

          <div className="flex w-max animate-marquee gap-12 hover:[animation-play-state:paused] motion-reduce:[animation-play-state:paused]">
            {CHANNELS.map((channel) => (
              <ChannelLogo key={channel.name} channel={channel} />
            ))}
            {CHANNELS.map((channel) => (
              <ChannelLogo key={`${channel.name}-dup`} channel={channel} />
            ))}
          </div>
        </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

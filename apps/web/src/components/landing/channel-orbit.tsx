import { ScrollReveal } from './scroll-reveal'
import { SectionHeading } from './section-heading'
import {
  MessageCircle, Send, Bot, Boxes, Database, Code2, Mail, Phone,
  Webhook, Plug, Workflow, Cpu, Sparkles, Globe,
} from 'lucide-react'
import { WhatsAppIcon, TelegramIcon, DiscordIcon, SlackIcon, WebIcon } from './channel-icons'

const INNER = [
  { node: WebIcon, label: 'Web' },
  { node: WhatsAppIcon, label: 'WhatsApp' },
  { node: TelegramIcon, label: 'Telegram' },
  { node: DiscordIcon, label: 'Discord' },
  { node: SlackIcon, label: 'Slack' },
]

const MIDDLE = [
  { node: MessageCircle, label: 'SMS' },
  { node: Mail, label: 'Email' },
  { node: Phone, label: 'Voice' },
  { node: Bot, label: 'Agents' },
  { node: Database, label: 'RAG' },
  { node: Code2, label: 'API' },
  { node: Webhook, label: 'Webhooks' },
  { node: Plug, label: 'Plugins' },
]

const OUTER = [
  { node: Globe, label: 'Website' },
  { node: Boxes, label: 'CRM' },
  { node: Workflow, label: 'Automations' },
  { node: Cpu, label: 'AI Models' },
  { node: Sparkles, label: 'Tools' },
  { node: Send, label: 'Broadcast' },
  { node: Phone, label: 'Call Center' },
  { node: Mail, label: 'Digest' },
  { node: Code2, label: 'SDK' },
  { node: Webhook, label: 'Events' },
]

function OrbitRing({
  items,
  size,
  spin,
  counter,
}: {
  items: { node: typeof Globe; label: string }[]
  size: string
  spin: string
  counter: string
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className={`relative aspect-square ${spin}`} style={{ width: size }}>
        {items.map((item, i) => {
          const rad = ((360 / items.length) * i * Math.PI) / 180
          const x = 50 + 50 * Math.cos(rad)
          const y = 50 + 50 * Math.sin(rad)
          const Icon = item.node
          return (
            <div key={item.label} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ top: `${y}%`, left: `${x}%` }}>
              <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl bg-card border border-border flex items-center justify-center ${counter}`}>
                <Icon className="size-[18px] md:size-5 text-primary/80" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ChannelOrbit() {
  return (
    <section className="relative border-t border-border/60 overflow-hidden">
      <div className="max-w-[1160px] mx-auto px-5 md:px-10 py-20 md:py-28">
        <ScrollReveal>
          <SectionHeading
            eyebrow="One platform"
            title="Every channel. One brain."
            description="From messaging apps to your own product — Convio keeps one agent in sync across all of them."
          />
        </ScrollReveal>

      <div className="relative w-full aspect-square max-w-[520px] mx-auto mask-radial">
        {/* Center logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-card border border-border flex items-center justify-center glow-primary-sm">
            <img src="/logo.png" alt="Convio" className="w-8 h-8 md:w-10 md:h-10" />
          </div>
        </div>

        {/* Orbit rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[38%] aspect-square rounded-full border border-primary/15" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[62%] aspect-square rounded-full border border-primary/10" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[88%] aspect-square rounded-full border border-primary/5" />
        </div>

        <OrbitRing items={INNER} size="38%" spin="animate-orbit-slow" counter="animate-orbit-counter-slow" />
        <OrbitRing items={MIDDLE} size="62%" spin="animate-orbit-mid" counter="animate-orbit-counter-mid" />
        <OrbitRing items={OUTER} size="88%" spin="animate-orbit-fast" counter="animate-orbit-counter-fast" />
      </div>
      </div>
    </section>
  )
}

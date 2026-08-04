import { Globe, Braces, ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SectionHeading } from './section-heading'
import { ScrollReveal } from './scroll-reveal'

const BRAND_ICONS = 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons'

const CHANNELS = [
  {
    icon: <Globe className="size-4" />,
    name: 'Web Widget',
    description: 'Embed a chat widget on any site in minutes. No code required.',
  },
  {
    icon: <img src={`${BRAND_ICONS}/whatsapp/default.svg`} alt="WhatsApp" className="size-4" />,
    name: 'WhatsApp',
    description: 'Answer customers in the channel they already use every day.',
  },
  {
    icon: <img src={`${BRAND_ICONS}/telegram/default.svg`} alt="Telegram" className="size-4" />,
    name: 'Telegram',
    description: 'Support your community with fast, threaded conversations.',
  },
  {
    icon: <img src={`${BRAND_ICONS}/discord/default.svg`} alt="Discord" className="size-4" />,
    name: 'Discord',
    description: 'Automate member support directly inside your server.',
  },
  {
    icon: <img src={`${BRAND_ICONS}/slack/default.svg`} alt="Slack" className="size-4" />,
    name: 'Slack',
    description: 'Resolve internal requests where your team already works.',
  },
  {
    icon: <Braces className="size-4" />,
    name: 'API',
    description: 'Build custom experiences on top of the full API.',
  },
]

export function ChannelsSection() {
  return (
    <section id="channels" className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1160px] px-5 md:px-10 py-20 md:py-28">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Channels"
            title="One agent, every touchpoint"
            description="Meet customers wherever they are — your site, their inbox, or their favorite messaging app. A single agent keeps every conversation in sync."
          />
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <ul className="mt-14">
            {CHANNELS.map((channel, i) => (
              <li
                key={channel.name}
                className="group grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-1 border-t border-border py-5 transition-colors hover:bg-primary/[0.03] md:grid-cols-[64px_1fr_auto] md:py-6 md:px-3"
              >
                <span className="font-mono text-xs text-muted-foreground/70">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    {channel.icon}
                    <h3 className="text-lg font-medium text-foreground transition-colors group-hover:text-primary md:text-xl">
                      {channel.name}
                    </h3>
                  </div>
                  <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                    {channel.description}
                  </p>
                </div>
                <ArrowUpRight className="hidden size-4 text-muted-foreground/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary md:block" />
              </li>
            ))}
          </ul>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-10 flex justify-center border-t border-border pt-8">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              Connect your first channel
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { SectionHeading } from './section-heading'
import { ScrollReveal } from './scroll-reveal'
import { FloatingOrbs } from './floating-orbs'
import {
  WhatsAppIcon,
  TelegramIcon,
  DiscordIcon,
  SlackIcon,
  WebIcon,
  EmailIcon,
} from './channel-icons'
import {
  Bot,
  Database,
  Workflow,
  Code2,
  Webhook,
  AudioLines,
  Users,
  MessageSquare,
  BarChart3,
} from 'lucide-react'

const CHANNELS = [
  { name: 'WhatsApp', icon: WhatsAppIcon, color: '#25D366' },
  { name: 'Telegram', icon: TelegramIcon, color: '#229ED9' },
  { name: 'Discord', icon: DiscordIcon, color: '#5865F2' },
  { name: 'Slack', icon: SlackIcon, color: '#E01E5A' },
  { name: 'Web', icon: WebIcon, color: '#6366f1' },
  { name: 'Email', icon: EmailIcon, color: '#f59e0b' },
]

const CAPABILITIES = [
  { label: 'AI Agents', icon: Bot },
  { label: 'Knowledge Base', icon: Database },
  { label: 'RAG', icon: Workflow },
  { label: 'API', icon: Code2 },
  { label: 'Webhooks', icon: Webhook },
  { label: 'Voice', icon: AudioLines },
  { label: 'Human Handoff', icon: Users },
  { label: 'Live Chat', icon: MessageSquare },
  { label: 'Analytics', icon: BarChart3 },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 },
  }),
}

export function ChannelsSection() {
  const cardsRef = useRef(null)
  const coreRef = useRef(null)
  const pillsRef = useRef(null)
  const cardsInView = useInView(cardsRef, { once: true, margin: '-60px' })
  const coreInView = useInView(coreRef, { once: true, margin: '-40px' })
  const pillsInView = useInView(pillsRef, { once: true, margin: '-40px' })

  return (
    <section
      id="channels"
      className="relative overflow-hidden border-b border-border bg-background"
    >
      <FloatingOrbs />

      {/* Subtle top glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[320px] w-[560px] -translate-x-1/2 bg-primary/[0.04] blur-[110px]"
      />

      <div className="relative mx-auto max-w-[1160px] px-5 md:px-10 py-20 md:py-28">
        {/* Heading */}
        <ScrollReveal>
          <SectionHeading
            eyebrow="Channels"
            title={
              <>
                Every channel.{' '}
                <span className="text-primary">One brain.</span>
              </>
            }
            description="Train once, deploy everywhere. Your customers get the same intelligent experience across every channel — powered by a single knowledge base."
          />
        </ScrollReveal>

        {/* Channel Cards */}
        <div
          ref={cardsRef}
          className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6"
        >
          {CHANNELS.map((channel, i) => {
            const Icon = channel.icon
            return (
              <motion.div
                key={channel.name}
                custom={i}
                initial="hidden"
                animate={cardsInView ? 'visible' : 'hidden'}
                variants={fadeUp}
                className="group relative cursor-pointer rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                {/* Brand-color hover glow */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(200px circle at 50% 0%, ${channel.color}12, transparent 70%)`,
                  }}
                />

                <div className="relative flex flex-col items-center gap-3">
                  {/* Icon with status */}
                  <div className="relative">
                    <div
                      className="flex size-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                      style={{ background: `${channel.color}12` }}
                    >
                      <Icon className="size-6" style={{ color: channel.color }} />
                    </div>
                    {/* Connection status dot */}
                    <span
                      className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-success ring-2 ring-card"
                      aria-label="Connected"
                    />
                  </div>

                  {/* Name + status */}
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      {channel.name}
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                      Connected
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Intelligence Core Divider */}
        <motion.div
          ref={coreRef}
          initial={{ opacity: 0, y: 10 }}
          animate={coreInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-12 flex items-center justify-center"
        >
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="relative flex items-center gap-2.5 rounded-full border border-border bg-background px-4 py-1.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              One intelligence core
            </span>
          </div>
        </motion.div>

        {/* Capabilities */}
        <div
          ref={pillsRef}
          className="mt-12 flex flex-wrap justify-center gap-2.5"
        >
          {CAPABILITIES.map(({ label, icon: Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={pillsInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-2 text-[13px] text-muted-foreground backdrop-blur transition-all duration-200 hover:border-primary/30 hover:bg-card hover:text-foreground"
            >
              <Icon className="size-3.5 text-primary/70 transition-colors group-hover:text-primary" />
              {label}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

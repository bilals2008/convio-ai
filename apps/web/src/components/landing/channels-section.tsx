import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { SectionHeading } from './section-heading'
import { ScrollReveal } from './scroll-reveal'
import {
  WhatsAppIcon,
  TelegramIcon,
  DiscordIcon,
  SlackIcon,
  WebIcon,
  EmailIcon,
} from './channel-icons'

const CHANNELS = [
  { name: 'WhatsApp', icon: WhatsAppIcon, color: '#25D366' },
  { name: 'Telegram', icon: TelegramIcon, color: '#229ED9' },
  { name: 'Discord', icon: DiscordIcon, color: '#5865F2' },
  { name: 'Slack', icon: SlackIcon, color: '#E01E5A' },
  { name: 'Web', icon: WebIcon, color: '#6366f1' },
  { name: 'Email', icon: EmailIcon, color: '#f59e0b' },
]

const FEATURES = [
  'AI Agents',
  'Knowledge Base',
  'RAG',
  'API',
  'Webhooks',
  'Voice',
  'Human Handoff',
  'Live Chat',
  'More...',
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
}

export function ChannelsSection() {
  const cardsRef = useRef(null)
  const pillsRef = useRef(null)
  const previewRef = useRef(null)
  const cardsInView = useInView(cardsRef, { once: true, margin: '-60px' })
  const pillsInView = useInView(pillsRef, { once: true, margin: '-40px' })
  const previewInView = useInView(previewRef, { once: true, margin: '-60px' })

  return (
    <section
      id="channels"
      className="relative overflow-hidden border-b border-border bg-background"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[400px] w-[700px] -translate-x-1/2 bg-glow-green opacity-30"
      />

      <div className="mx-auto max-w-[1160px] px-5 md:px-10 py-20 md:py-28">
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
            description="Train once, deploy everywhere. Your customers get the same intelligent experience across every channel."
          />
        </ScrollReveal>

        {/* Channel Cards */}
        <div
          ref={cardsRef}
          className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
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
                className="group relative cursor-pointer rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="flex size-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${channel.color}10` }}
                  >
                    <Icon className="size-6" style={{ color: channel.color }} />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {channel.name}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Feature Pills */}
        <div ref={pillsRef} className="mt-12 flex flex-wrap justify-center gap-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={pillsInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-4 py-2 text-[13px] text-muted-foreground backdrop-blur transition-colors hover:border-primary/30 hover:text-foreground"
            >
              {feature}
            </motion.div>
          ))}
        </div>

        {/* Preview Container */}
        <motion.div
          ref={previewRef}
          initial={{ opacity: 0, y: 30 }}
          animate={previewInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 border-b border-border bg-secondary/30 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-400/80" />
                <div className="size-3 rounded-full bg-yellow-400/80" />
                <div className="size-3 rounded-full bg-green-400/80" />
              </div>
              <div className="ml-4 flex-1">
                <div className="mx-auto flex max-w-md items-center gap-2 rounded-lg bg-background/60 px-3 py-1.5">
                  <svg
                    className="size-3.5 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                    />
                  </svg>
                  <span className="text-xs text-muted-foreground">
                    app.convio.com/inbox
                  </span>
                </div>
              </div>
              <div className="w-16" />
            </div>

            {/* Preview Area */}
            <div className="relative aspect-video bg-gradient-to-br from-secondary/20 via-background to-secondary/10">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                    <svg
                      className="size-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-foreground/80">
                    Convio Inbox Preview
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Unified conversation view across all channels
                </p>
              </div>

              {/* Decorative grid lines */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

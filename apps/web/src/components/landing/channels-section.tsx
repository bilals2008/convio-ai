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
            {/* Preview Area */}
            <div className="relative aspect-video bg-gradient-to-br from-secondary/20 via-background to-secondary/10">
              <img
                src="https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/channel.avif"
                alt="Convio channels preview"
                className="object-cover opacity-90 transition-opacity duration-500 hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

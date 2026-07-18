import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import {
  Globe,
  MessageCircle,
  Send,
  Hash,
  Bot,
  Database,
  Code2,
  Webhook,
  Mail,
  Phone,
  ArrowRight,
  Zap,
} from 'lucide-react'

const CHANNELS = [
  {
    icon: '/icons/whatsapp.svg',
    label: 'WhatsApp',
    color: '#25D366',
  },
  {
    icon: '/icons/telegram.svg',
    label: 'Telegram',
    color: '#0088cc',
  },
  {
    icon: '/icons/discord.svg',
    label: 'Discord',
    color: '#5865F2',
  },
  {
    icon: '/icons/slack.svg',
    label: 'Slack',
    color: '#E01E5A',
  },
  {
    iconNode: Globe,
    label: 'Web',
    color: '#22c55e',
  },
  {
    iconNode: Mail,
    label: 'Email',
    color: '#f59e0b',
  },
]

const CAPABILITIES = [
  { icon: Bot, label: 'AI Agents' },
  { icon: Database, label: 'RAG' },
  { icon: Code2, label: 'API' },
  { icon: Webhook, label: 'Webhooks' },
  { icon: Phone, label: 'Voice' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 },
  }),
}

export function ChannelOrbit() {
  const sectionRef = useRef(null)
  const headingRef = useRef(null)
  const gridRef = useRef(null)
  const headingInView = useInView(headingRef, { once: true, margin: '-80px' })
  const gridInView = useInView(gridRef, { once: true, margin: '-60px' })

  return (
    <section
      id="channels"
      ref={sectionRef}
      className="relative border-b border-border bg-background overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[400px] w-[600px] -translate-x-1/2 bg-glow-green opacity-40"
      />

      <div className="mx-auto max-w-[1160px] px-5 md:px-10 py-20 md:py-28">
        {/* Heading */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'power2.out' }}
          className="mx-auto max-w-2xl text-center"
        >
          <Badge variant="tint" className="mb-4">
            <Zap className="size-3" />
            Channels
          </Badge>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Every channel. One brain.
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground">
            Train once, deploy everywhere. Your customers get the same answer no matter where they ask.
          </p>
        </motion.div>

        {/* Channel cards — horizontal strip */}
        <div ref={gridRef} className="mt-14">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4">
            {CHANNELS.map((channel, i) => (
              <motion.div
                key={channel.label}
                custom={i}
                initial="hidden"
                animate={gridInView ? 'visible' : 'hidden'}
                variants={fadeUp}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-4 sm:p-5 transition-all duration-300 hover:border-transparent hover:shadow-soft-lg"
              >
                <div
                  className="inline-flex size-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${channel.color}10` }}
                >
                  {channel.iconNode ? (
                    <channel.iconNode
                      className="size-6"
                      style={{ color: channel.color }}
                    />
                  ) : (
                    <img
                      src={channel.icon}
                      alt={channel.label}
                      className="size-6"
                    />
                  )}
                </div>
                <span className="text-sm font-medium text-foreground">{channel.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Capabilities */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={gridInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.35, ease: 'power2.out' }}
            className="mt-8 flex flex-wrap items-center justify-center gap-2"
          >
            {CAPABILITIES.map((cap) => (
              <span
                key={cap.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                <cap.icon className="size-3.5" />
                {cap.label}
              </span>
            ))}
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-primary">
              +more
              <ArrowRight className="size-3" />
            </span>
          </motion.div>
        </div>

        {/* Placeholder image — replace src with your actual screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={gridInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5, ease: 'power2.out' }}
          className="mt-16 overflow-hidden rounded-2xl border border-border bg-card shadow-soft-lg"
        >
          <AspectRatio ratio={16 / 9}>
            <img
              src="/textures/placeholder-1.png"
              alt="Convio inbox preview"
              className="h-full w-full object-cover"
            />
          </AspectRatio>
        </motion.div>
      </div>
    </section>
  )
}

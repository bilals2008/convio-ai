import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import {
  Globe,
  Database,
  Bot,
  BarChart3,
  Code2,
  Palette,
  Check,
  Layers,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Globe,
    eyebrow: 'Channels',
    title: 'Deploy everywhere instantly',
    body: 'One agent, every platform. Web, WhatsApp, Telegram, Discord, and Slack — same brain, same answers.',
    color: '#22c55e',
    span: 'col-span-1 md:col-span-2',
  },
  {
    icon: Database,
    eyebrow: 'Knowledge',
    title: 'Train on your data',
    body: 'Upload docs, paste URLs, or connect APIs. Your agent learns from YOUR knowledge.',
    color: '#6366f1',
    span: 'col-span-1',
  },
  {
    icon: Bot,
    eyebrow: 'Agents',
    title: 'Build agents that follow rules',
    body: 'Custom prompts, guardrails, and tools. Your agent stays on brand and escalates when needed.',
    color: '#f59e0b',
    span: 'col-span-1',
  },
  {
    icon: BarChart3,
    eyebrow: 'Analytics',
    title: 'See what customers ask',
    body: 'Track conversations, find gaps, and improve over time with built-in analytics.',
    color: '#22d3ee',
    span: 'col-span-1',
  },
  {
    icon: Code2,
    eyebrow: 'API',
    title: 'Integrate with anything',
    body: 'Full REST API and webhooks. Build custom flows, connect your CRM, or embed anywhere.',
    color: '#f472b6',
    span: 'col-span-1 md:col-span-2',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 },
  }),
}

export function Features() {
  const sectionRef = useRef(null)
  const headingRef = useRef(null)
  const gridRef = useRef(null)
  const headingInView = useInView(headingRef, { once: true, margin: '-80px' })
  const gridInView = useInView(gridRef, { once: true, margin: '-60px' })

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative overflow-hidden border-b border-border bg-background"
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
            <Layers className="size-3" />
            Features
          </Badge>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need.
            <br />
            Nothing you don&apos;t.
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground">
            No bloated editor, no lock-in. Just a focused tool that gets out of your way.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div
          ref={gridRef}
          className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
        >
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                custom={i}
                initial="hidden"
                animate={gridInView ? 'visible' : 'hidden'}
                variants={fadeUp}
                className={`group relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-border/60 hover:shadow-soft-lg ${feature.span}`}
              >
                {/* Hover glow */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(300px circle at 50% 0%, ${feature.color}08, transparent 60%)`,
                  }}
                />

                <div className="relative">
                  <div
                    className="mb-4 inline-flex size-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${feature.color}10` }}
                  >
                    <Icon className="size-5" style={{ color: feature.color }} />
                  </div>

                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.body}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

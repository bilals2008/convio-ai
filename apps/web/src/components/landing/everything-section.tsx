import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { SectionHeading } from './section-heading'
import { ScrollReveal } from './scroll-reveal'
import { FloatingOrbs } from './floating-orbs'
import { Check, Database, Bot, Puzzle } from 'lucide-react'

const FEATURES = [
  {
    icon: Database,
    title: 'Knowledge Base',
    description:
      'Upload docs, connect APIs, or paste URLs. Your agent learns from your data.',
    bullets: [
      'Supports PDF, DOCX, CSV, and web pages',
      'Automatic chunking and embeddings',
      'Version control for knowledge updates',
      'Multi-source retrieval with RAG',
    ],
    bgImage: '/features/brand-bg.svg',
    cubeImage: '/features/cube-brand.webp',
  },
  {
    icon: Bot,
    title: 'AI Models',
    description:
      'Choose from leading models or fine-tune your own. Deploy the best performer.',
    bullets: [
      'GPT-4o, Claude, Gemini, and open models',
      'A/B testing between model variants',
      'Custom fine-tuning on your data',
      'Automatic fallback and load balancing',
    ],
    bgImage: '/features/sales-bg.svg',
    cubeImage: '/features/cube-sales.webp',
  },
  {
    icon: Puzzle,
    title: 'Tools & Integrations',
    description:
      'Connect your stack. Give agents access to databases, CRMs, and APIs.',
    bullets: [
      'Native integrations with 50+ services',
      'Custom function calling and webhooks',
      'Stripe, Salesforce, HubSpot connectors',
      'REST and GraphQL API support',
    ],
    bgImage: '/features/support-bg.svg',
    cubeImage: '/features/cube-support.webp',
  },
]

const TRUST_ITEMS = [
  { label: 'Enterprise Ready' },
  { label: 'Secure & Private' },
  { label: 'Built for Scale' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
}

export function EverythingSection() {
  const gridRef = useRef(null)
  const trustRef = useRef(null)
  const gridInView = useInView(gridRef, { once: true, margin: '-60px' })
  const trustInView = useInView(trustRef, { once: true, margin: '-40px' })

  return (
    <section
      id="everything"
      className="relative overflow-hidden border-b border-border bg-background"
    >
      <FloatingOrbs />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[400px] w-[600px] -translate-x-1/2 bg-glow-green opacity-30"
      />

      <div className="relative mx-auto max-w-[1160px] px-5 md:px-10 py-20 md:py-28">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Features"
            title="Everything you need"
            description="From knowledge to deployment, Convio provides all the tools needed to create, manage, and scale intelligent AI agents."
          />
        </ScrollReveal>

        {/* Feature cards */}
        <div
          ref={gridRef}
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
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
                className="group relative flex flex-col rounded-2xl border border-border bg-card transition-all duration-300 hover:border-border/60 hover:shadow-soft-lg"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: 'radial-gradient(300px circle at 50% 0%, hsl(var(--primary) / 0.04), transparent 60%)',
                  }}
                />

                <div className="relative flex flex-1 flex-col p-6">
                  <div className="relative h-56 w-full overflow-hidden rounded-xl">
                    <img
                      src={feature.bgImage}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <img
                      src={feature.cubeImage}
                      alt=""
                      className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 object-contain transition-transform duration-500 group-hover:-translate-y-1/2 group-hover:scale-110"
                    />
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                      <Icon className="size-[18px] text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>

                  <ul className="mt-5 flex flex-col gap-2.5">
                    {feature.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2.5 text-sm text-muted-foreground"
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Trust row */}
        <motion.div
          ref={trustRef}
          initial={{ opacity: 0, y: 12 }}
          animate={trustInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 flex flex-wrap items-center justify-center gap-8"
        >
          {TRUST_ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
            >
              <span className="size-1.5 rounded-full bg-primary" />
              {item.label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

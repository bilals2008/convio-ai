import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { SectionHeading } from './section-heading'
import { ScrollReveal } from './scroll-reveal'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const FEATURES = [
  {
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

const TRUST_ITEMS = ['Enterprise Ready', 'Secure & Private', 'Built for Scale']

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

function FeatureRow({ feature, index }: { feature: (typeof FEATURES)[number]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reversed = index % 2 === 1

  return (
    <motion.article
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={fadeUp}
      className="grid items-center gap-10 border-t border-border py-16 md:py-20 lg:grid-cols-2 lg:gap-16"
    >
      <div className={cn(reversed && 'lg:order-2')}>
        <span className="font-mono text-xs text-muted-foreground/70">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="mt-3 font-heading text-2xl font-semibold tracking-[-0.02em] text-foreground md:text-[32px] md:leading-[1.15]">
          {feature.title}
        </h3>
        <p className="mt-3 max-w-md text-[15px] leading-[1.7] text-muted-foreground">
          {feature.description}
        </p>
        <ul className="mt-6 space-y-2.5">
          {feature.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={cn('group', reversed && 'lg:order-1')}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary/20">
          <img
            src={feature.bgImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <img
            src={feature.cubeImage}
            alt=""
            className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 object-contain transition-transform duration-500 group-hover:scale-110 md:h-40 md:w-40"
          />
        </div>
      </div>
    </motion.article>
  )
}

export function EverythingSection() {
  return (
    <section id="everything" className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1160px] px-5 md:px-10 py-20 md:py-28">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Features"
            title="Everything you need"
            description="From knowledge to deployment, Convio provides all the tools needed to create, manage, and scale intelligent AI agents."
          />
        </ScrollReveal>

        <div className="mt-10 md:mt-14">
          {FEATURES.map((feature, i) => (
            <FeatureRow key={feature.title} feature={feature} index={i} />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 border-t border-border pt-8 text-sm font-medium text-muted-foreground">
          {TRUST_ITEMS.map((item, i) => (
            <span key={item} className="inline-flex items-center gap-8">
              {i > 0 && <span className="text-primary/40">·</span>}
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

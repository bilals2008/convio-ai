import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { SectionIntro } from './section-intro'
import { Reveal, useLenis } from './motion'
import {
  Bot,
  Globe,
  Database,
  MessageSquare,
  Puzzle,
  BarChart3,
  Key,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from 'lucide-react'

const FEATURES = [
  {
    id: 'agents',
    title: 'AI Agents',
    icon: Bot,
    description: 'Custom prompts, tools, and knowledge bases, each agent built for its job.',
    image:
      'https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/landing/agent-deatils-overview-tab-ss.avif',
  },
  {
    id: 'channels',
    title: 'Multi-Channel',
    icon: Globe,
    description:
      'Deploy to WhatsApp, Telegram, Discord, Slack, and any website with a single script tag.',
    image:
      'https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/landing/deploymnet.avif',
  },
  {
    id: 'knowledge',
    title: 'Knowledge Base',
    icon: Database,
    description:
      'Upload documents, connect APIs, or paste URLs. Agents learn from your data with RAG-powered retrieval.',
    image:
      'https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/landing/kb-list-view.avif',
  },
  {
    id: 'chat',
    title: 'Real-time Chat',
    icon: MessageSquare,
    description:
      'Streaming responses over SSE. Watch your agents think and reply in real time across every channel.',
    image:
      'https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/landing/agent-playground-chatting.avif',
  },
  {
    id: 'tools',
    title: 'Custom Tools',
    icon: Puzzle,
    description:
      'Extend agents with web search, calculators, HTTP calls, and MCP servers like Notion.',
    image:
      'https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/landing/mcp-uses-notion.avif',
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: BarChart3,
    description:
      'Track conversations, messages, success rate, response time, and token usage across your agents.',
    image:
      'https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/landing/dashboard.avif',
  },
  {
    id: 'byok',
    title: 'BYOK',
    icon: Key,
    description:
      'Bring your own API keys. Use your own OpenAI, Anthropic, or Google keys, stored encrypted at rest.',
    image:
      'https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/landing/byok.avif',
  },
] as const

type Feature = (typeof FEATURES)[number]

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

export function EverythingSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const activeFeature = FEATURES[activeIndex]

  return (
    <section id="everything" className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1160px] px-5 py-24 md:px-10 md:py-32">
        <SectionIntro
          eyebrow="Features"
          title="Everything you need in one place"
          highlight="one place"
          description="Create, train, deploy, and measure your agents, no glue code, no extra services."
        />

        <Reveal y={28} className="mt-12 md:mt-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:items-center lg:gap-12">
            <div
              role="tablist"
              aria-label="Feature categories"
              className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:px-0"
            >
              {FEATURES.map((feature, index) => {
                const Icon = feature.icon
                const isActive = activeIndex === index
                return (
                  <button
                    key={feature.id}
                    type="button"
                    role="tab"
                    id={`feature-tab-${feature.id}`}
                    aria-selected={isActive}
                    aria-controls="feature-panel"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      'relative flex shrink-0 items-center gap-3 rounded-lg px-4 py-3.5 text-left text-sm font-medium transition-colors lg:w-full',
                      'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                      isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="featureTab"
                        className="absolute inset-0 rounded-lg bg-primary/[0.08]"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                    <Icon className="relative size-4 shrink-0" />
                    <span className="relative whitespace-nowrap lg:whitespace-normal">
                      {feature.title}
                    </span>
                  </button>
                )
              })}
            </div>

            <div
              id="feature-panel"
              role="tabpanel"
              aria-labelledby={`feature-tab-${activeFeature.id}`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: EASE }}
                >
                  <h3 className="font-heading text-xl font-semibold tracking-[-0.01em] text-foreground">
                    {activeFeature.title}
                  </h3>
                  <p className="mt-1.5 max-w-[62ch] text-[14px] leading-[1.7] text-muted-foreground">
                    {activeFeature.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(activeIndex)}
                    aria-label={`Zoom ${activeFeature.title} screenshot`}
                    className="group relative mt-5 block w-full cursor-zoom-in overflow-hidden rounded-xl border border-border bg-secondary/30 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <img
                      src={activeFeature.image}
                      alt={activeFeature.title}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[16/10] w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                    />
                    <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium text-foreground opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
                      <ZoomIn className="size-3.5" />
                      Zoom
                    </span>
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>

      <FeatureLightbox
        features={FEATURES}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </section>
  )
}

function FeatureLightbox({
  features,
  index,
  onClose,
  onNavigate,
}: {
  features: readonly Feature[]
  index: number | null
  onClose: () => void
  onNavigate: (i: number) => void
}) {
  const open = index !== null
  const current = index !== null ? features[index] : null
  const lenis = useLenis()

  useEffect(() => {
    if (!open) return

    lenis?.stop()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (index === null) return
      if (e.key === 'ArrowRight') onNavigate((index + 1) % features.length)
      if (e.key === 'ArrowLeft') onNavigate((index - 1 + features.length) % features.length)
    }
    window.addEventListener('keydown', onKey)

    const prevOverflow = document.body.style.overflow
    const prevFocus = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    ;(document.querySelector('[role="dialog"] button') as HTMLElement | null)?.focus()

    return () => {
      lenis?.start()
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      prevFocus?.focus()
    }
  }, [open, index, onClose, onNavigate, features.length, lenis])

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`${current.title} screenshot`}
          className="fixed inset-0 z-[999] flex flex-col bg-background/95 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24 }}
          onClick={onClose}
        >
          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-4 pt-24 pb-2 sm:px-16 sm:pt-28"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.img
              key={current.image}
              src={current.image}
              alt={current.title}
              draggable={false}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="max-h-[calc(100vh-13rem)] max-w-full rounded-xl border border-border/60 object-contain shadow-soft-lg sm:max-h-[calc(100vh-14rem)]"
            />

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-border/60 bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-foreground/10"
            >
              <X className="size-4" />
            </button>

            {features.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    index !== null && onNavigate((index - 1 + features.length) % features.length)
                  }
                  aria-label="Previous"
                  className="absolute left-3 grid size-10 place-items-center rounded-full border border-border/60 bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-foreground/10 sm:left-6"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => index !== null && onNavigate((index + 1) % features.length)}
                  aria-label="Next"
                  className="absolute right-3 grid size-10 place-items-center rounded-full border border-border/60 bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-foreground/10 sm:right-6"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>

          {features.length > 1 && (
            <div
              className="flex flex-wrap items-center justify-center gap-2 pb-5 pt-1"
              onClick={(e) => e.stopPropagation()}
            >
              {features.map((f, i) => (
                <button
                  key={f.id}
                  type="button"
                  aria-label={`View ${f.title}`}
                  aria-current={i === index}
                  onClick={() => onNavigate(i)}
                  className={cn(
                    'size-12 overflow-hidden rounded-md border transition-all duration-300 sm:size-14',
                    i === index
                      ? 'border-primary opacity-100'
                      : 'border-border opacity-45 hover:opacity-90'
                  )}
                >
                  <img src={f.image} alt="" draggable={false} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

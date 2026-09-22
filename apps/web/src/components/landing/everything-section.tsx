import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionHeading } from './section-heading'
import { ScrollReveal } from './scroll-reveal'
import { cn } from '@/lib/utils'
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
    description: 'Custom prompts, tools, and knowledge bases — each agent built for its job.',
    image: 'https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/landing/agent-deatils-overview-tab-ss.avif',
  },
  {
    id: 'channels',
    title: 'Multi-Channel',
    icon: Globe,
    description: 'Deploy your agents to WhatsApp, Telegram, Discord, Slack, and embed them on any website with a single script tag.',
    image: 'https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/landing/deploymnet.avif',
  },
  {
    id: 'knowledge',
    title: 'Knowledge Base',
    icon: Database,
    description: 'Upload documents, connect APIs, or paste URLs. Your agents learn from your data with RAG-powered retrieval.',
    image: 'https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/landing/kb-list-view.avif',
  },
  {
    id: 'chat',
    title: 'Real-time Chat',
    icon: MessageSquare,
    description: 'Streaming AI responses with SSE. Watch your agents think and respond in real-time across all channels.',
    image: 'https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/landing/agent-playground-chatting.avif',
  },
  {
    id: 'tools',
    title: 'Custom Tools',
    icon: Puzzle,
    description: 'Extend agent capabilities with web search, calculators, HTTP tools, and custom function calling.',
    image: 'https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/landing/mcp-uses-notion.avif',
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: BarChart3,
    description: 'Track conversations, messages, success rate, response time, and token usage across all your agents.',
    image: 'https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/landing/dashboard.avif',
  },
  {
    id: 'byok',
    title: 'BYOK',
    icon: Key,
    description: 'Bring your own API keys. Use your own OpenAI, Anthropic, or Google keys — stored securely and encrypted at rest.',
    image: 'https://xgarixfzlhmjtfuuhwpk.supabase.co/storage/v1/object/public/assets/landing/byok.avif',
  },
] as const

type Feature = (typeof FEATURES)[number]

const INTERVAL = 5000

export function EverythingSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const activeFeature = FEATURES[activeIndex]
  const isHovered = useRef(false)
  const startTime = useRef<number>(0)

  useEffect(() => {
    let raf = 0
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp
      const elapsed = timestamp - startTime.current
      const pct = Math.min(elapsed / INTERVAL, 1)

      if (pct >= 1) {
        if (!isHovered.current && lightboxIndex === null) {
          setActiveIndex((prev) => (prev + 1) % FEATURES.length)
        }
        startTime.current = timestamp
      }

      raf = requestAnimationFrame(animate)
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [lightboxIndex])

  const handleTabClick = (index: number) => {
    setActiveIndex(index)
    startTime.current = 0
  }

  const handleMouseEnter = () => {
    isHovered.current = true
  }

  const handleMouseLeave = () => {
    isHovered.current = false
    startTime.current = 0
  }

  const closeLightbox = () => {
    setLightboxIndex((idx) => {
      if (idx !== null) {
        setActiveIndex(idx)
        startTime.current = 0
      }
      return null
    })
  }

  return (
    <section id="everything" className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1160px] px-5 md:px-10 py-24 md:py-36">
        <ScrollReveal>
          <SectionHeading
            align="left"
            eyebrow="Features"
            title="Everything you need"
            description="From knowledge to deployment, Convio provides all the tools needed to create, manage, and scale intelligent AI agents."
          />
        </ScrollReveal>

        <div className="mt-12 md:mt-16">
          <ScrollReveal>
          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Feature categories"
            className="relative flex gap-2 overflow-x-auto pb-2 scrollbar-none md:flex-wrap md:overflow-visible md:pb-0"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
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
                  onClick={() => handleTabClick(index)}
                  className={cn(
                    'relative flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-lg bg-primary/10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className="relative size-4 shrink-0" />
                  <span className="relative">{feature.title}</span>
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div
            id="feature-panel"
            role="tabpanel"
            aria-labelledby={`feature-tab-${activeFeature.id}`}
            className="relative mt-6 rounded-xl border border-border/60 bg-card"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="p-6"
              >
                <button
                  type="button"
                  onClick={() => setLightboxIndex(activeIndex)}
                  aria-label={`Zoom ${activeFeature.title} screenshot`}
                  className="group relative block w-full cursor-zoom-in overflow-hidden rounded-xl focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <img
                    src={activeFeature.image}
                    alt={activeFeature.title}
                    loading="lazy"
                    className="w-full rounded-xl border border-border bg-secondary/20 transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium text-foreground opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
                    <ZoomIn className="size-3.5" />
                    Zoom
                  </span>
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
          </ScrollReveal>
        </div>
      </div>

      <FeatureLightbox
        features={FEATURES}
        index={lightboxIndex}
        onClose={closeLightbox}
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

  const go = (dir: 1 | -1) => {
    if (index === null) return
    onNavigate((index + dir + features.length) % features.length)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    const prevFocus = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    ;(document.querySelector('[role="dialog"] button') as HTMLElement | null)?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      prevFocus?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, onClose])

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
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
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
                  onClick={() => go(-1)}
                  aria-label="Previous"
                  className="absolute left-3 grid size-10 place-items-center rounded-full border border-border/60 bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-foreground/10 sm:left-6"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
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

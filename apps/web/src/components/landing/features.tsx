import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Bot, Globe, MessageSquare, BarChart3, Zap } from 'lucide-react'
import { ScrollReveal } from './scroll-reveal'

const features = [
  {
    icon: Brain,
    title: 'AI Agents',
    description: 'Create intelligent agents with custom prompts, tools, and memory. Choose from multiple AI models.',
    detail: 'Define system prompts, attach tools, and set memory rules. Each agent operates autonomously with its own configuration.',
    accent: 'bg-blue-500/10 text-blue-500',
  },
  {
    icon: Bot,
    title: 'Smart Chatbots',
    description: 'Build and deploy chatbots with custom branding, welcome messages, and offline support.',
    detail: 'Customize every pixel of your chatbot. Set welcome flows, offline responses, and brand colors to match your identity.',
    accent: 'bg-emerald-500/10 text-emerald-500',
  },
  {
    icon: Globe,
    title: 'Multi-Channel',
    description: 'Deploy to Web, WhatsApp, Telegram, Discord, and Slack from a single dashboard.',
    detail: 'One agent, every platform. Configure once and deploy everywhere — no duplicate setups, no sync issues.',
    accent: 'bg-violet-500/10 text-violet-500',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Real-time streaming responses, typing indicators, and human handoff when needed.',
    detail: 'Users see responses as they generate. Typing indicators keep the conversation alive. Hand off to a human when needed.',
    accent: 'bg-amber-500/10 text-amber-500',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Track conversations, messages, user satisfaction, and bot performance metrics.',
    detail: 'Understand what users ask, where they drop off, and how your agents perform — all in real time.',
    accent: 'bg-rose-500/10 text-rose-500',
  },
  {
    icon: Zap,
    title: 'Knowledge Base',
    description: 'Upload documents or scrape URLs. Your AI agents will use RAG to answer accurately.',
    detail: 'Drop in PDFs, docs, or website URLs. Your agents automatically retrieve the most relevant context for every question.',
    accent: 'bg-primary/10 text-primary',
  },
]

function FeatureTab({
  feature,
  isActive,
  onClick,
  tabIndex,
}: {
  feature: (typeof features)[number]
  isActive: boolean
  onClick: () => void
  tabIndex?: number
}) {
  const Icon = feature.icon
  return (
    <button
      role="tab"
      aria-selected={isActive}
      tabIndex={tabIndex}
      onClick={onClick}
      className={`group relative flex items-center gap-3.5 w-full text-left px-4 py-3.5 rounded-xl transition-colors duration-200 cursor-pointer ${
        isActive
          ? 'bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
          : 'hover:bg-card/50'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="feature-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-full"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}

      <div
        className={`flex items-center justify-center size-9 rounded-lg shrink-0 transition-colors duration-200 ${
          isActive ? feature.accent : 'bg-muted text-muted-foreground group-hover:text-foreground'
        }`}
      >
        <Icon className="size-[18px]" />
      </div>

      <div className="min-w-0">
        <div
          className={`text-[13px] font-semibold leading-tight transition-colors duration-200 ${
            isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
          }`}
        >
          {feature.title}
        </div>
        <div className="text-[12px] text-muted-foreground/70 leading-snug mt-0.5 line-clamp-1">
          {feature.description}
        </div>
      </div>
    </button>
  )
}

function FeatureContent({
  feature,
  activeIndex,
  total,
  onSelect,
}: {
  feature: (typeof features)[number]
  activeIndex: number
  total: number
  onSelect: (i: number) => void
}) {
  const Icon = feature.icon
  return (
    <div className="relative bg-card rounded-2xl border border-border overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="p-6 md:p-8 lg:p-10"
        >
          <div className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-primary/8 to-transparent blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div className={`flex items-center justify-center size-10 md:size-12 rounded-xl ${feature.accent}`}>
                <Icon className="size-5 md:size-6" />
              </div>
              <span className="text-[11px] font-mono text-muted-foreground/50 tracking-wider">
                {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
            </div>

            <h3 className="font-heading text-[clamp(20px,2.8vw,32px)] font-semibold text-foreground leading-[1.2] tracking-[-0.01em] mb-2 md:mb-3">
              {feature.title}
            </h3>

            <p className="text-[14px] md:text-[15px] text-muted-foreground leading-[1.7] max-w-[440px] mb-5 md:mb-6">
              {feature.description}
            </p>

            <div className="h-px bg-border w-full mb-5 md:mb-6" />

            <p className="text-[13px] text-muted-foreground/80 leading-[1.7] max-w-[440px]">
              {feature.detail}
            </p>

            <div className="flex items-center gap-2 mt-6 md:mt-8" role="tablist" aria-label="Features">
              {Array.from({ length: total }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => onSelect(i)}
                  role="tab"
                  aria-selected={i === activeIndex}
                  aria-label={`Go to feature ${i + 1}`}
                  className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                    i === activeIndex
                      ? 'w-6 bg-primary'
                      : 'w-1.5 bg-border hover:bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export function Features() {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = features[activeIndex]
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Focus the active tab after keyboard navigation
  useEffect(() => {
    tabRefs.current[activeIndex]?.focus()
  }, [activeIndex])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        setActiveIndex((prev) => (prev + 1) % features.length)
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        setActiveIndex((prev) => (prev - 1 + features.length) % features.length)
      }
    },
    [],
  )

  return (
    <section id="features" className="max-w-[1160px] mx-auto px-5 md:px-10 py-16 md:py-24">
      <ScrollReveal>
        <div className="text-center mb-14">
          <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-primary mb-2">
            Why Convio
          </div>
          <h2 className="font-heading text-[clamp(26px,3.6vw,46px)] text-foreground leading-[1.15] tracking-[-0.02em] mb-3">
            Built different. By design.
          </h2>
          <p className="text-[15px] text-muted-foreground leading-[1.65] max-w-[490px] mx-auto">
            Everything you need to build, deploy, and manage intelligent conversational
            experiences — from one dashboard.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className="relative">
          {/* Mobile: horizontal scroll tabs */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-none" role="tablist" aria-label="Features">
            {features.map((f, i) => (
              <button
                key={f.title}
                onClick={() => setActiveIndex(i)}
                role="tab"
                aria-selected={i === activeIndex}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-medium whitespace-nowrap shrink-0 transition-colors duration-200 ${
                  i === activeIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <f.icon className="size-3.5" />
                {f.title}
              </button>
            ))}
          </div>

          {/* Desktop: two-column layout */}
          <div className="hidden md:grid md:grid-cols-[280px_1fr] gap-6 items-start">
            {/* Left: feature tabs — no wrapper div, FeatureTab IS the tab */}
            <div
              className="flex flex-col gap-1 sticky top-24"
              role="tablist"
              aria-label="Features"
              onKeyDown={handleKeyDown}
            >
              {features.map((f, i) => (
                <FeatureTab
                  key={f.title}
                  feature={f}
                  isActive={i === activeIndex}
                  onClick={() => setActiveIndex(i)}
                  tabIndex={i === activeIndex ? 0 : -1}
                />
              ))}
            </div>

            {/* Right: feature content */}
            <div className="min-h-[380px]">
              <FeatureContent
                feature={active}
                activeIndex={activeIndex}
                total={features.length}
                onSelect={setActiveIndex}
              />
            </div>
          </div>

          {/* Mobile: feature content (stacked) */}
          <div className="md:hidden mt-4">
            <FeatureContent
              feature={active}
              activeIndex={activeIndex}
              total={features.length}
              onSelect={setActiveIndex}
            />
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}

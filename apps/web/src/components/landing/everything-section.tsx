import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionHeading } from './section-heading'
import { ScrollReveal } from './scroll-reveal'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { cn } from '@/lib/utils'
import {
  Bot,
  Globe,
  Database,
  MessageSquare,
  Puzzle,
  BarChart3,
  Shield,
  Key,
  CreditCard,
  Settings,
} from 'lucide-react'

const FEATURES = [
  {
    id: 'agents',
    title: 'AI Agents',
    icon: Bot,
    description: 'Configure AI agents with custom prompts, tools, and knowledge bases. Each agent is fully customizable for your specific use case.',
    image: 'https://placehold.co/800x500/1c1c1c/1cca4a?text=AI+Agents',
  },
  {
    id: 'channels',
    title: 'Multi-Channel',
    icon: Globe,
    description: 'Deploy your agents to WhatsApp, Telegram, Discord, Slack, and embed them on any website with a single script tag.',
    image: 'https://placehold.co/800x500/1c1c1c/1cca4a?text=Multi+Channel',
  },
  {
    id: 'knowledge',
    title: 'Knowledge Base',
    icon: Database,
    description: 'Upload documents, connect APIs, or paste URLs. Your agents learn from your data with RAG-powered retrieval.',
    image: 'https://placehold.co/800x500/1c1c1c/1cca4a?text=Knowledge+Base',
  },
  {
    id: 'chat',
    title: 'Real-time Chat',
    icon: MessageSquare,
    description: 'Streaming AI responses with SSE. Watch your agents think and respond in real-time across all channels.',
    image: 'https://placehold.co/800x500/1c1c1c/1cca4a?text=Real+time+Chat',
  },
  {
    id: 'tools',
    title: 'Custom Tools',
    icon: Puzzle,
    description: 'Extend agent capabilities with web search, calculators, HTTP tools, and custom function calling.',
    image: 'https://placehold.co/800x500/1c1c1c/1cca4a?text=Custom+Tools',
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: BarChart3,
    description: 'Track conversations, messages, success rate, response time, and token usage across all your agents.',
    image: 'https://placehold.co/800x500/1c1c1c/1cca4a?text=Analytics',
  },
  {
    id: 'teams',
    title: 'Team Collaboration',
    icon: Shield,
    description: 'Multi-tenant organizations with role-based access control. Manage your team with owner, admin, member, and viewer roles.',
    image: 'https://placehold.co/800x500/1c1c1c/1cca4a?text=Team+Collaboration',
  },
  {
    id: 'byok',
    title: 'BYOK',
    icon: Key,
    description: 'Bring your own API keys. Use your own OpenAI, Anthropic, or Google keys — stored securely and encrypted at rest.',
    image: 'https://placehold.co/800x500/1c1c1c/1cca4a?text=BYOK',
  },
  {
    id: 'billing',
    title: 'Billing',
    icon: CreditCard,
    description: 'Subscription plans via Creem. Free, Pro, Business, and Enterprise tiers to match your growth.',
    image: 'https://placehold.co/800x500/1c1c1c/1cca4a?text=Billing',
  },
  {
    id: 'admin',
    title: 'Admin Panel',
    icon: Settings,
    description: 'Platform-wide management: users, organizations, tickets, billing, and audit logs — all in one place.',
    image: 'https://placehold.co/800x500/1c1c1c/1cca4a?text=Admin+Panel',
  },
]

const INTERVAL = 5000

export function EverythingSection() {
  const [activeIndex, setActiveIndex] = useState(0)
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
        if (!isHovered.current) {
          setActiveIndex((prev) => (prev + 1) % FEATURES.length)
        }
        startTime.current = timestamp
      }

      raf = requestAnimationFrame(animate)
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [])

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
          {/* Tabs */}
          <div
            className="relative flex gap-2 overflow-x-auto pb-2 scrollbar-none"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon
              const isActive = activeIndex === index
              return (
                <button
                  key={feature.id}
                  onClick={() => handleTabClick(index)}
                  className={cn(
                    'relative flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
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
          <div className="relative mt-6 overflow-hidden rounded-2xl border border-border bg-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="p-6"
              >
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="font-heading text-2xl font-semibold tracking-[-0.02em] text-foreground">
                      {activeFeature.title}
                    </h3>
                    <p className="mt-2 max-w-lg text-[15px] leading-[1.7] text-muted-foreground">
                      {activeFeature.description}
                    </p>
                  </div>
                  <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-xl bg-secondary/20">
                    <img
                      src={activeFeature.image}
                      alt={activeFeature.title}
                      className="h-full w-full object-cover"
                    />
                  </AspectRatio>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

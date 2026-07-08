import { Brain, Bot, Globe, MessageSquare, BarChart3, Zap } from 'lucide-react'
import { ScrollReveal } from './scroll-reveal'

const features = [
  {
    icon: Brain,
    title: 'AI Agents',
    description: 'Create intelligent agents with custom prompts, tools, and memory. Choose from multiple AI models.',
  },
  {
    icon: Bot,
    title: 'Smart Chatbots',
    description: 'Build and deploy chatbots with custom branding, welcome messages, and offline support.',
  },
  {
    icon: Globe,
    title: 'Multi-Channel',
    description: 'Deploy to Web, WhatsApp, Telegram, Discord, and Slack from a single dashboard.',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Real-time streaming responses, typing indicators, and human handoff when needed.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Track conversations, messages, user satisfaction, and bot performance metrics.',
  },
  {
    icon: Zap,
    title: 'Knowledge Base',
    description: 'Upload documents or scrape URLs. Your AI agents will use RAG to answer accurately.',
  },
]

function FeatureBlock({ icon: Icon, title, description }: { icon: typeof Brain; title: string; description: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-7 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_10px_40px_-15px_rgba(0,0,0,0.25)]">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-24 bg-gradient-to-b from-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/15">
          <Icon className="size-5" />
        </div>
        <h3 className="mb-1.5 text-[14px] font-semibold text-foreground">{title}</h3>
        <p className="text-[13px] leading-[1.65] text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export function Features() {
  return (
    <section id="features" className="max-w-[1160px] mx-auto px-5 md:px-10 py-16">
      <ScrollReveal>
        <div className="text-center mb-14">
          <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-primary mb-2">Why Convio</div>
          <h2 className="font-heading text-[clamp(26px,3.6vw,46px)] text-foreground leading-[1.15] tracking-[-0.02em] mb-3">
            Built different. By design.
          </h2>
          <p className="text-[15px] text-muted-foreground leading-[1.65] max-w-[490px] mx-auto">
            Everything you need to build, deploy, and manage intelligent conversational
            experiences — from one dashboard.
          </p>
        </div>
      </ScrollReveal>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {features.map((feature, i) => (
          <ScrollReveal key={feature.title} delay={i * 0.06}>
            <FeatureBlock {...feature} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}

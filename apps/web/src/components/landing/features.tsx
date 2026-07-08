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
    <div className="bg-card rounded-[14px] p-[34px_30px] border border-border">
      <div className="w-10 h-10 rounded-[9px] bg-primary/10 flex items-center justify-center text-primary mb-4">
        <Icon className="size-5" />
      </div>
      <h3 className="text-[14px] font-semibold text-foreground mb-[7px]">{title}</h3>
      <p className="text-[13px] text-muted-foreground leading-[1.65]">{description}</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
        {features.map((feature, i) => (
          <ScrollReveal key={feature.title} delay={i * 0.06}>
            <FeatureBlock {...feature} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}

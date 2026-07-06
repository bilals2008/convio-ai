import { Card, CardContent } from '@/components/ui/card'
import { 
  Bot, 
  Brain, 
  Globe, 
  BarChart3, 
  MessageSquare, 
  Zap 
} from 'lucide-react'

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

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to build{' '}
            <span className="text-primary">powerful chatbots</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            From AI configuration to multi-channel deployment, Convio has all the tools 
            you need to create intelligent conversational experiences.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="group hover:shadow-lg transition-all hover:border-primary/30">
              <CardContent className="p-6">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="size-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

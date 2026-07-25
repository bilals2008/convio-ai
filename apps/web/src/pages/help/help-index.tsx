import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, ThumbsUp, ThumbsDown, Bot, MessageSquare, Share2, Database, BarChart3, Puzzle, Zap, Rocket, User } from 'lucide-react'

export default function HelpIndexPage() {
  const { pathname } = useLocation()

  return (
    <div>
      {/* Breadcrumb + Feedback */}
      <div className="flex items-center justify-between mb-6">
        <nav className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <Link to="/help" className="hover:text-foreground transition-colors">Documentation</Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-foreground font-medium">Introduction</span>
        </nav>
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <span>Was this helpful?</span>
          <button className="p-1 rounded hover:bg-muted transition-colors" aria-label="Yes">
            <ThumbsUp className="size-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-muted transition-colors" aria-label="No">
            <ThumbsDown className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Title */}
      <h1 className="font-heading text-[2rem] font-semibold tracking-tight leading-tight mb-3">
        Welcome to Convio <span className="inline-block animate-[wave_2s_ease-in-out_infinite]">👋</span>
      </h1>

      {/* Description */}
      <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-[600px]">
        Convio is your all-in-one platform to build, manage, and deploy AI agents and chatbots across multiple channels with ease.
      </p>

      {/* Callout */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-5 mb-10">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Bot className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-foreground text-[15px] mb-1">Build smarter conversations</h3>
            <p className="text-muted-foreground text-[13px] leading-relaxed">
              Create AI agents with custom knowledge, tools, and memory. Deploy them where your users are.
            </p>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <h2 className="font-heading text-xl font-semibold tracking-tight mb-5">What you can do with Convio</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
        <FeatureCard
          icon={Bot}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Create AI Agents"
          description="Configure agents with custom instructions, tools, and knowledge."
          href="/help/ai-agents"
        />
        <FeatureCard
          icon={MessageSquare}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
          title="Build Chatbots"
          description="Turn your agents into chatbots and deploy anywhere."
          href="/help/web-widget"
        />
        <FeatureCard
          icon={Share2}
          iconBg="bg-orange-500/10"
          iconColor="text-orange-500"
          title="Connect Channels"
          description="Deploy on web, WhatsApp, Telegram, Messenger and more."
          href="/help/channels"
        />
        <FeatureCard
          icon={Database}
          iconBg="bg-violet-500/10"
          iconColor="text-violet-500"
          title="Knowledge Base"
          description="Upload files, sync websites, and provide custom data to your agents."
          href="/help/knowledge-bases"
        />
        <FeatureCard
          icon={BarChart3}
          iconBg="bg-rose-500/10"
          iconColor="text-rose-500"
          title="Analytics"
          description="Track performance, user interactions, and agent insights."
          href="/help/analytics"
        />
        <FeatureCard
          icon={Puzzle}
          iconBg="bg-sky-500/10"
          iconColor="text-sky-500"
          title="Integrations"
          description="Connect with 3rd party tools and APIs."
          href="/help/channels"
        />
      </div>

      {/* Next Steps */}
      <h2 className="font-heading text-xl font-semibold tracking-tight mb-5">Next Steps</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <NextStepCard
          icon={Zap}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-500"
          title="Quick Start"
          description="Get up and running in 5 minutes"
          href="/help/what-is-convio"
        />
        <NextStepCard
          icon={Bot}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Create Your First Agent"
          description="Build and configure your AI agent"
          href="/help/creating-agent"
        />
        <NextStepCard
          icon={MessageSquare}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
          title="Deploy Your Chatbot"
          description="Embed and go live on your website"
          href="/help/embedding"
        />
      </div>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  href,
}: {
  icon: typeof Bot
  iconBg: string
  iconColor: string
  title: string
  description: string
  href: string
}) {
  return (
    <Link
      to={href}
      className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
    >
      <div className={`flex size-9 items-center justify-center rounded-lg ${iconBg} mb-3`}>
        <Icon className={`size-4.5 ${iconColor}`} />
      </div>
      <h3 className="font-heading font-semibold text-foreground text-[14px] mb-1">{title}</h3>
      <p className="text-muted-foreground text-[12.5px] leading-relaxed">{description}</p>
    </Link>
  )
}

function NextStepCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  href,
}: {
  icon: typeof Zap
  iconBg: string
  iconColor: string
  title: string
  description: string
  href: string
}) {
  return (
    <Link
      to={href}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
    >
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className={`size-4.5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-heading font-semibold text-foreground text-[13px]">{title}</h3>
        <p className="text-muted-foreground text-[12px] leading-relaxed">{description}</p>
      </div>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors" />
    </Link>
  )
}

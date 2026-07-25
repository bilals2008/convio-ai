import { Bot, MessageSquare, Share2, Database, BarChart3, Puzzle, Zap } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocNextStepCard, DocCardGrid } from '@/components/docs'

export default function HelpIndexPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/help' },
          { label: 'Introduction' },
        ]}
        title="Welcome to Convio 👋"
        description="Convio is your all-in-one platform to build, manage, and deploy AI agents and chatbots across multiple channels with ease."
      />

      <DocCallout icon={Bot} title="Build smarter conversations">
        Create AI agents with custom knowledge, tools, and memory. Deploy them where your users are.
      </DocCallout>

      <h2>What you can do with Convio</h2>
      <DocCardGrid>
        <DocFeatureCard
          icon={Bot}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Create AI Agents"
          description="Configure agents with custom instructions, tools, and knowledge."
          href="/help/ai-agents"
        />
        <DocFeatureCard
          icon={MessageSquare}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="Build Chatbots"
          description="Turn agents into chatbots and deploy anywhere."
          href="/help/web-widget"
        />
        <DocFeatureCard
          icon={Share2}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="Connect Channels"
          description="Deploy on web, WhatsApp, Telegram, and more."
          href="/help/channels"
        />
        <DocFeatureCard
          icon={Database}
          iconBg="bg-accent"
          iconColor="text-primary"
          title="Knowledge Base"
          description="Upload files, sync websites, and provide custom data."
          href="/help/knowledge-bases"
        />
        <DocFeatureCard
          icon={BarChart3}
          iconBg="bg-destructive/10"
          iconColor="text-destructive"
          title="Analytics"
          description="Track performance, interactions, and agent insights."
          href="/help/analytics"
        />
        <DocFeatureCard
          icon={Puzzle}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="Integrations"
          description="Connect with 3rd party tools and APIs."
          href="/help/channels"
        />
      </DocCardGrid>

      <h2>Next Steps</h2>
      <DocCardGrid>
        <DocNextStepCard
          icon={Zap}
          iconBg="bg-success/10"
          iconColor="text-success"
          title="Quick Start"
          href="/help/what-is-convio"
        />
        <DocNextStepCard
          icon={Bot}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Create Your First Agent"
          href="/help/creating-agent"
        />
        <DocNextStepCard
          icon={MessageSquare}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="Deploy Your Chatbot"
          href="/help/embedding"
        />
      </DocCardGrid>
    </DocContent>
  )
}

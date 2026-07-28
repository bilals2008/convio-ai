import { HelpCircle, Bot, Layers } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocNextStepCard, DocCardGrid } from '@/components/docs'

export default function FAQsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'FAQs', href: '/docs' },
          { label: 'General FAQs' },
        ]}
        title="General FAQs"
        description="Common questions about Convio — what it is, how it works, and what you can do with it."
      />

      <h2 id="overview">Overview</h2>
      <p>
        This page answers the most common questions about Convio. If you don't find what you're looking for, check the <a href="/docs/technical-faqs">Technical FAQs</a> or <a href="/docs/billing-faqs">Billing FAQs</a>.
      </p>

      <h2 id="general">General Questions</h2>

      <h3 id="what-is-convio">What is Convio?</h3>
      <p>
        Convio is an AI-powered platform that lets you build, manage, and deploy intelligent agents and chatbots across multiple channels. It combines a visual agent builder, managed knowledge bases, and multi-channel deployment into a single dashboard — no coding required.
      </p>

      <h3 id="is-convio-free">Is Convio free?</h3>
      <p>
        Convio offers a free tier with limited usage so you can explore the platform and build your first agent. Paid plans unlock higher limits, additional features, and priority support. See the <a href="/docs/plans">Plans</a> page for details.
      </p>

      <h3 id="commercial-usage">Can I use Convio for commercial purposes?</h3>
      <p>
        Yes. You can use Convio for commercial applications, including customer support, lead generation, internal tools, and any other business use case. Paid plans include commercial usage rights.
      </p>

      <h3 id="supported-models">What AI models are supported?</h3>
      <p>
        Convio supports models from OpenAI (GPT-4o, GPT-4o-mini, GPT-4.1, o1, o3), Anthropic (Claude Sonnet 4, Claude Opus 4, Claude 3.5 Haiku), Google (Gemini 2.5 Pro, Gemini 2.5 Flash), Groq (Llama 3.3 70B, Mixtral 8x7B), and OpenRouter. You can also bring your own API keys for any OpenAI-compatible endpoint, including local models.
      </p>

      <h3 id="agent-limit">How many agents can I create?</h3>
      <p>
        The number of agents depends on your plan. The free tier includes up to 2 agents, while paid plans support 5 to unlimited agents depending on the tier. Each agent can have its own knowledge base, tools, and system prompt.
      </p>

      <h3 id="conversation-limit">Is there a limit on conversations?</h3>
      <p>
        Yes, each plan includes a monthly conversation limit. The free tier includes 100 conversations per month, while paid plans range from 1,000 to unlimited. You can monitor your usage on the <a href="/docs/usage-limits">Usage</a> page and enable notifications when approaching your limit.
      </p>

      <h3 id="widget-customization">Can I customize the widget?</h3>
      <p>
        Yes. The web widget supports extensive customization including colors, logo, welcome messages, positioning, and sizing. You can match it to your brand identity without writing any code. See the <a href="/docs/widget-appearance">Widget Appearance</a> guide for details.
      </p>

      <h3 id="supported-channels">What channels are supported?</h3>
      <p>
        Convio supports web widgets, WhatsApp (via Twilio or the official API), Telegram, Slack, Discord, Messenger, and a REST API for custom integrations. Each agent can be deployed to multiple channels simultaneously.
      </p>

      <DocCallout variant="tip" icon={HelpCircle} title="Need more help?">
        Can't find your question here? Reach out via the in-app chat or email <a href="mailto:support@convio.ai">support@convio.ai</a> and we'll get back to you within 24 hours.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Bot}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Create Your First Agent"
          href="/docs/creating-agent"
        />
        <DocNextStepCard
          icon={Layers}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Set Up a Knowledge Base"
          href="/docs/creating-knowledge-base"
        />
      </DocCardGrid>
    </DocContent>
  )
}

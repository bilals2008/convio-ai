import { Link } from 'react-router-dom'
import { ArrowRight, Check, X, Minus } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout } from '@/components/docs'
import { cn } from '@/lib/utils'

interface ComparisonRow {
  feature: string
  convio: boolean | 'partial'
  openai: boolean | 'partial'
  voiceflow: boolean | 'partial'
  botpress: boolean | 'partial'
  intercom: boolean | 'partial'
  zapier: boolean | 'partial'
}

const comparisons: ComparisonRow[] = [
  { feature: 'Multi-channel deployment', convio: true, openai: false, voiceflow: true, botpress: true, intercom: true, zapier: 'partial' },
  { feature: 'WhatsApp integration', convio: true, openai: false, voiceflow: 'partial', botpress: true, intercom: true, zapier: false },
  { feature: 'Telegram integration', convio: true, openai: false, voiceflow: 'partial', botpress: true, intercom: false, zapier: false },
  { feature: 'Discord integration', convio: true, openai: false, voiceflow: false, botpress: true, intercom: false, zapier: false },
  { feature: 'Slack integration', convio: true, openai: false, voiceflow: false, botpress: true, intercom: true, zapier: 'partial' },
  { feature: 'Web widget embed', convio: true, openai: false, voiceflow: true, botpress: true, intercom: true, zapier: false },
  { feature: 'REST API', convio: true, openai: true, voiceflow: true, botpress: true, intercom: true, zapier: true },
  { feature: 'Built-in knowledge base', convio: true, openai: 'partial', voiceflow: true, botpress: true, intercom: 'partial', zapier: false },
  { feature: 'Document upload (PDF, DOCX)', convio: true, openai: false, voiceflow: true, botpress: true, intercom: false, zapier: false },
  { feature: 'URL scraping for knowledge', convio: true, openai: false, voiceflow: false, botpress: 'partial', intercom: false, zapier: false },
  { feature: 'MCP server support', convio: true, openai: false, voiceflow: false, botpress: false, intercom: false, zapier: false },
  { feature: 'Custom tools / function calling', convio: true, openai: true, voiceflow: true, botpress: true, intercom: 'partial', zapier: true },
  { feature: 'Bring your own API keys', convio: true, openai: false, voiceflow: true, botpress: true, intercom: false, zapier: false },
  { feature: 'Multi-model support', convio: true, openai: false, voiceflow: true, botpress: true, intercom: false, zapier: false },
  { feature: 'Team collaboration', convio: true, openai: false, voiceflow: true, botpress: true, intercom: true, zapier: true },
  { feature: 'Built-in analytics', convio: true, openai: 'partial', voiceflow: true, botpress: true, intercom: true, zapier: 'partial' },
  { feature: 'Conversation history', convio: true, openai: true, voiceflow: true, botpress: true, intercom: true, zapier: false },
  { feature: 'Broadcast messaging', convio: true, openai: false, voiceflow: false, botpress: false, intercom: true, zapier: false },
  { feature: 'Webhook support', convio: true, openai: false, voiceflow: 'partial', botpress: true, intercom: true, zapier: true },
  { feature: 'Self-hosted option', convio: 'partial', openai: false, voiceflow: false, botpress: true, intercom: false, zapier: false },
]

function StatusIcon({ value }: { value: boolean | 'partial' }) {
  if (value === true) return <Check className="size-3.5 text-success" />
  if (value === 'partial') return <Minus className="size-3.5 text-warning" />
  return <X className="size-3.5 text-muted-foreground/40" />
}

export default function ConvioVsOthersPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Convio vs Other Platforms' },
        ]}
        title="Convio vs Other Platforms"
        description="See how Convio compares to other AI agent and chatbot platforms. A feature-by-feature breakdown to help you choose the right tool."
      />

      <h2 id="overview">Overview</h2>
      <p>
        The AI agent platform space has many options. Convio differentiates by combining multi-channel deployment, a managed knowledge base, MCP support, and bring-your-own-keys into a single product — without requiring you to write backend code or manage infrastructure.
      </p>

      <h2 id="comparison-table">Feature Comparison</h2>
      <p>
        The table below compares Convio against five popular platforms across key capabilities.
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[12px] leading-[1.6]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Feature</th>
              <th className="text-center py-2 px-3 font-heading font-semibold text-primary">Convio</th>
              <th className="text-center py-2 px-3 font-heading font-semibold text-foreground">OpenAI Assistants</th>
              <th className="text-center py-2 px-3 font-heading font-semibold text-foreground">Voiceflow</th>
              <th className="text-center py-2 px-3 font-heading font-semibold text-foreground">Botpress</th>
              <th className="text-center py-2 px-3 font-heading font-semibold text-foreground">Intercom</th>
              <th className="text-center py-2 px-3 font-heading font-semibold text-foreground">Zapier</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((row) => (
              <tr key={row.feature} className="border-b border-border/50">
                <td className="py-2 pr-4 text-foreground">{row.feature}</td>
                <td className="text-center py-2 px-3"><StatusIcon value={row.convio} /></td>
                <td className="text-center py-2 px-3"><StatusIcon value={row.openai} /></td>
                <td className="text-center py-2 px-3"><StatusIcon value={row.voiceflow} /></td>
                <td className="text-center py-2 px-3"><StatusIcon value={row.botpress} /></td>
                <td className="text-center py-2 px-3"><StatusIcon value={row.intercom} /></td>
                <td className="text-center py-2 px-3"><StatusIcon value={row.zapier} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-muted-foreground text-[11px] mt-2">
        <Check className="size-3 inline" /> Full support &nbsp;&nbsp;
        <Minus className="size-3 inline" /> Partial / limited &nbsp;&nbsp;
        <X className="size-3 inline" /> Not available
      </p>

      <h2 id="convio-advantages">Where Convio Stands Out</h2>

      <h3 id="multi-channel-out-of-box">Multi-Channel Without the Glue Code</h3>
      <p>
        Convio deploys to WhatsApp, Telegram, Discord, Slack, and web widgets from a single agent configuration. Most competitors require separate integrations, third-party middleware, or don't support certain channels natively.
      </p>

      <h3 id="mcp-support">MCP Server Support</h3>
      <p>
        Convio is one of the few platforms that natively supports the Model Context Protocol (MCP). This means you can connect your agents to external tool servers — databases, APIs, custom services — without writing wrapper code. OpenAI Assistants and Intercom don't support MCP at all.
      </p>

      <h3 id="byok">Bring Your Own Keys</h3>
      <p>
        Store your own OpenAI, Anthropic, or Google API keys at the organization level. Your agents use your provider account, giving you full control over rate limits, billing, and model selection. Most competitors lock you into their infrastructure or require enterprise plans for this.
      </p>

      <h3 id="knowledge-bases-built-in">Managed Knowledge Bases</h3>
      <p>
        Upload PDFs, paste URLs, or connect data sources directly in Convio. The platform handles chunking, embedding, and vector search automatically. OpenAI Assistants has a basic file search, but doesn't support URL scraping or custom chunking strategies.
      </p>

      <h2 id="when-to-use-alternatives">When to Consider Alternatives</h2>

      <h3 id="openai-assistants">OpenAI Assistants API</h3>
      <p>
        Best if you only need a single-model agent with file search and code interpreter, and you're comfortable managing your own deployment. Choose OpenAI Assistants when you want deep integration with OpenAI's ecosystem (GPT-4, DALL-E, Whisper) and don't need multi-channel deployment.
      </p>

      <h3 id="voiceflow">Voiceflow</h3>
      <p>
        Strong choice for visual flow-based agent design with a drag-and-drop canvas. Choose Voiceflow if your team includes non-technical members who need to design conversation flows visually, or if you need advanced voice IVR capabilities.
      </p>

      <h3 id="botpress">Botpress</h3>
      <p>
        Good for enterprise teams that need self-hosted deployment and deep customization. Choose Botpress if you require on-premise installation, have complex compliance requirements, or need their visual flow builder for large teams.
      </p>

      <h3 id="intercom">Intercom</h3>
      <p>
        Best if AI is part of a broader customer support platform. Choose Intercom if you need a full helpdesk, ticketing system, and CRM alongside your AI agent — and your primary channel is web-based support.
      </p>

      <h3 id="zapier">Zapier</h3>
      <p>
        Ideal for simple automations and workflows that connect apps. Choose Zapier if you don't need conversational AI at all — just task automation between services. It's not a true agent platform.
      </p>

      <DocCallout variant="tip" title="The Convio Advantage">
        Convio is the right choice when you want multi-channel deployment, a managed knowledge base, and MCP extensibility in one product — without stitching together multiple tools or writing backend infrastructure code.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Link
          to="/docs/creating-account"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Create your account <ArrowRight className="size-4" />
        </Link>
        <Link
          to="/docs/what-is-convio"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Learn what Convio is <ArrowRight className="size-4" />
        </Link>
      </div>
    </DocContent>
  )
}

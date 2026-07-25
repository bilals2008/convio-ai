import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout } from '@/components/docs'

const terms = [
  {
    term: 'Agent',
    description: 'The central unit in Convio. An agent combines a system prompt, knowledge bases, and tools into a single entity that holds conversations with users. Each agent has its own configuration, personality, and capabilities.',
  },
  {
    term: 'Bot',
    description: 'A deployed instance of an agent on a specific channel. When you connect an agent to WhatsApp, that connection is a bot. The same agent can power multiple bots across different channels.',
  },
  {
    term: 'Deployment',
    description: 'The configuration that links an agent to a channel. Deployments define which agent handles conversations on which channel, along with channel-specific settings like welcome messages and business hours.',
  },
  {
    term: 'Channel',
    description: 'The surface where users interact with your agent. Supported channels include Web Widget, WhatsApp, Telegram, Discord, Slack, and the REST API. Each channel has its own deployment configuration.',
  },
  {
    term: 'Widget',
    description: 'An embeddable web chat component you can add to any website. The widget connects to a Convio agent and provides a chat interface for your visitors. Customizable for branding and positioning.',
  },
  {
    term: 'Knowledge Base',
    description: 'A collection of documents, URLs, and data that an agent can search when answering questions. Knowledge bases use vector search to find the most relevant context for each user query.',
  },
  {
    term: 'Tool',
    description: 'A function an agent can call during a conversation. Tools let agents take actions like looking up orders, creating tickets, or calling external APIs. Tools are defined with parameters and can be connected to MCP servers.',
  },
  {
    term: 'MCP (Model Context Protocol)',
    description: 'An open standard for connecting AI agents to external tools and data sources. Convio supports MCP servers as a way to extend agent capabilities with third-party integrations.',
  },
  {
    term: 'Conversation',
    description: 'A complete message thread between a user and an agent. Conversations include all messages, metadata (channel, user info, timestamps), and are stored for analytics and review.',
  },
  {
    term: 'Organization',
    description: 'A workspace that groups agents, knowledge bases, deployments, team members, and billing. All resources in Convio are scoped to an organization. You can belong to multiple orgs.',
  },
  {
    term: 'Member',
    description: 'A user who has been invited to an organization. Members have roles (Admin, Editor, Viewer) that determine what they can access and modify within the org.',
  },
  {
    term: 'Role',
    description: 'Permission level assigned to an organization member. Admins have full access, Editors can manage agents and content, Viewers can only read. Roles are org-scoped.',
  },
  {
    term: 'Provider Key',
    description: 'An API key for an AI provider (OpenAI, Anthropic, Google, etc.) stored at the organization level. When you bring your own key, agents in that org use your provider account instead of Convio\'s defaults.',
  },
  {
    term: 'Broadcast',
    description: 'A bulk message sent to many users at once through a channel. Broadcasts are useful for announcements, campaigns, and notifications. Managed from the Conversations or Deployments section.',
  },
  {
    term: 'Webhook',
    description: 'An HTTP endpoint that receives real-time event notifications from Convio. Use webhooks to trigger external workflows when events like new conversations, message received, or deployment status changes occur.',
  },
  {
    term: 'Analytics',
    description: 'Usage metrics and performance data for your agents and deployments. Includes conversation counts, response times, message volumes, knowledge base hit rates, and channel distribution.',
  },
]

export default function VocabularyPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Understanding the Convio Vocabulary' },
        ]}
        title="Understanding the Convio Vocabulary"
        description="A glossary of every key term you'll encounter in the Convio documentation and dashboard."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Convio uses specific terminology throughout the platform. This glossary defines every term so you can navigate the docs and dashboard with confidence.
      </p>

      <DocCallout variant="tip" title="Quick Reference">
        Bookmark this page — you'll come back to it as you explore deeper topics. Each term links to related documentation where available.
      </DocCallout>

      {terms.map((item) => (
        <div key={item.term} className="mb-6">
          <h3 id={item.term.toLowerCase().replace(/[\s()\/]+/g, '-').replace(/-+/g, '-')}>
            {item.term}
          </h3>
          <p>{item.description}</p>
        </div>
      ))}

      <h2 id="related">Related Pages</h2>
      <p>
        Now that you know the vocabulary, here's where to go next:
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <Link
          to="/docs/creating-agent"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Create your first agent <ArrowRight className="size-4" />
        </Link>
        <Link
          to="/docs/knowledge-bases"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Set up a knowledge base <ArrowRight className="size-4" />
        </Link>
        <Link
          to="/docs/deployments"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Deploy to a channel <ArrowRight className="size-4" />
        </Link>
      </div>
    </DocContent>
  )
}

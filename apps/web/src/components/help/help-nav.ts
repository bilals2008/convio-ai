import {
  Rocket,
  Users,
  Bot,
  Database,
  Wrench,
  MessageSquare,
  UserRound,
  Globe,
  Share2,
  Key,
  Zap,
  BarChart3,
  Shield,
  CreditCard,
  Code,
  LifeBuoy,
  type LucideIcon,
} from 'lucide-react'

export interface HelpItem {
  title: string
  href: string
  icon: LucideIcon
  description?: string
}

export interface HelpSection {
  title: string
  phase: string
  items: HelpItem[]
}

export const helpPhases: HelpSection[] = [
  {
    title: 'Getting Started',
    phase: 'Phase 1',
    items: [
      { title: 'What is Convio?', href: '/help/what-is-convio', icon: Rocket, description: 'Platform overview and core concepts' },
      { title: 'Creating an Account', href: '/help/creating-account', icon: Rocket, description: 'Sign up, verify email, set up profile' },
      { title: 'Platform Tour', href: '/help/platform-tour', icon: Rocket, description: 'Dashboard, sidebar navigation, quick stats' },
      { title: 'Your First Organization', href: '/help/first-organization', icon: Rocket, description: 'Create and set up your workspace' },
      { title: 'Convio Vocabulary', href: '/help/vocabulary', icon: Rocket, description: 'Glossary of key terms' },
    ],
  },
  {
    title: 'Organizations',
    phase: 'Phase 2',
    items: [
      { title: 'Org Management', href: '/help/organizations', icon: Users, description: 'Manage workspaces and settings' },
      { title: 'Roles & Permissions', href: '/help/roles', icon: Users, description: 'Owner, Admin, Member, Viewer' },
      { title: 'Inviting Members', href: '/help/inviting-members', icon: Users, description: 'Email invites and invite links' },
      { title: 'Managing Members', href: '/help/managing-members', icon: Users, description: 'View, change roles, remove members' },
      { title: 'Login Activity', href: '/help/login-activity', icon: Users, description: 'Sessions, devices, security' },
    ],
  },
  {
    title: 'AI Agents',
    phase: 'Phase 3',
    items: [
      { title: 'What is an AI Agent?', href: '/help/ai-agents', icon: Bot, description: 'Agent vs Bot vs Model' },
      { title: 'Creating an Agent', href: '/help/creating-agent', icon: Bot, description: 'From scratch or from template' },
      { title: 'Choosing AI Models', href: '/help/ai-models', icon: Bot, description: 'All supported providers and models' },
      { title: 'Writing System Prompts', href: '/help/system-prompts', icon: Bot, description: 'Prompt engineering tips and examples' },
      { title: 'Agent Settings', href: '/help/agent-settings', icon: Bot, description: 'Temperature, tokens, reasoning effort' },
      { title: 'Testing in the Playground', href: '/help/agent-playground', icon: Bot, description: 'Test and iterate on your agent' },
    ],
  },
  {
    title: 'Knowledge Bases',
    phase: 'Phase 4',
    items: [
      { title: 'What is a Knowledge Base?', href: '/help/knowledge-bases', icon: Database, description: 'RAG explained simply' },
      { title: 'Creating a Knowledge Base', href: '/help/creating-knowledge-base', icon: Database, description: 'Setup and connect to agents' },
      { title: 'Supported Documents', href: '/help/supported-documents', icon: Database, description: 'PDF, TXT, MD, CSV, JSON, URLs' },
      { title: 'Uploading & Processing', href: '/help/uploading-documents', icon: Database, description: 'Upload, chunking, embedding pipeline' },
      { title: 'Vector Search', href: '/help/vector-search', icon: Database, description: 'How search relevance works' },
    ],
  },
  {
    title: 'Tools & MCP',
    phase: 'Phase 5',
    items: [
      { title: 'What are Tools?', href: '/help/tools-overview', icon: Wrench, description: 'Tool-calling explained' },
      { title: 'Built-in Tools', href: '/help/built-in-tools', icon: Wrench, description: 'Web search, calculator, URL fetcher' },
      { title: 'Custom Tools', href: '/help/custom-tools', icon: Wrench, description: 'Create your own tools with JSON schema' },
      { title: 'What is MCP?', href: '/help/mcp-overview', icon: Wrench, description: 'Model Context Protocol explained' },
      { title: 'Connecting MCP Servers', href: '/help/mcp-servers', icon: Wrench, description: 'STDIO, SSE, Streamable HTTP' },
    ],
  },
  {
    title: 'Conversations',
    phase: 'Phase 6',
    items: [
      { title: 'Conversations Overview', href: '/help/conversations', icon: MessageSquare, description: 'Lifecycle and multi-channel' },
      { title: 'Managing Conversations', href: '/help/managing-conversations', icon: MessageSquare, description: 'Statuses, filters, search' },
      { title: 'Leads & Contacts', href: '/help/leads', icon: MessageSquare, description: 'Capturing lead information' },
    ],
  },
  {
    title: 'Human Handoff',
    phase: 'Phase 7',
    items: [
      { title: 'What is Human Handoff?', href: '/help/human-handoff', icon: UserRound, description: 'When and why to hand off' },
      { title: 'Setting Up Handoff', href: '/help/handoff-setup', icon: UserRound, description: 'Triggers and assignments' },
      { title: 'Agent Inbox', href: '/help/agent-inbox', icon: UserRound, description: 'Viewing and replying as a human' },
    ],
  },
  {
    title: 'Widgets & Embedding',
    phase: 'Phase 8',
    items: [
      { title: 'Web Widget', href: '/help/web-widget', icon: Globe, description: 'Widget capabilities and creation' },
      { title: 'Customizing Appearance', href: '/help/widget-appearance', icon: Globe, description: 'Colors, position, branding' },
      { title: 'Embedding on Your Site', href: '/help/embedding', icon: Globe, description: 'Script tag and JS API' },
    ],
  },
  {
    title: 'Deployments',
    phase: 'Phase 9',
    items: [
      { title: 'Channels Overview', href: '/help/channels', icon: Share2, description: 'All supported channels' },
      { title: 'WhatsApp', href: '/help/whatsapp', icon: Share2, description: 'Kapso and Twilio setup' },
      { title: 'Telegram', href: '/help/telegram', icon: Share2, description: 'BotFather and webhook setup' },
      { title: 'Discord', href: '/help/discord', icon: Share2, description: 'OAuth2 and slash commands' },
      { title: 'Slack', href: '/help/slack', icon: Share2, description: 'Event subscriptions and tokens' },
    ],
  },
  {
    title: 'Provider Keys',
    phase: 'Phase 10',
    items: [
      { title: 'BYOK Explained', href: '/help/byok', icon: Key, description: 'Bring Your Own Key' },
      { title: 'Adding Provider Keys', href: '/help/adding-provider-keys', icon: Key, description: 'Store and manage API keys' },
      { title: 'Supported Providers', href: '/help/supported-providers', icon: Key, description: 'OpenAI, Anthropic, Google, Groq, more' },
    ],
  },
  {
    title: 'Automations',
    phase: 'Phase 11',
    items: [
      { title: 'Automations Overview', href: '/help/automations', icon: Zap, description: 'What can be automated' },
      { title: 'WhatsApp Broadcasts', href: '/help/broadcasts', icon: Zap, description: 'Scheduled campaigns and templates' },
      { title: 'Webhooks', href: '/help/webhooks', icon: Zap, description: 'Events, endpoints, signatures' },
    ],
  },
  {
    title: 'Analytics',
    phase: 'Phase 12',
    items: [
      { title: 'Analytics Overview', href: '/help/analytics', icon: BarChart3, description: 'Dashboard and key metrics' },
      { title: 'Per-Agent Analytics', href: '/help/per-agent-analytics', icon: BarChart3, description: 'Individual agent performance' },
      { title: 'Audit Logs', href: '/help/audit-logs', icon: BarChart3, description: 'Full event history' },
    ],
  },
  {
    title: 'Security',
    phase: 'Phase 13',
    items: [
      { title: 'Security Overview', href: '/help/security', icon: Shield, description: 'Platform security architecture' },
      { title: 'Content Moderation', href: '/help/moderation', icon: Shield, description: 'Profanity, PII, injection protection' },
      { title: 'Data Management', href: '/help/data-management', icon: Shield, description: 'Retention, deletion, wipe' },
    ],
  },
  {
    title: 'Billing',
    phase: 'Phase 14',
    items: [
      { title: 'Plans & Pricing', href: '/help/plans', icon: CreditCard, description: 'Free, Pro, Business, Enterprise' },
      { title: 'Managing Subscriptions', href: '/help/subscriptions', icon: CreditCard, description: 'Upgrade, cancel, invoices' },
      { title: 'Usage Limits', href: '/help/usage-limits', icon: CreditCard, description: 'Agent and message quotas' },
    ],
  },
  {
    title: 'API & SDK',
    phase: 'Phase 15',
    items: [
      { title: 'API Overview', href: '/help/api-overview', icon: Code, description: 'RESTful design and authentication' },
      { title: 'Core Endpoints', href: '/help/api-endpoints', icon: Code, description: 'Agents, conversations, knowledge' },
      { title: 'Streaming API', href: '/help/streaming-api', icon: Code, description: 'SSE for real-time AI responses' },
      { title: 'SDK Reference', href: '/help/sdk', icon: Code, description: 'JavaScript/TypeScript SDK' },
    ],
  },
  {
    title: 'Troubleshooting',
    phase: 'Phase 16',
    items: [
      { title: 'Common Issues', href: '/help/common-issues', icon: LifeBuoy, description: 'Widget, agent, deployment problems' },
      { title: 'FAQs', href: '/help/faqs', icon: LifeBuoy, description: 'Frequently asked questions' },
      { title: 'Best Practices', href: '/help/best-practices', icon: LifeBuoy, description: 'Prompts, knowledge, security, costs' },
    ],
  },
]

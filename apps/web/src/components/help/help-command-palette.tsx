import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Bot, Globe, Wrench, MessageSquare, Database, Share2, Code, Shield, CreditCard } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface DocItem {
  title: string
  href: string
  description?: string
  icon?: typeof BookOpen
}

interface DocGroup {
  title: string
  color: string
  items: DocItem[]
}

const docGroups: DocGroup[] = [
  {
    title: 'Getting Started',
    color: 'text-blue-500',
    items: [
      { title: 'Overview', href: '/docs', description: 'Platform overview and core concepts', icon: BookOpen },
      { title: 'What is Convio?', href: '/docs/what-is-convio', description: 'Platform overview and core concepts', icon: BookOpen },
      { title: 'Quick Start', href: '/docs/what-is-convio', description: 'Sign up, verify email, set up profile', icon: BookOpen },
      { title: 'Create Your First Agent', href: '/docs/creating-agent', description: 'Create and set up your first AI agent', icon: Bot },
    ],
  },
  {
    title: 'Agents',
    color: 'text-purple-500',
    items: [
      { title: 'What are Agents?', href: '/docs/ai-agents', description: 'Agent vs Bot vs Model', icon: Bot },
      { title: 'Create Agent', href: '/docs/creating-agent', description: 'From scratch or from template', icon: Bot },
      { title: 'Agent Settings', href: '/docs/agent-settings', description: 'Temperature, tokens, reasoning effort', icon: Bot },
      { title: 'Tools & Capabilities', href: '/docs/tools-overview', description: 'Tool-calling explained', icon: Wrench },
      { title: 'Knowledge Base', href: '/docs/knowledge-bases', description: 'RAG explained simply', icon: Database },
    ],
  },
  {
    title: 'Chatbots & Widgets',
    color: 'text-emerald-500',
    items: [
      { title: 'Create Chatbot', href: '/docs/web-widget', description: 'Widget capabilities and creation', icon: Globe },
      { title: 'Embed on Website', href: '/docs/embedding', description: 'Script tag and JS API', icon: Globe },
      { title: 'Deployment Options', href: '/docs/channels', description: 'All supported channels', icon: Share2 },
    ],
  },
  {
    title: 'Data & Knowledge',
    color: 'text-amber-500',
    items: [
      { title: 'Data Sources', href: '/docs/knowledge-bases', description: 'Setup and connect to agents', icon: Database },
      { title: 'File Upload', href: '/docs/uploading-documents', description: 'Upload, chunking, embedding pipeline', icon: Database },
      { title: 'Text & URLs', href: '/docs/supported-documents', description: 'PDF, TXT, MD, CSV, JSON, URLs', icon: Database },
    ],
  },
  {
    title: 'Conversations',
    color: 'text-rose-500',
    items: [
      { title: 'Conversations Overview', href: '/docs/conversations', description: 'Lifecycle and multi-channel', icon: MessageSquare },
      { title: 'Managing Conversations', href: '/docs/managing-conversations', description: 'Statuses, filters, search', icon: MessageSquare },
      { title: 'Leads & Contacts', href: '/docs/leads', description: 'Capturing lead information', icon: MessageSquare },
    ],
  },
  {
    title: 'Integrations',
    color: 'text-cyan-500',
    items: [
      { title: 'WhatsApp', href: '/docs/whatsapp', description: 'Kapso and Twilio setup', icon: Share2 },
      { title: 'Telegram', href: '/docs/telegram', description: 'BotFather and webhook setup', icon: Share2 },
      { title: 'Discord', href: '/docs/discord', description: 'OAuth2 and slash commands', icon: Share2 },
      { title: 'Slack', href: '/docs/slack', description: 'Event subscriptions and tokens', icon: Share2 },
    ],
  },
  {
    title: 'API & SDK',
    color: 'text-violet-500',
    items: [
      { title: 'API Overview', href: '/docs/api-overview', description: 'RESTful design and authentication', icon: Code },
      { title: 'Core Endpoints', href: '/docs/api-endpoints', description: 'Agents, conversations, knowledge', icon: Code },
      { title: 'Streaming API', href: '/docs/streaming-api', description: 'SSE for real-time AI responses', icon: Code },
      { title: 'SDK Reference', href: '/docs/sdk', description: 'JavaScript/TypeScript SDK', icon: Code },
    ],
  },
  {
    title: 'Security & Billing',
    color: 'text-orange-500',
    items: [
      { title: 'Security Overview', href: '/docs/security', description: 'Platform security architecture', icon: Shield },
      { title: 'Content Moderation', href: '/docs/moderation', description: 'Profanity, PII, injection protection', icon: Shield },
      { title: 'Plans & Pricing', href: '/docs/plans', description: 'Free, Pro, Business, Enterprise', icon: CreditCard },
      { title: 'Managing Subscriptions', href: '/docs/managing-subscriptions', description: 'Upgrade, cancel, invoices', icon: CreditCard },
    ],
  },
]

interface HelpCommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HelpCommandPalette({ open, onOpenChange }: HelpCommandPaletteProps) {
  const navigate = useNavigate()

  const runCommand = useCallback((href: string) => {
    onOpenChange(false)
    navigate(href)
  }, [navigate, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-2.5 [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4 rounded-lg">
          <CommandInput placeholder="Search documentation..." />
          <CommandList className="max-h-[420px]">
            <CommandEmpty>No results found.</CommandEmpty>
            {docGroups.map((group) => (
              <CommandGroup key={group.title} heading={group.title}>
                {group.items.map((item) => {
                  const Icon = item.icon || BookOpen
                  return (
                    <CommandItem
                      key={item.href}
                      value={`${group.title} ${item.title}`}
                      onSelect={() => runCommand(item.href)}
                    >
                      <Icon className={`size-4 ${group.color}`} />
                      <div className="flex flex-col">
                        <span>{item.title}</span>
                        {item.description && (
                          <span className="text-[11px] text-muted-foreground leading-tight">{item.description}</span>
                        )}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

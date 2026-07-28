import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BookOpen,
  Bot,
  MessageSquare,
  Database,
  ChevronRight,
  ArrowUpRight,
  Star,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  title: string
  href: string
  icon?: LucideIcon
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Overview', href: '/docs' },
      { title: 'Quick Start', href: '/docs/what-is-convio' },
      { title: 'Create Your First Agent', href: '/docs/creating-agent' },
    ],
  },
  {
    title: 'Agents',
    items: [
      { title: 'What are Agents?', href: '/docs/ai-agents' },
      { title: 'Create Agent', href: '/docs/creating-agent' },
      { title: 'Agent Settings', href: '/docs/agent-settings' },
      { title: 'Tools & Capabilities', href: '/docs/tools-overview' },
      { title: 'Knowledge Base', href: '/docs/knowledge-bases' },
      { title: 'Memory', href: '/docs/memory' },
    ],
  },
  {
    title: 'Chatbots',
    items: [
      { title: 'Create Chatbot', href: '/docs/web-widget' },
      { title: 'Embed on Website', href: '/docs/embedding' },
      { title: 'Deployment Options', href: '/docs/channels' },
      { title: 'Channels', href: '/docs/channels' },
    ],
  },
  {
    title: 'Data & Knowledge',
    items: [
      { title: 'Data Sources', href: '/docs/knowledge-bases' },
      { title: 'File Upload', href: '/docs/uploading-documents' },
      { title: 'Text & URLs', href: '/docs/supported-documents' },
    ],
  },
  {
    title: 'Integrations',
    items: [
      { title: 'WhatsApp', href: '/docs/whatsapp' },
      { title: 'Telegram', href: '/docs/telegram' },
      { title: 'Discord', href: '/docs/discord' },
      { title: 'Slack', href: '/docs/slack' },
    ],
  },
  {
    title: 'API & SDK',
    items: [
      { title: 'API Overview', href: '/docs/api-overview' },
      { title: 'Core Endpoints', href: '/docs/api-endpoints' },
      { title: 'Streaming API', href: '/docs/streaming-api' },
      { title: 'SDK Reference', href: '/docs/sdk' },
    ],
  },
]

export function HelpSidebar() {
  const { pathname } = useLocation()
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    navGroups.forEach((group) => {
      const hasActive = group.items.some((item) => item.href === pathname)
      if (hasActive) initial.add(group.title)
    })
    if (initial.size === 0) initial.add('Getting Started')
    return initial
  })

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="size-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold font-heading">Documentation</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-2">
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.title)}
                className="flex w-full items-center justify-between px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                <span>{group.title}</span>
                <ChevronRight
                  className={cn(
                    'size-3 transition-transform duration-200',
                    expandedGroups.has(group.title) && 'rotate-90'
                  )}
                />
              </button>

              {/* Group items */}
              {expandedGroups.has(group.title) && (
                <div className="space-y-0.5 mt-0.5">
                  {group.items.map((item) => {
                    const active = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-all duration-150',
                          active
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        )}
                      >
                        <span className="truncate">{item.title}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Support card */}
      <div className="px-3 pb-4">
        <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#5865F2]/10">
              <img src="/discord.svg" alt="" className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-foreground">Need help?</p>
              <p className="text-[12px] text-muted-foreground leading-relaxed mt-0.5">
                Join our community
              </p>
            </div>
          </div>
          <a
            href="#"
            className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Discord Community
            <ArrowUpRight className="size-3" />
          </a>
        </div>
      </div>
    </div>
  )
}

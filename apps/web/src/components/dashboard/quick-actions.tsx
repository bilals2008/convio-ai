import { Bot, MessageSquare, FileText, MessageCircle } from 'lucide-react'
import { QuickActionCard } from './quick-action-card'

const actions = [
  {
    icon: Bot,
    title: 'Create Agent',
    description: 'Configure a new AI agent with custom prompts',
    href: '/agents/new',
    iconClassName: 'bg-blue-500/10 text-blue-600',
  },
  {
    icon: MessageSquare,
    title: 'Create Bot',
    description: 'Deploy a chatbot to your channels',
    href: '/chatbots/new',
    iconClassName: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    icon: FileText,
    title: 'Upload Document',
    description: 'Add documents to your knowledge base',
    href: '/knowledge',
    iconClassName: 'bg-purple-500/10 text-purple-600',
  },
  {
    icon: MessageCircle,
    title: 'View Conversations',
    description: 'Browse and manage chat conversations',
    href: '/conversations',
    iconClassName: 'bg-amber-500/10 text-amber-600',
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {actions.map((action) => (
        <QuickActionCard key={action.href} {...action} />
      ))}
    </div>
  )
}

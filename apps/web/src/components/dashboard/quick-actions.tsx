import { useNavigate } from 'react-router-dom'
import { Bot, MessageSquare, FileText, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const actions = [
  { icon: Bot, label: 'Create Agent', href: '/agents/new', iconClassName: 'text-blue-500' },
  { icon: MessageSquare, label: 'Create Bot', href: '/chatbots/new', iconClassName: 'text-emerald-500' },
  { icon: FileText, label: 'Upload Doc', href: '/knowledge', iconClassName: 'text-purple-500' },
  { icon: MessageCircle, label: 'Conversations', href: '/conversations', iconClassName: 'text-amber-500' },
]

export function QuickActions() {
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-card p-1">
      {actions.map((action) => (
        <button
          key={action.href}
          type="button"
          onClick={() => navigate(action.href)}
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors',
            'hover:bg-muted hover:text-foreground'
          )}
        >
          <action.icon className={cn('size-4', action.iconClassName)} />
          {action.label}
        </button>
      ))}
    </div>
  )
}

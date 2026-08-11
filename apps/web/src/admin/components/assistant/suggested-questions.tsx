import {
  Activity,
  Bot,
  Building2,
  Gauge,
  LifeBuoy,
  MessageSquare,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface QuickAction {
  icon: LucideIcon
  label: string
  question: string
}

const quickActions: QuickAction[] = [
  { icon: Wallet, label: "Today's Revenue", question: 'How much revenue was generated today?' },
  { icon: Users, label: 'User Growth', question: 'How many users signed up this week compared to last week?' },
  { icon: Building2, label: 'Active Organizations', question: 'How many organizations are active and which are the most active?' },
  { icon: Bot, label: 'Agent Performance', question: 'Which agents have the highest conversation counts?' },
  { icon: MessageSquare, label: 'Message Volume', question: 'How many messages were sent today?' },
  { icon: LifeBuoy, label: 'Open Tickets', question: 'How many tickets are open right now?' },
  { icon: Activity, label: 'System Health', question: 'Give me a system health summary.' },
  { icon: Gauge, label: 'Usage Limits', question: 'Which organizations are approaching their usage limits?' },
]

const followUps: string[] = [
  'Compare this month revenue with last month.',
  'Which AI model is used most across agents?',
  'Show me recent errors or failed integrations.',
]

interface SuggestedQuestionsProps {
  onSend: (question: string) => void
}

export function SuggestedQuestions({ onSend }: SuggestedQuestionsProps) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {quickActions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => onSend(action.question)}
            className="group flex flex-col items-start gap-2 rounded-xl border border-border/60 bg-card p-3 text-left transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
          >
            <action.icon className="size-4 text-primary transition-transform duration-200 group-hover:scale-110" />
            <span className="text-xs font-medium leading-tight text-foreground">{action.label}</span>
          </button>
        ))}
      </div>

      <div>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Try asking
        </p>
        <div className="flex flex-wrap gap-2">
          {followUps.map((q) => (
            <Button key={q} type="button" variant="outline" size="sm" onClick={() => onSend(q)}>
              {q}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
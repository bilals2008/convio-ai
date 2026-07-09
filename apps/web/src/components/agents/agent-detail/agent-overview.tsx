import { cn } from '@/lib/utils'
import type { ComponentType } from 'react'
import {
  Cpu,
  BookOpen,
  MessageSquare,
  Wrench,
  Settings,
  Calendar,
  Key,
  FileText,
  Activity,
  Clock,
  TrendingUp,
  CheckCircle2,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  Plus,
  GitCommit,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface AgentOverviewProps {
  agentName?: string
  agentAvatar?: string | null
  agentDescription?: string
  agentModel?: string
  agentCreatedAt?: string
  agentUpdatedAt?: string
  hasProviderKey?: boolean
  hasKnowledgeBase?: boolean
  systemPrompt?: string
  onNavigateToTab: (tab: string) => void
}

const usageData = [
  { date: 'Jun 09', messages: 182 },
  { date: 'Jun 13', messages: 246 },
  { date: 'Jun 17', messages: 198 },
  { date: 'Jun 21', messages: 312 },
  { date: 'Jun 25', messages: 274 },
  { date: 'Jun 29', messages: 388 },
  { date: 'Jul 03', messages: 356 },
  { date: 'Jul 07', messages: 432 },
]

const topKnowledgeSources = [
  { name: 'Product Documentation', usage: 42, icon: FileText },
  { name: 'API Reference', usage: 28, icon: BookOpen },
  { name: 'Help Center FAQ', usage: 18, icon: Database },
  { name: 'Pricing & Plans', usage: 12, icon: Sparkles },
]

const recentActivity = [
  {
    icon: MessageSquare,
    title: 'Handled 128 conversations',
    meta: 'Peak volume spike detected',
    time: '2h ago',
    tone: 'primary',
  },
  {
    icon: GitCommit,
    title: 'System prompt updated',
    meta: 'Tone adjusted to friendly',
    time: '5h ago',
    tone: 'muted',
  },
  {
    icon: Plus,
    title: 'Knowledge source added',
    meta: 'API Reference synced',
    time: '1d ago',
    tone: 'muted',
  },
  {
    icon: CheckCircle2,
    title: 'Success rate improved to 94.2%',
    meta: 'Up 2.1% this week',
    time: '2d ago',
    tone: 'success',
  },
]

export function AgentOverview({
  agentName,
  agentAvatar,
  agentDescription,
  agentModel,
  agentCreatedAt,
  agentUpdatedAt,
  hasProviderKey,
  hasKnowledgeBase,
  systemPrompt,
  onNavigateToTab,
}: AgentOverviewProps) {
  return (
    <div className="flex h-[400px] items-center justify-center">
      <div className="text-center">
        <Sparkles className="mx-auto size-8 text-muted-foreground/50" />
        <p className="mt-3 text-sm font-medium text-muted-foreground">Coming Soon</p>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  trend: string
  trendUp: boolean
}) {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <span className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="size-3.5" />
          </span>
          <span
            className={cn(
              'flex items-center gap-0.5 text-[11px] font-medium',
              trendUp ? 'text-success' : 'text-destructive'
            )}
          >
            {trendUp ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {trend}
          </span>
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadgeCard({ status }: { status: 'Live' | 'Draft' }) {
  const live = status === 'Live'
  return (
    <Card>
      <CardContent className="flex h-full flex-col justify-between gap-2 p-4">
        <span className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <CheckCircle2 className="size-3.5" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'size-2 rounded-full',
                live ? 'bg-success' : 'bg-warning'
              )}
            />
            <p className="text-2xl font-semibold tracking-tight text-foreground">{status}</p>
          </div>
          <p className="text-xs text-muted-foreground">Status</p>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Icon className="size-4" />
      {label}
    </button>
  )
}

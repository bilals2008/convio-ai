import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquare, Clock, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { conversations as conversationsApi } from '@/lib/api'

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(date).toLocaleDateString()
}

function getStatusColor(status: string) {
  switch (status) {
    case 'active': return 'bg-emerald-500/10 text-emerald-500'
    case 'pending': return 'bg-amber-500/10 text-amber-500'
    case 'closed': return 'bg-muted text-muted-foreground'
    default: return 'bg-muted text-muted-foreground'
  }
}

function getChannelBadge(channel: string) {
  const colors: Record<string, string> = {
    web: 'bg-blue-500/10 text-blue-500',
    whatsapp: 'bg-emerald-500/10 text-emerald-500',
    discord: 'bg-violet-500/10 text-violet-500',
    slack: 'bg-amber-500/10 text-amber-500',
    telegram: 'bg-sky-500/10 text-sky-500',
  }
  return colors[channel] || 'bg-muted text-muted-foreground'
}

export function RecentConversations() {
  const { data, isLoading } = useQuery({
    queryKey: ['recent-conversations'],
    queryFn: async () => {
      const res = await conversationsApi.list({ limit: 5 })
      return res.data.data
    },
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="border-b py-4">
          <CardTitle className="text-base">Recent Conversations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <Skeleton className="size-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const conversations = (data || []).slice(0, 5).map((conv: Record<string, unknown>) => ({
    id: conv.id as string,
    agentName: (conv.agent as Record<string, unknown>)?.name as string || 'Unknown',
    channel: conv.channel as string,
    status: conv.status as string,
    lastMessage: ((conv.messages as Record<string, unknown>[])?.[0]?.content as string) || '',
    timestamp: timeAgo(conv.updatedAt as string),
  }))

  return (
    <Card>
      <CardHeader className="flex items-center justify-between border-b py-4">
        <CardTitle className="text-base">Recent Conversations</CardTitle>
        <Link to="/conversations" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          View all <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-info/10 mb-3">
              <MessageSquare className="size-5 text-info" />
            </div>
            <p className="text-sm font-medium text-foreground">No conversations yet</p>
            <p className="text-xs text-muted-foreground mt-1">Conversations will appear here once users start chatting with your agents.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((conv: { id: string; agentName: string; channel: string; status: string; lastMessage: string; timestamp: string }) => (
            <div key={conv.id} className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <MessageSquare className="size-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{conv.agentName}</p>
                  <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium', getChannelBadge(conv.channel))}>
                    {conv.channel}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium', getStatusColor(conv.status))}>
                  {conv.status}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="size-3" /> {conv.timestamp}
                </span>
              </div>
            </div>
          ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

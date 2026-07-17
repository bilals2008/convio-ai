import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Bot, Circle } from 'lucide-react'
import { agents as agentsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { cn } from '@/lib/utils'

interface AgentStatus {
  id: string
  name: string
  status: 'online' | 'offline' | 'busy'
  lastActive: string
}

export function AgentStatusGrid() {
  const { orgId } = useOrg()

  const { data: agentsData, isLoading } = useQuery({
    queryKey: ['agents', orgId],
    queryFn: async () => {
      const res = await agentsApi.list(orgId!)
      return res.data.data
    },
    enabled: !!orgId,
  })

  const agents: AgentStatus[] = (agentsData || []).slice(0, 6).map((agent: Record<string, unknown>, i: number) => ({
    id: agent.id as string,
    name: agent.name as string,
    status: (['online', 'offline', 'busy'] as const)[i % 3],
    lastActive: i % 2 === 0 ? 'Just now' : `${i + 1}h ago`,
  }))

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="border-b py-4">
          <CardTitle className="text-base">Agent Status</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[80px] rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  function getStatusColor(status: AgentStatus['status']) {
    switch (status) {
      case 'online': return 'text-emerald-500'
      case 'busy': return 'text-amber-500'
      case 'offline': return 'text-muted-foreground'
    }
  }

  function getStatusBg(status: AgentStatus['status']) {
    switch (status) {
      case 'online': return 'bg-emerald-500/10'
      case 'busy': return 'bg-amber-500/10'
      case 'offline': return 'bg-muted'
    }
  }

  return (
    <Card>
      <CardHeader className="border-b py-4">
        <CardTitle className="text-base">Agent Status</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 transition-all hover:border-border hover:shadow-sm"
            >
              <div className={cn('flex size-10 items-center justify-center rounded-lg shrink-0', getStatusBg(agent.status))}>
                <Bot className={cn('size-5', getStatusColor(agent.status))} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{agent.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Circle className={cn('size-2 fill-current', getStatusColor(agent.status))} />
                  <span className={cn('text-[11px] capitalize', getStatusColor(agent.status))}>{agent.status}</span>
                  <span className="text-[10px] text-muted-foreground">· {agent.lastActive}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

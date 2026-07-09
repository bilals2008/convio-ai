import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Shield, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useOrg } from '@/lib/org-context'
import { organizations as orgsApi } from '@/lib/api'
import { cn } from '@/lib/utils'

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId?: string
  actorId?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

const actionLabels: Record<string, string> = {
  'member.invited': 'Member Invited',
  'member.removed': 'Member Removed',
  'member.role_changed': 'Role Changed',
  'organization.created': 'Organization Created',
  'organization.updated': 'Organization Updated',
  'organization.deleted': 'Organization Deleted',
  'agent.created': 'Agent Created',
  'agent.updated': 'Agent Updated',
  'agent.deleted': 'Agent Deleted',
  'knowledge.created': 'Knowledge Base Created',
  'knowledge.updated': 'Knowledge Base Updated',
  'knowledge.deleted': 'Knowledge Base Deleted',
  'api_key.created': 'API Key Created',
  'api_key.deleted': 'API Key Deleted',
  'provider_key.created': 'Provider Key Added',
  'provider_key.updated': 'Provider Key Updated',
  'provider_key.deleted': 'Provider Key Deleted',
  'sso.configured': 'SSO Configured',
  'sso.disabled': 'SSO Disabled',
}

const actionColors: Record<string, string> = {
  'member.invited': 'bg-emerald-500/10 text-emerald-600',
  'member.removed': 'bg-red-500/10 text-red-600',
  'member.role_changed': 'bg-amber-500/10 text-amber-600',
  'organization.created': 'bg-blue-500/10 text-blue-600',
  'organization.updated': 'bg-blue-500/10 text-blue-600',
  'organization.deleted': 'bg-red-500/10 text-red-600',
  'agent.created': 'bg-violet-500/10 text-violet-600',
  'agent.updated': 'bg-violet-500/10 text-violet-600',
  'agent.deleted': 'bg-red-500/10 text-red-600',
}

export default function AuditLogsPage() {
  const { orgId } = useOrg()
  const [actionFilter, setActionFilter] = useState('')
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [cursor, setCursor] = useState<string | null>(null)

  const { isLoading, isFetching } = useQuery({
    queryKey: ['audit-logs', orgId, actionFilter],
    queryFn: async () => {
      const params: Record<string, string | number> = { limit: 50 }
      if (actionFilter) params.action = actionFilter
      const res = await orgsApi.api.get(`/organizations/${orgId}/audit-logs`, { params })
      const data = res.data
      setLogs(data.data || [])
      setCursor(data.nextCursor || null)
      return data
    },
    enabled: !!orgId,
  })

  const loadMore = async () => {
    if (!cursor) return
    const params: Record<string, string | number> = { limit: 50, cursor }
    if (actionFilter) params.action = actionFilter
    const res = await orgsApi.api.get(`/organizations/${orgId}/audit-logs`, { params })
    const data = res.data
    setLogs((prev) => [...prev, ...(data.data || [])])
    setCursor(data.nextCursor || null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Track changes made across your organization"
      />

      <div className="flex items-center gap-2">
        <Select value={actionFilter} onValueChange={(v) => setActionFilter(v ?? '')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All actions</SelectItem>
            {Object.entries(actionLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {actionFilter && (
          <Button variant="ghost" size="sm" onClick={() => setActionFilter('')}>
            Clear
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="size-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No audit logs yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Actions will appear here as your team works.</p>
            </div>
          ) : (
            <div className="divide-y">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 px-4 py-3 text-sm">
                  <div className={cn(
                    'mt-0.5 size-2 shrink-0 rounded-full',
                    log.action.includes('deleted') || log.action.includes('removed')
                      ? 'bg-red-400' : 'bg-primary/40'
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className={cn(
                        'text-[10px] px-1.5 py-0 font-medium',
                        actionColors[log.action] || 'bg-muted text-muted-foreground'
                      )}>
                        {actionLabels[log.action] || log.action}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {JSON.stringify(log.metadata).slice(0, 120)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {cursor && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={loadMore} disabled={isFetching}>
            {isFetching && <Loader2 className="size-3 animate-spin mr-2" />}
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}



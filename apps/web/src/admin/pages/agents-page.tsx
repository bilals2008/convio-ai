import { useState, useCallback } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { SearchInput } from '@/components/admin/search-input'
import { StatusBadge } from '@/components/admin/status-badge'
import { EmptyState } from '@/components/admin/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon, Bot, MessageSquare } from 'lucide-react'
import { useAdminAgents } from '@/admin/hooks/use-admin'
import type { AdminAgent } from '@/admin/services/admin-api'

function AgentRow({ agent }: { agent: AdminAgent }) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <Bot className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{agent.name}</p>
            <p className="text-xs text-muted-foreground">{agent.organization.name}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{agent.model}</code>
      </TableCell>
      <TableCell><StatusBadge status={agent.status} /></TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MessageSquare className="size-3.5" />
          {agent.conversationCount}
        </div>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {new Date(agent.createdAt).toLocaleDateString()}
      </TableCell>
    </TableRow>
  )
}

export default function AdminAgentsPage() {
  const [search, setSearch] = useState('')
  const [cursor, setCursor] = useState<string | undefined>()
  const [cursors, setCursors] = useState<string[]>([])

  const { data, isLoading } = useAdminAgents({ cursor, search: search || undefined })

  const handleNext = useCallback(() => {
    if (data?.nextCursor) {
      setCursors((prev) => [...prev, cursor!])
      setCursor(data.nextCursor)
    }
  }, [data, cursor])

  const handlePrev = useCallback(() => {
    const prev = cursors[cursors.length - 1]
    setCursors((prevC) => prevC.slice(0, -1))
    setCursor(prev)
  }, [cursors])

  return (
    <div>
      <PageHeader
        title="Agents"
        description="All agents across organizations."
        actions={<SearchInput value={search} onChange={(v) => { setSearch(v); setCursor(undefined); setCursors([]) }} placeholder="Search agents..." />}
      />
      <div className="rounded-xl border border-border/60 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Conversations</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8">
                  <EmptyState icon={Bot} title="No agents found" description="No agents match your search." />
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((agent) => <AgentRow key={agent.id} agent={agent} />)
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {data?.data.length ?? 0} agent{data?.data.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={cursors.length === 0} onClick={handlePrev}>
              <ChevronLeftIcon className="size-4" /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled={!data?.nextCursor} onClick={handleNext}>
              Next <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, LifeBuoy, Building2, RefreshCw, Clock, CalendarCheck, MessageSquare, PanelRightOpen } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useSession } from '@/lib/hooks/useAuth'
import { useAdminTicket, useAdminUpdateTicketStatus } from '@/admin/hooks/use-admin'
import { adminApi } from '@/admin/services/admin-api'
import { toast } from '@/lib/toast'
import { formatRelativeTime, cn } from '@/lib/utils'
import { TicketConversation, type ConversationMessage } from '@/pages/support/components/ticket-conversation'
import { MessageComposer } from '@/pages/support/components/message-composer'
import { TicketStatusBadge } from '@/pages/support/ticket-status'

const PRIORITY_META: Record<string, { label: string; className: string }> = {
  low: { label: 'Low', className: 'text-muted-foreground' },
  normal: { label: 'Normal', className: 'text-muted-foreground' },
  high: { label: 'High', className: 'text-foreground font-medium' },
  urgent: { label: 'Urgent', className: 'text-destructive font-medium' },
}

const CATEGORY_LABEL: Record<string, string> = {
  general: 'General', bug: 'Bug report', billing: 'Billing',
  feature: 'Feature request', account: 'Account', other: 'Other',
}

const STATUS_ACTIONS: Record<string, { label: string; next: string }[]> = {
  open: [{ label: 'Start', next: 'in_progress' }, { label: 'Resolve', next: 'resolved' }, { label: 'Close', next: 'closed' }],
  in_progress: [{ label: 'Resolve', next: 'resolved' }, { label: 'Close', next: 'closed' }, { label: 'Reopen', next: 'open' }],
  resolved: [{ label: 'Close', next: 'closed' }, { label: 'Reopen', next: 'open' }],
  closed: [{ label: 'Reopen', next: 'open' }],
}

interface PendingMessage extends ConversationMessage { status: 'sending' | 'sent' | 'failed' }

function SidebarContent({ ticket, actions, updateStatusMutation }: {
  ticket: NonNullable<ReturnType<typeof useAdminTicket>['data']>
  actions: { label: string; next: string }[]
  updateStatusMutation: ReturnType<typeof useAdminUpdateTicketStatus>
}) {
  return (
    <div className="flex flex-col gap-5 text-sm">
      <section>
        <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</p>
        <div className="flex flex-wrap gap-1.5">
          {actions.map((a) => (
            <Button key={a.next} variant="outline" size="sm" className="h-7 text-xs"
              disabled={updateStatusMutation.isPending || a.next === ticket.status}
              onClick={() => updateStatusMutation.mutate({ id: ticket.id, status: a.next })}>
              {a.label}
            </Button>
          ))}
        </div>
      </section>
      <Separator />
      <section>
        <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Reporter</p>
        <div className="flex items-center gap-2.5">
          <Avatar className="size-8">
            <AvatarImage src={ticket.reporter.avatar ?? undefined} alt="" />
            <AvatarFallback className="bg-primary/10 text-[10px] font-medium text-primary">
              {(ticket.reporter.name || ticket.reporter.email).slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{ticket.reporter.name || 'User'}</p>
            <p className="truncate text-xs text-muted-foreground">{ticket.reporter.email}</p>
          </div>
        </div>
      </section>
      <Separator />
      <section>
        <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Organization</p>
        <div className="flex items-center gap-2">
          <Building2 className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate font-medium">{ticket.organization.name}</span>
        </div>
        {ticket.organization.plan && (
          <div className="mt-1.5 pl-6"><Badge variant="secondary" className="text-[10px] uppercase">{ticket.organization.plan}</Badge></div>
        )}
      </section>
      <Separator />
      <section>
        <dl className="space-y-2">
          <div className="flex items-center justify-between"><dt className="text-muted-foreground">Opened</dt><dd>{formatRelativeTime(ticket.createdAt)}</dd></div>
          <div className="flex items-center justify-between"><dt className="text-muted-foreground">Last activity</dt><dd>{formatRelativeTime(ticket.updatedAt)}</dd></div>
          {ticket.resolvedAt && <div className="flex items-center justify-between"><dt className="text-muted-foreground">Resolved</dt><dd>{formatRelativeTime(ticket.resolvedAt)}</dd></div>}
        </dl>
      </section>
    </div>
  )
}

export default function AdminTicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const { data: session } = useSession()
  const me = session?.user
  const { data: ticket, isLoading, isError, refetch } = useAdminTicket(ticketId)
  const updateStatusMutation = useAdminUpdateTicketStatus()
  const queryClient = useQueryClient()
  const [pending, setPending] = useState<PendingMessage[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pendingRef = useRef(pending)
  pendingRef.current = pending

  const sendMessage = useCallback((content: string) => {
    if (!ticket || !me) return
    const tempId = crypto.randomUUID()
    setPending((prev) => [...prev, { id: tempId, content, createdAt: new Date().toISOString(), author: { id: me.id, name: me.name, email: me.email, avatar: me.avatar }, status: 'sending' }])
    adminApi.replyToTicket(ticket.id, content)
      .then(() => { setPending((prev) => prev.map((m) => m.id === tempId ? { ...m, status: 'sent' } : m)); toast.success('Reply sent'); queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] }); refetch() })
      .catch(() => { setPending((prev) => prev.map((m) => m.id === tempId ? { ...m, status: 'failed' } : m)); toast.error('Failed to send reply') })
  }, [ticket, me, queryClient, refetch])

  useEffect(() => {
    if (!ticket || pendingRef.current.length === 0) return
    setPending((prev) => prev.filter((p) => !ticket.messages.some((m) => m.content === p.content && new Date(m.createdAt).getTime() >= new Date(p.createdAt).getTime() - 2000)))
  }, [ticket])

  const messages: ConversationMessage[] = useMemo(() => {
    if (!ticket) return []
    const opening = { id: `opening-${ticket.id}`, content: ticket.description, createdAt: ticket.createdAt, author: ticket.reporter }
    return [opening, ...ticket.messages.map((m) => ({ ...m })), ...pending].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }, [ticket, pending])

  const isClosed = ticket ? ticket.status === 'resolved' || ticket.status === 'closed' : false
  const priority = ticket ? (PRIORITY_META[ticket.priority] ?? PRIORITY_META.normal) : PRIORITY_META.normal
  const actions = ticket ? (STATUS_ACTIONS[ticket.status] ?? []) : []

  if (isLoading) return (
    <PageContainer><div className="space-y-4"><Skeleton className="h-7 w-72" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_290px]"><Skeleton className="h-[60vh] rounded-2xl" /><div className="space-y-3"><Skeleton className="h-8 w-40" /><Skeleton className="h-20 w-full" /><Skeleton className="h-24 w-full" /></div></div>
    </div></PageContainer>
  )

  if (isError || !ticket) return (
    <PageContainer><EmptyState icon={LifeBuoy} title="Couldn't load ticket" description="This ticket may not exist." action={{ label: 'Try again', onClick: () => refetch() }} /></PageContainer>
  )

  return (
    <PageContainer>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <Button variant="ghost" size="sm" className="-ml-2 self-start gap-1.5 text-muted-foreground" render={<Link to="/admin/tickets" />}>
          <ArrowLeft className="size-4" />Back to tickets
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <TicketStatusBadge status={ticket.status} />
              <Badge variant="outline" className={cn('font-normal', priority.className)}>{priority.label}</Badge>
              {ticket.category !== 'general' && <Badge variant="outline" className="font-normal text-muted-foreground">{CATEGORY_LABEL[ticket.category] ?? ticket.category}</Badge>}
            </div>
            <h1 className="text-lg font-semibold leading-tight sm:text-xl">{ticket.title}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CalendarCheck className="size-3" />Opened {formatRelativeTime(ticket.createdAt)}</span>
              <span aria-hidden>·</span>
              <span className="flex items-center gap-1"><Clock className="size-3" />Updated {formatRelativeTime(ticket.updatedAt)}</span>
              <span aria-hidden>·</span>
              <span className="flex items-center gap-1"><MessageSquare className="size-3" />{ticket.messages.length + 1} messages</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={cn('size-3.5', isLoading && 'animate-spin')} />Refresh
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <PanelRightOpen className="size-3.5" />Details
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="flex h-[calc(100dvh-18rem)] min-h-[480px] flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
            <TicketConversation messages={messages} currentUserId={me?.id} othersReadAt={null} typingUsers={[]}
              onRetry={(id) => { const msg = pending.find((m) => m.id === id); if (msg) sendMessage(msg.content) }} />
            <MessageComposer disabled={isClosed}
              disabledPlaceholder={isClosed ? `Ticket is ${ticket.status}. Change status to continue.` : undefined}
              onSend={sendMessage} onTyping={() => {}} />
          </div>
          <aside className="hidden lg:block" aria-label="Ticket details">
            <SidebarContent ticket={ticket} actions={actions} updateStatusMutation={updateStatusMutation} />
          </aside>
        </div>
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="w-[85vw] max-w-sm overflow-y-auto p-5">
          <SidebarContent ticket={ticket} actions={actions} updateStatusMutation={updateStatusMutation} />
        </SheetContent>
      </Sheet>
    </PageContainer>
  )
}

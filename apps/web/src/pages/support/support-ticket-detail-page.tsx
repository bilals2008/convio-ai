import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Inbox, RefreshCw, Clock, CalendarCheck, MessageSquare, PanelRightOpen } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useOrg } from '@/lib/org-context'
import { useSession } from '@/lib/hooks/useAuth'
import { useTicket, useReplyTicket, useUpdateTicketStatus } from '@/lib/hooks/use-tickets'
import { cn, formatRelativeTime } from '@/lib/utils'
import { TicketConversation, type ConversationMessage } from './components/ticket-conversation'
import { MessageComposer } from './components/message-composer'
import { TicketSidebar } from './components/ticket-sidebar'
import { TicketStatusBadge } from './ticket-status'

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

interface PendingMessage extends ConversationMessage { status: 'sending' | 'sent' | 'failed' }

export default function SupportTicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const { orgId } = useOrg()
  const navigate = useNavigate()
  const { data: session } = useSession()
  const me = session?.user

  const { data: ticket, isLoading, isError, refetch } = useTicket(orgId ?? undefined, ticketId)
  const replyMutation = useReplyTicket(orgId ?? undefined, ticketId)
  const updateStatusMutation = useUpdateTicketStatus(orgId ?? undefined)

  const [pending, setPending] = useState<PendingMessage[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pendingRef = useRef(pending)
  pendingRef.current = pending

  const sendMessage = useCallback((content: string) => {
    if (!me) return
    const tempId = crypto.randomUUID()
    setPending((prev) => [...prev, { id: tempId, content, createdAt: new Date().toISOString(), author: { id: me.id, name: me.name, email: me.email, avatar: me.avatar }, status: 'sending' }])
    replyMutation.mutate({ content, attachments: [] }, {
      onSuccess: () => setPending((prev) => prev.map((m) => m.id === tempId ? { ...m, status: 'sent' } : m)),
      onError: () => setPending((prev) => prev.map((m) => m.id === tempId ? { ...m, status: 'failed' } : m)),
    })
  }, [me, replyMutation])

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

  const sidebarContent = ticket && (
    <TicketSidebar ticket={ticket} isUpdatingStatus={updateStatusMutation.isPending}
      onResolve={() => updateStatusMutation.mutate({ ticketId: ticket.id, status: 'resolved' })}
      onClose={() => updateStatusMutation.mutate({ ticketId: ticket.id, status: 'closed' })} />
  )

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <Button variant="ghost" size="sm" className="-ml-2 self-start gap-1.5 text-muted-foreground" onClick={() => navigate('/support')}>
        <ArrowLeft className="size-4" />Back to tickets
      </Button>

      {isLoading ? (
        <div className="space-y-4"><Skeleton className="h-7 w-72" />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]"><Skeleton className="h-[60vh] rounded-2xl" /><div className="space-y-3"><Skeleton className="h-8 w-40" /><Skeleton className="h-16 w-full" /><Skeleton className="h-24 w-full" /></div></div>
        </div>
      ) : isError || !ticket ? (
        <EmptyState icon={Inbox} title="Couldn't load ticket" description="This ticket may not exist or you don't have access." action={{ label: 'Try again', onClick: () => refetch() }} />
      ) : (
        <>
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
                disabledPlaceholder={isClosed ? `This ticket is ${ticket.status}. Reopen it to continue.` : undefined}
                onSend={sendMessage} onTyping={() => {}} />
            </div>
            <div className="hidden lg:block">{sidebarContent}</div>
          </div>
        </>
      )}

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="w-[85vw] max-w-sm overflow-y-auto p-5">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    </div>
  )
}

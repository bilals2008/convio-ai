import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, LifeBuoy, Lock, ArrowUp } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { TicketThread } from '@/components/shared/ticket-thread'
import { useSession } from '@/lib/hooks/useAuth'
import {
  useAdminTicketDetail,
  useAdminTicketRealtime,
  useAdminReplyTicket,
  useAdminUpdateTicket,
} from '@/admin/hooks/use-admin'

const STATUSES = ['open', 'in_progress', 'resolved', 'closed']
const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
}
const PRIORITIES = ['low', 'normal', 'high', 'urgent']

export default function AdminTicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const id = ticketId ?? ''
  const { data: session } = useSession()
  const currentUserId = session?.user.id ?? ''

  const query = useAdminTicketDetail(ticketId)
  useAdminTicketRealtime(ticketId)
  const replyMutation = useAdminReplyTicket(id)
  const updateMutation = useAdminUpdateTicket(id)

  const [noteMode, setNoteMode] = useState(false)
  const [draft, setDraft] = useState('')

  const ticket = query.data

  const messages = useMemo(() => {
    if (!ticket) return []
    return [
      {
        id: 'description',
        authorId: ticket.reporter.id,
        content: ticket.description,
        isInternalNote: false,
        createdAt: ticket.createdAt,
        author: ticket.reporter,
      },
      ...ticket.messages,
    ]
  }, [ticket])

  if (query.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="size-5 animate-spin rounded-full border-2 border-border border-t-primary" />
          <p className="text-xs text-muted-foreground">Loading ticket...</p>
        </div>
      </div>
    )
  }

  if (query.isError || !ticket) {
    return (
      <EmptyState
        icon={LifeBuoy}
        title="Couldn't load ticket"
        description="This ticket may have been removed."
        action={
          <Link to="/admin/tickets" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Back to tickets
          </Link>
        }
      />
    )
  }

  function handleSend() {
    const content = draft.trim()
    if (!content || replyMutation.isPending) return
    replyMutation.mutate(
      { content, isInternalNote: noteMode },
      { onSuccess: () => setDraft('') },
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Button variant="ghost" size="icon-sm" render={<Link to="/admin/tickets" aria-label="Back to tickets" />}>
            <ArrowLeft className="size-4" />
          </Button>

          <h1 className="min-w-0 truncate text-sm font-semibold">{ticket.title}</h1>

          <Badge variant="secondary" className="shrink-0">{ticket.category}</Badge>

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <Select value={ticket.status} onValueChange={(s) => updateMutation.mutate({ status: s })}>
              <SelectTrigger size="sm" className="h-7 w-[130px] text-xs" aria-label="Status">
                <SelectValue>{STATUS_LABELS[ticket.status]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ticket.priority} onValueChange={(p) => updateMutation.mutate({ priority: p })}>
              <SelectTrigger size="sm" className="h-7 w-[100px] text-xs" aria-label="Priority">
                <SelectValue>{ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <MessageScrollerProvider>
          <MessageScroller className="min-h-0 flex-1">
            <MessageScrollerViewport>
              <MessageScrollerContent className="gap-0 py-0">
                <MessageScrollerItem messageId="thread" scrollAnchor>
                  <TicketThread messages={messages} currentUserId={currentUserId} />
                </MessageScrollerItem>
              </MessageScrollerContent>
              <MessageScrollerButton />
            </MessageScrollerViewport>
          </MessageScroller>
        </MessageScrollerProvider>

      <div className="border-t border-border">
        <div className="mx-auto w-full max-w-3xl px-4 pb-3 pt-1 sm:px-6">
          <form onSubmit={(e) => { e.preventDefault(); handleSend() }}>
            <InputGroup>
              <InputGroupTextarea
                placeholder={noteMode ? 'Add an internal note...' : 'Reply to customer...'}
                className="min-h-[44px] px-3.5 py-3"
                rows={1}
                value={draft}
                aria-label={noteMode ? 'Internal note input' : 'Reply input'}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
              />
              <InputGroupAddon align="block-end">
                <Button
                  type="button"
                  variant={noteMode ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setNoteMode((v) => !v)}
                >
                  <Lock className="size-3" />
                  Note
                </Button>
                <InputGroupButton
                  type="submit"
                  size="icon-sm"
                  variant={noteMode ? 'outline' : 'default'}
                  aria-label="Send message"
                  className="ml-auto"
                  disabled={!draft.trim() || replyMutation.isPending}
                >
                  <ArrowUp />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>
        </div>
      </div>
    </div>
  )
}

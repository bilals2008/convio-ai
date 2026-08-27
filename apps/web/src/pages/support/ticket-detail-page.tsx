import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, LifeBuoy } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { EmptyState } from '@/components/shared/empty-state'
import { Button, buttonVariants } from '@/components/ui/button'
import { TicketStatusBadge } from './ticket-status'
import { PriorityBadge } from '@/components/shared/priority-badge'
import { TicketThread } from '@/components/shared/ticket-thread'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller'

import { MessageInput } from '@/components/conversations/message-input'
import { useOrg } from '@/lib/org-context'
import { useSession } from '@/lib/hooks/useAuth'
import {
  useTicket,
  useTicketRealtime,
  useSendTicketMessage,
  useUpdateTicket,
  type TicketMessage,
} from '@/lib/hooks/use-tickets'

export default function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const { orgId } = useOrg()
  const { data: session } = useSession()
  const currentUserId = session?.user.id ?? ''

  const ticketQuery = useTicket(orgId ?? undefined, ticketId)
  useTicketRealtime(ticketId)

  const sendMutation = useSendTicketMessage(orgId ?? undefined, ticketId ?? '', session?.user)
  const updateMutation = useUpdateTicket(orgId ?? undefined, ticketId ?? '')

  const ticket = ticketQuery.data

  // description is the reporter's opening message of the thread
  const messages = useMemo<TicketMessage[]>(() => {
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

  if (ticketQuery.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="size-5 animate-spin rounded-full border-2 border-border border-t-primary" />
          <p className="text-xs text-muted-foreground">Loading ticket…</p>
        </div>
      </div>
    )
  }

  if (ticketQuery.isError || !ticket) {
    return (
      <EmptyState
        icon={LifeBuoy}
        title="Couldn't load ticket"
        description="This ticket may have been removed or you don't have access."
        action={
          <Link to="/support" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Back to tickets
          </Link>
        }
      />
    )
  }

  const closed = ticket.status === 'closed'

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Button variant="ghost" size="icon-sm" render={<Link to="/support" aria-label="Back to tickets" />}>
          <ArrowLeft className="size-4" />
        </Button>

        <h1 className="min-w-0 truncate text-sm font-semibold">{ticket.title}</h1>

        <div className="flex items-center gap-1.5">
          <TicketStatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>

        <div className="ml-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateMutation.mutate({ status: closed ? 'open' : 'closed' })}
            disabled={updateMutation.isPending}
          >
            {closed ? 'Reopen' : 'Close'}
          </Button>
        </div>
      </div>
      <Separator />

      {/* ── Thread ── */}
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

      {/* ── Composer ── */}
      <Separator />
      <div>
        <MessageInput
          onSend={(content) => sendMutation.mutate(content)}
          loading={sendMutation.isPending}
          disabled={closed}
          placeholder={closed ? 'Reopen this ticket to reply' : 'Reply to support…'}
        />
      </div>
    </div>
  )
}

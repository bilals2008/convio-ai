import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Inbox } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useOrg } from '@/lib/org-context'
import { useTicket, useReplyTicket, useUpdateTicketStatus } from '@/lib/hooks/use-tickets'
import { formatRelativeTime } from '@/lib/utils'
import { TicketStatusBadge } from './ticket-status'

const CATEGORY_LABEL: Record<string, string> = {
  general: 'General',
  bug: 'Bug report',
  billing: 'Billing',
  feature: 'Feature request',
  account: 'Account',
  other: 'Other',
}

export default function SupportTicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const { orgId } = useOrg()
  const navigate = useNavigate()

  const { data: ticket, isLoading, isError, refetch } = useTicket(orgId ?? undefined, ticketId)
  const replyMutation = useReplyTicket(orgId ?? undefined, ticketId)
  const updateStatusMutation = useUpdateTicketStatus(orgId ?? undefined)
  const [reply, setReply] = useState('')

  function handleReply() {
    if (!reply.trim()) return
    replyMutation.mutate(reply.trim(), { onSuccess: () => setReply('') })
  }

  const pendingStatus = updateStatusMutation.isPending

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2 gap-1.5 text-muted-foreground" onClick={() => navigate('/support')}>
        <ArrowLeft className="size-4" />
        Back to tickets
      </Button>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-6 w-64 animate-pulse rounded bg-muted" />
          <div className="h-40 animate-pulse rounded-xl border bg-muted/40" />
        </div>
      ) : isError || !ticket ? (
        <EmptyState
          icon={Inbox}
          title="Couldn't load ticket"
          description="This ticket may not exist or you don't have access to it."
          action={{ label: 'Try again', onClick: () => refetch() }}
        />
      ) : (
        <>
          <PageHeader
            title={ticket.title}
            description={
              <span className="flex flex-wrap items-center gap-2">
                <TicketStatusBadge status={ticket.status} />
                {ticket.category !== 'general' && (
                  <Badge variant="outline" className="text-[10px] font-normal">
                    {CATEGORY_LABEL[ticket.category] ?? ticket.category}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  opened {formatRelativeTime(ticket.createdAt)}
                </span>
              </span>
            }
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pendingStatus}
              onClick={() => updateStatusMutation.mutate({ ticketId: ticket.id, status: 'resolved' })}
            >
              Resolve ticket
            </Button>
            {(ticket.status === 'open' || ticket.status === 'in_progress') && (
              <Button
                variant="outline"
                size="sm"
                disabled={pendingStatus}
                onClick={() => updateStatusMutation.mutate({ ticketId: ticket.id, status: 'closed' })}
              >
                Close ticket
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <Avatar className="size-8">
                    <AvatarImage src={ticket.reporter.avatar ?? undefined} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                      {(ticket.reporter.name || ticket.reporter.email).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {ticket.reporter.name || 'User'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(ticket.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground/90">{ticket.description}</p>
                  </div>
                </div>

                {ticket.messages.map((msg, idx) => (
                  <div key={msg.id}>
                    {idx === 0 && <Separator />}
                    <div className="flex items-start gap-3 py-4">
                      <Avatar className="size-8">
                        <AvatarImage src={msg.author.avatar ?? undefined} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                          {(msg.author.name || msg.author.email).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {msg.author.name || msg.author.email}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(msg.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground/90">{msg.content}</p>
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
            <div className="space-y-2">
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write a reply... (we'll notify the team)"
                rows={3}
              />
              <div className="flex justify-end">
                <Button onClick={handleReply} disabled={!reply.trim() || replyMutation.isPending}>
                  <Send className="size-3.5 shrink-0" />
                  {replyMutation.isPending ? 'Sending...' : 'Send reply'}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
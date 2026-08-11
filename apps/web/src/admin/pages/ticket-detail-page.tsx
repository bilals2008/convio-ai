import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Send, LifeBuoy } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminApi } from '@/admin/services/admin-api'
import { useAdminTicket, useAdminUpdateTicketStatus } from '@/admin/hooks/use-admin'
import { toast } from '@/lib/toast'
import { formatRelativeTime } from '@/lib/utils'

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed']

const CATEGORY_LABEL: Record<string, string> = {
  general: 'General',
  bug: 'Bug report',
  billing: 'Billing',
  feature: 'Feature request',
  account: 'Account',
  other: 'Other',
}

const STATUS_META: Record<string, { label: string; variant: string }> = {
  open: { label: 'Open', variant: 'pending' },
  in_progress: { label: 'In progress', variant: 'active' },
  resolved: { label: 'Resolved', variant: 'resolved' },
  closed: { label: 'Closed', variant: 'closed' },
}

export default function AdminTicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const { data: ticket, isLoading, isError, refetch } = useAdminTicket(ticketId)
  const updateStatusMutation = useAdminUpdateTicketStatus()
  const queryClient = useQueryClient()
  const replyMutation = useMutation({
    mutationFn: (content: string) => adminApi.replyToTicket(ticketId!, content),
    onSuccess: () => {
      setReply('')
      toast.success('Reply sent')
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] })
      refetch()
    },
    onError: (err: { friendlyMessage?: string }) => toast.error(err.friendlyMessage || 'Failed to send reply'),
  })
  const [reply, setReply] = useState('')

  function handleReply() {
    if (!reply.trim()) return
    replyMutation.mutate(reply.trim())
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <div className="h-6 w-64 animate-pulse rounded bg-muted" />
          <div className="h-40 animate-pulse rounded-xl border bg-muted/40" />
        </div>
      </PageContainer>
    )
  }

  if (isError || !ticket) {
    return (
      <PageContainer>
        <EmptyState
          icon={LifeBuoy}
          title="Couldn't load ticket"
          description="This ticket may not exist."
          action={{ label: 'Try again', onClick: () => refetch() }}
        />
      </PageContainer>
    )
  }

  const statusMeta = STATUS_META[ticket.status] ?? { label: ticket.status, variant: 'outline' }

  return (
    <PageContainer>
      <Button variant="ghost" size="sm" className="-ml-2 gap-1.5 text-muted-foreground" render={<Link to="/admin/tickets" />}>
        <ArrowLeft className="size-4" />
        Back to tickets
      </Button>

      <PageHeader
        title={ticket.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge variant={statusMeta.variant as 'outline'}>{statusMeta.label}</Badge>
            {ticket.category !== 'general' && (
              <Badge variant="outline" className="text-[10px] font-normal">
                {CATEGORY_LABEL[ticket.category] ?? ticket.category}
              </Badge>
            )}
            {ticket.priority === 'urgent' && <Badge variant="destructive">Urgent</Badge>}
            <span className="text-xs text-muted-foreground">
              {ticket.organization.name} · {ticket.reporter.name || ticket.reporter.email} · opened{' '}
              {formatRelativeTime(ticket.createdAt)}
            </span>
          </span>
        }
        action={
          <div className="flex items-center gap-2">
            <Select
              value={ticket.status}
              onValueChange={(status) =>
                updateStatusMutation.mutate({ id: ticket.id, status })
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_META[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

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
                  <span className="text-sm font-medium">{ticket.reporter.name || ticket.reporter.email}</span>
                  <span className="text-xs text-muted-foreground">{formatRelativeTime(ticket.createdAt)}</span>
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
                      <span className="text-sm font-medium">{msg.author.name || msg.author.email}</span>
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(msg.createdAt)}</span>
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
            placeholder="Reply to this ticket... (the reporter will be notified)"
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
    </PageContainer>
  )
}
import { UserRound } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { TicketDetail } from '@/lib/hooks/use-tickets'
import { formatRelativeTime } from '@/lib/utils'

interface TicketSidebarProps {
  ticket: TicketDetail
  isUpdatingStatus: boolean
  onResolve: () => void
  onClose: () => void
}

export function TicketSidebar({ ticket, isUpdatingStatus, onResolve, onClose }: TicketSidebarProps) {
  const canAct = ticket.status !== 'resolved' && ticket.status !== 'closed'

  return (
    <aside className="flex flex-col gap-5 text-sm" aria-label="Ticket details">
      {canAct && (
        <section>
          <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Actions</p>
          <div className="flex flex-wrap gap-1.5">
            <Button variant="outline" size="sm" className="h-7 text-xs" disabled={isUpdatingStatus} onClick={onResolve}>Mark resolved</Button>
            {(ticket.status === 'open' || ticket.status === 'in_progress') && (
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled={isUpdatingStatus} onClick={onClose}>Close ticket</Button>
            )}
          </div>
        </section>
      )}

      {canAct && <Separator />}

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
        <dl className="space-y-2">
          <div className="flex items-center justify-between"><dt className="text-muted-foreground">Opened</dt><dd>{formatRelativeTime(ticket.createdAt)}</dd></div>
          <div className="flex items-center justify-between"><dt className="text-muted-foreground">Last activity</dt><dd>{formatRelativeTime(ticket.updatedAt)}</dd></div>
          {ticket.resolvedAt && <div className="flex items-center justify-between"><dt className="text-muted-foreground">Resolved</dt><dd>{formatRelativeTime(ticket.resolvedAt)}</dd></div>}
        </dl>
      </section>
    </aside>
  )
}

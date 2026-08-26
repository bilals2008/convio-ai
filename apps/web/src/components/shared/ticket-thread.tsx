import { useMemo } from 'react'
import { Lock } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { TicketMessage } from '@/lib/hooks/use-tickets'

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a)
  const db = new Date(b)
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate()
}

function shouldGroup(prev: TicketMessage, next: TicketMessage): boolean {
  if (prev.authorId !== next.authorId) return false
  if (prev.isInternalNote || next.isInternalNote) return false
  const diff = new Date(next.createdAt).getTime() - new Date(prev.createdAt).getTime()
  return diff < 5 * 60_000
}

function initials(name: string | null, email: string): string {
  return (name || email).slice(0, 2).toUpperCase()
}

function DateSeparator({ date }: { date: string }) {
  return (
    <div className="py-2 text-center">
      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
        {formatDate(date)}
      </span>
    </div>
  )
}

function InternalNote({ msg }: { msg: TicketMessage }) {
  return (
    <div className="group/msg mx-1 rounded-lg border border-warning/25 bg-warning/5 px-3 py-2.5 transition-colors hover:bg-warning/10">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-warning">
        <Lock className="size-3" />
        Internal note · {msg.author.name || msg.author.email}
      </div>
      <p className="whitespace-pre-wrap text-[13px] leading-relaxed wrap-break-word text-foreground/80">{msg.content}</p>
      <p className="mt-1.5 text-[10px] text-muted-foreground/70" title={new Date(msg.createdAt).toLocaleString()}>
        {formatTime(msg.createdAt)}
      </p>
    </div>
  )
}

function MessageBubble({
  msg,
  mine,
  showAvatar,
  showTime,
}: {
  msg: TicketMessage
  mine: boolean
  showAvatar: boolean
  showTime: boolean
}) {
  return (
    <div
      className={cn(
        'group/msg flex gap-2 rounded-lg px-2 py-0.5 transition-colors hover:bg-muted/30',
        mine && 'flex-row-reverse',
      )}
    >
      {/* avatar column — reserved width to avoid layout shift */}
      <div className="w-7 shrink-0 pt-0.5">
        {showAvatar && (
          <Avatar className="size-7">
            <AvatarImage src={msg.author.avatar ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
              {initials(msg.author.name, msg.author.email)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* content */}
      <div className={cn('flex min-w-0 max-w-[75%] flex-col', mine && 'items-end')}>
        {showAvatar && (
          <div className={cn('mb-0.5 flex items-baseline gap-1.5 px-0.5', mine && 'flex-row-reverse')}>
            <span className="text-[11px] font-medium text-foreground/80">
              {mine ? 'You' : msg.author.name || msg.author.email}
            </span>
          </div>
        )}
        <div
          className={cn(
            'whitespace-pre-wrap rounded-2xl px-3 py-2 text-[13px] leading-relaxed wrap-break-word',
            mine
              ? 'rounded-br-sm bg-primary text-primary-foreground'
              : 'rounded-bl-sm bg-muted text-foreground',
          )}
        >
          {msg.content}
        </div>
        {showTime && (
          <span
            className={cn('mt-0.5 px-0.5 text-[10px] text-muted-foreground/60', mine && 'text-right')}
            title={new Date(msg.createdAt).toLocaleString()}
          >
            {formatTime(msg.createdAt)}
          </span>
        )}
      </div>
    </div>
  )
}

export function TicketThread({
  messages,
  currentUserId,
  className,
}: {
  messages: TicketMessage[]
  currentUserId: string
  className?: string
}) {
  const grouped = useMemo(() => {
    return messages.map((msg, i) => {
      const prev = i > 0 ? messages[i - 1] : null
      const next = i < messages.length - 1 ? messages[i + 1] : null
      const showDate = !prev || !isSameDay(prev.createdAt, msg.createdAt)
      const showAvatar = !prev || !shouldGroup(prev, msg)
      const showTime = !next || !shouldGroup(msg, next)
      return { msg, showDate, showAvatar, showTime }
    })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className={cn('flex min-h-0 flex-1 items-center justify-center p-8', className)}>
        <p className="text-sm text-muted-foreground">No replies yet.</p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-0.5 px-2 py-3 sm:px-4', className)}>
      {grouped.map(({ msg, showDate, showAvatar, showTime }) => {
        if (msg.isInternalNote) {
          return (
            <div key={msg.id} className="py-1.5">
              <InternalNote msg={msg} />
            </div>
          )
        }

        return (
          <div key={msg.id}>
            {showDate && <DateSeparator date={msg.createdAt} />}
            <div className="py-0.5">
              <MessageBubble
                msg={msg}
                mine={msg.authorId === currentUserId}
                showAvatar={showAvatar}
                showTime={showTime}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

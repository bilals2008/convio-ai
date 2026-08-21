import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, ArrowDown, Check, CheckCheck, Loader2, MessageSquare } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn, formatRelativeTime } from '@/lib/utils'
import { format, isSameDay, parseISO } from 'date-fns'

export interface ConversationAuthor {
  id: string
  name: string | null
  email: string
  avatar: string | null
}

export interface ConversationMessage {
  id: string
  content: string
  createdAt: string
  author: ConversationAuthor
  status?: 'sending' | 'sent' | 'failed'
}

interface TicketConversationProps {
  messages: ConversationMessage[]
  currentUserId: string | undefined
  /** ISO timestamp of the latest read by the other party, for the Seen receipt */
  othersReadAt: string | null
  typingUsers: { userId: string; name: string }[]
  onRetry: (messageId: string) => void
}

const GROUP_WINDOW_MS = 5 * 60 * 1000

function authorLabel(author: ConversationAuthor) {
  return author.name || author.email.split('@')[0] || 'User'
}

function initials(author: ConversationAuthor) {
  return authorLabel(author).slice(0, 2).toUpperCase()
}

export function TicketConversation({ messages, currentUserId, othersReadAt, typingUsers, onRetry }: TicketConversationProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [stickToBottom, setStickToBottom] = useState(true)

  useEffect(() => {
    const el = scrollRef.current
    if (!el || !stickToBottom) return
    el.scrollTo({ top: el.scrollHeight, behavior: messages.length > 1 ? 'smooth' : 'auto' })
  }, [messages.length, typingUsers.length, stickToBottom, messages])

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    setStickToBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80)
  }

  function scrollToBottom() {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    setStickToBottom(true)
  }

  const rows = useMemo(() => {
    return messages.map((msg, i) => {
      const prev = messages[i - 1]
      const createdAt = parseISO(msg.createdAt)
      const prevCreatedAt = prev ? parseISO(prev.createdAt) : null

      const newDay = !prevCreatedAt || !isSameDay(createdAt, prevCreatedAt)
      const isOwn = msg.author.id === currentUserId
      const startsGroup =
        newDay ||
        !prev ||
        prev.author.id !== msg.author.id ||
        (prevCreatedAt ? createdAt.getTime() - prevCreatedAt.getTime() > GROUP_WINDOW_MS : true)

      return { msg, createdAt, newDay, isOwn, startsGroup }
    })
  }, [messages, currentUserId])

  const lastOwnMessageId = useMemo(() => {
    for (let i = rows.length - 1; i >= 0; i--) {
      if (rows[i].isOwn && rows[i].msg.status !== 'failed') return rows[i].msg.id
    }
    return null
  }, [rows])

  const seenMessageId = useMemo(() => {
    if (!othersReadAt || !lastOwnMessageId) return null
    const lastOwn = messages.find((m) => m.id === lastOwnMessageId)
    if (lastOwn && parseISO(othersReadAt) >= parseISO(lastOwn.createdAt)) return lastOwnMessageId
    return null
  }, [othersReadAt, lastOwnMessageId, messages])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
        <MessageSquare className="size-8 text-muted-foreground/50" />
        <p className="text-sm font-medium">No messages yet</p>
        <p className="text-sm text-muted-foreground">Start the conversation below.</p>
      </div>
    )
  }

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        role="log"
        aria-label="Conversation"
        aria-live="polite"
        className="h-full overflow-y-auto px-4 py-4 sm:px-6"
      >
        <div className="mx-auto flex max-w-3xl flex-col">
          {rows.map(({ msg, createdAt, newDay, isOwn, startsGroup }) => (
            <div key={msg.id}>
              {newDay && (
                <div className="my-4 flex items-center justify-center" aria-hidden>
                  <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {format(createdAt, 'MMMM d, yyyy')}
                  </span>
                </div>
              )}

              <MessageRow
                msg={msg}
                createdAt={createdAt}
                isOwn={isOwn}
                startsGroup={startsGroup}
                showSeen={isOwn && msg.id === seenMessageId}
                onRetry={onRetry}
              />
            </div>
          ))}

          {typingUsers.length > 0 && (
            <div className="mt-2 pl-9" aria-live="polite">
              <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                <span className="flex gap-0.5" aria-hidden>
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60" />
                </span>
                {typingUsers.map((u) => u.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…
              </span>
            </div>
          )}

          <div className="h-2" />
        </div>
      </div>

      {!stickToBottom && (
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label="Jump to latest message"
          className="absolute bottom-4 left-1/2 size-8 -translate-x-1/2 rounded-full shadow-md"
          onClick={scrollToBottom}
        >
          <ArrowDown className="size-4" />
        </Button>
      )}
    </div>
  )
}

function MessageRow({
  msg,
  createdAt,
  isOwn,
  startsGroup,
  showSeen,
  onRetry,
}: {
  msg: ConversationMessage
  createdAt: Date
  isOwn: boolean
  startsGroup: boolean
  showSeen: boolean
  onRetry: (messageId: string) => void
}) {
  const failed = msg.status === 'failed'
  const sending = msg.status === 'sending'

  return (
    <div className={cn('flex w-full gap-2.5', isOwn ? 'justify-end' : 'justify-start', startsGroup ? 'mt-5' : 'mt-1.5')}>
      {!isOwn && (
        <div className="w-7 shrink-0">
          {startsGroup && (
            <Avatar className="size-7">
              <AvatarImage src={msg.author.avatar ?? undefined} alt="" />
              <AvatarFallback className="bg-primary/10 text-[10px] font-medium text-primary">
                {initials(msg.author)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      )}

      <div className={cn('flex max-w-[85%] flex-col sm:max-w-[75%]', isOwn && 'items-end')}>
        {startsGroup && (
          <div className={cn('mb-1 flex items-baseline gap-2', isOwn && 'flex-row-reverse')}>
            <span className="text-xs font-medium">{isOwn ? 'You' : authorLabel(msg.author)}</span>
            <time dateTime={msg.createdAt} className="text-[11px] text-muted-foreground">
              {formatRelativeTime(msg.createdAt)}
            </time>
          </div>
        )}

        {msg.content && (
          <div
            className={cn(
              'whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
              isOwn
                ? 'rounded-br-md bg-primary text-primary-foreground'
                : 'rounded-bl-md bg-muted text-foreground',
              failed && 'border border-destructive/40 bg-destructive/10 text-foreground',
              sending && 'opacity-70'
            )}
          >
            {msg.content}
          </div>
        )}

        {(startsGroup || failed || sending) && (
          <div className={cn('mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground', isOwn && 'flex-row-reverse')}>
            {failed ? (
              <>
                <AlertCircle className="size-3 text-destructive" />
                <span>Failed to send</span>
                <button
                  type="button"
                  className="font-medium text-foreground underline-offset-2 hover:underline"
                  onClick={() => onRetry(msg.id)}
                >
                  Retry
                </button>
              </>
            ) : sending ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>Sending…</span>
              </>
            ) : (
              <>
                <span>{format(createdAt, 'HH:mm')}</span>
                {isOwn &&
                  (showSeen ? (
                    <span className="inline-flex items-center gap-1">
                      <CheckCheck className="size-3" /> Seen
                    </span>
                  ) : (
                    <Check className="size-3 opacity-50" aria-label="Sent" />
                  ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

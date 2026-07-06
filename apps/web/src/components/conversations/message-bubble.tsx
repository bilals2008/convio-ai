import { Bot, User, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type MessageRole = 'user' | 'assistant' | 'system'
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error'

interface MessageItem {
  id: string
  role: MessageRole
  content: string
  status?: MessageStatus
  createdAt: string
}

function formatTime(date: string): string {
  const d = new Date(date)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatFullDate(date: string): string {
  return new Date(date).toLocaleString()
}

interface MessageBubbleProps {
  message: MessageItem
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <div className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex gap-2', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'flex size-8 items-center justify-center rounded-full shrink-0',
          isUser ? 'bg-primary/10' : 'bg-muted'
        )}
      >
        {isUser ? (
          <User className="size-4 text-primary" />
        ) : (
          <Bot className="size-4 text-muted-foreground" />
        )}
      </div>

      <div className={cn('max-w-[70%] space-y-1', isUser && 'items-end')}>
        <div
          className={cn(
            'rounded-xl px-3 py-2 text-sm',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-muted rounded-tl-sm'
          )}
        >
          {message.content}
        </div>
        <div className={cn('flex items-center gap-1.5 text-xs text-muted-foreground', isUser && 'justify-end')}>
          <span title={formatFullDate(message.createdAt)}>{formatTime(message.createdAt)}</span>
          {message.status === 'error' && (
            <AlertCircle className="size-3 text-destructive" />
          )}
        </div>
      </div>
    </div>
  )
}

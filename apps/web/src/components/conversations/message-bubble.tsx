import { AlertCircle, Loader2 } from 'lucide-react'
import { AiResponse } from '@/components/shared/ai-response'

type MessageRole = 'user' | 'assistant' | 'system'
type MessageStatus = 'sending' | 'sent' | 'error'

interface MessageItem {
  id: string
  role: MessageRole
  content: string
  reasoning?: string
  status?: MessageStatus
  createdAt: string
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatFullDate(date: string): string {
  return new Date(date).toLocaleString()
}

interface MessageBubbleProps {
  message: MessageItem
}

export function MessageBubble({ message }: MessageBubbleProps) {
  if (message.role === 'system') {
    return (
      <div className="flex justify-center py-1">
        <div className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          {message.content}
        </div>
      </div>
    )
  }

  if (message.role === 'user') {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
          {message.content}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
          <span title={formatFullDate(message.createdAt)}>{formatTime(message.createdAt)}</span>
          {message.status === 'sending' && <Loader2 className="size-3 animate-spin" role="status" aria-label="Sending" />}
          {message.status === 'error' && (
            <>
              <AlertCircle className="size-3 text-destructive" aria-label="Failed to send" />
              <span className="text-destructive">Failed</span>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {message.reasoning && (
        <details className="rounded-lg border border-border/60 px-3 py-2 text-xs text-muted-foreground">
          <summary className="cursor-pointer select-none font-medium text-foreground/60 transition-colors hover:text-foreground">
            Reasoning
          </summary>
          <div className="mt-1.5 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {message.reasoning}
          </div>
        </details>
      )}
      <AiResponse content={message.content} showActions />
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
        <span title={formatFullDate(message.createdAt)}>{formatTime(message.createdAt)}</span>
      </div>
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { Bot, MessageCircle } from 'lucide-react'
import { Skeleton } from '@/components/shared/loading'
import { TypingIndicator } from '@/components/shared/typing-indicator'
import { AiResponse } from '@/components/shared/ai-response'
import { MessageBubble } from './message-bubble'

type MessageRole = 'user' | 'assistant' | 'system'
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error'

interface MessageItem {
  id: string
  role: MessageRole
  content: string
  reasoning?: string
  status?: MessageStatus
  createdAt: string
}

interface MessageListProps {
  messages: MessageItem[]
  loading?: boolean
  streamingMessage?: MessageItem
  streamingReasoning?: string
}

export function MessageList({ messages, loading, streamingMessage, streamingReasoning }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [messages, streamingMessage?.content])

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={i % 2 === 0 ? 'flex gap-2' : 'flex flex-row-reverse gap-2'}>
            <Skeleton className="size-8 rounded-full shrink-0" />
            <Skeleton className={i % 2 === 0 ? 'h-10 w-48 rounded-xl' : 'h-10 w-36 rounded-xl'} />
          </div>
        ))}
      </div>
    )
  }

  if (messages.length === 0 && !streamingMessage) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
          <MessageCircle className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No messages yet</p>
      </div>
    )
  }

  const renderedMessages = messages.flatMap((msg, index) => {
    const msgDate = new Date(msg.createdAt).toLocaleDateString()
    const prevDate = index > 0 ? new Date(messages[index - 1].createdAt).toLocaleDateString() : null
    const showDateSeparator = msgDate !== prevDate
    const elements: React.ReactNode[] = []

    if (showDateSeparator) {
      elements.push(
        <div key={`date-${msg.id}`} className="flex justify-center py-2">
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {msgDate}
          </span>
        </div>
      )
    }

    elements.push(<MessageBubble key={msg.id} message={msg} />)
    return elements
  })

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {renderedMessages}

      {streamingMessage && (
        <div className="flex gap-2">
          <div className="flex size-8 items-center justify-center rounded-full shrink-0 bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
            <Bot className="size-4 text-primary" />
          </div>
          <div className="max-w-[70%]">
            <div className="rounded-xl rounded-tl-sm px-3 py-2 text-sm bg-muted">
              {streamingReasoning && (
                <details className="px-0 pt-0 pb-2 text-xs text-muted-foreground border-b border-border/40 mb-2" open>
                  <summary className="flex cursor-pointer select-none items-center gap-1.5 font-medium text-foreground/60 hover:text-foreground transition-colors">
                    Reasoning…
                  </summary>
                  <div className="mt-1.5 max-h-96 overflow-y-auto whitespace-pre-wrap text-muted-foreground/80 leading-relaxed">
                    {streamingReasoning}
                  </div>
                </details>
              )}
              {streamingMessage.content ? (
                <AiResponse content={streamingMessage.content} isStreaming />
              ) : (
                <TypingIndicator />
              )}
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

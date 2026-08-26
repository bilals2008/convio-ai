import { Bot } from 'lucide-react'
import { Skeleton } from '@/components/shared/loading'
import { AiResponse } from '@/components/shared/ai-response'
import { Spinner } from '@/components/ui/spinner'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller'
import { MessageBubble } from './message-bubble'

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

interface MessageListProps {
  messages: MessageItem[]
  loading?: boolean
  streamingMessage?: MessageItem
  streamingReasoning?: string
}

export function MessageList({ messages, loading, streamingMessage, streamingReasoning }: MessageListProps) {
  // A refetch (realtime broadcast) can land the persisted response while the
  // stream is still open — skip the streaming bubble to avoid a duplicate.
  const lastMessage = messages[messages.length - 1]
  const showStreaming =
    streamingMessage &&
    !(lastMessage?.role === 'assistant' && lastMessage.content === streamingMessage.content)
  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-6">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={i % 2 === 0 ? 'flex justify-end' : 'flex'}>
            <Skeleton className={i % 2 === 0 ? 'h-9 w-48 rounded-2xl' : 'h-16 w-64 rounded-xl'} />
          </div>
        ))}
      </div>
    )
  }

  if (messages.length === 0 && !streamingMessage) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <Bot className="size-6 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">No messages yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Send a message below to start the conversation.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <MessageScrollerProvider>
      <MessageScroller className="min-h-0 flex-1">
        <MessageScrollerViewport>
          <MessageScrollerContent className="mx-auto w-full max-w-3xl gap-4 px-4 py-4 sm:px-6">
            {messages.flatMap((msg, index) => {
              const msgDate = new Date(msg.createdAt).toLocaleDateString()
              const prevDate = index > 0 ? new Date(messages[index - 1].createdAt).toLocaleDateString() : null
              const elements: React.ReactNode[] = []

              if (msgDate !== prevDate) {
                elements.push(
                  <div key={`date-${msg.id}`} className="flex justify-center py-1">
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">
                      {msgDate}
                    </span>
                  </div>,
                )
              }

              elements.push(
                <MessageScrollerItem key={msg.id} messageId={msg.id} scrollAnchor={msg.role === 'user'}>
                  <MessageBubble message={msg} />
                </MessageScrollerItem>,
              )

              return elements
            })}

            {showStreaming && (
              <MessageScrollerItem messageId={streamingMessage.id} scrollAnchor>
                <div className="flex min-w-0 flex-col gap-1.5">
                  {streamingReasoning && (
                    <details className="rounded-lg border border-border/60 px-3 py-2 text-xs text-muted-foreground">
                      <summary className="cursor-pointer select-none font-medium text-foreground/60 transition-colors hover:text-foreground">
                        Reasoning…
                      </summary>
                      <div className="mt-1.5 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                        {streamingReasoning}
                      </div>
                    </details>
                  )}
                  {streamingMessage.content ? (
                    <AiResponse content={streamingMessage.content} isStreaming showActions={false} />
                  ) : (
                    <span className="flex items-center gap-2 px-1 py-1 text-sm text-muted-foreground">
                      <Spinner className="size-3.5" /> Thinking…
                    </span>
                  )}
                </div>
              </MessageScrollerItem>
            )}
          </MessageScrollerContent>
          <MessageScrollerButton />
        </MessageScrollerViewport>
      </MessageScroller>
    </MessageScrollerProvider>
  )
}

import { Bot, Loader2, Send, Square, User } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { AiResponse } from '@/components/shared/ai-response'
import { ToolCallChip, type ToolCallChipItem } from './tool-call-chip'
import { SuggestedQuestions } from './suggested-questions'
import { ChartBlock } from './chart-block'
import type { AdminChartSpec } from '@/admin/services/admin-api'
import { cn } from '@/lib/utils'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolCalls?: ToolCallChipItem[]
  charts?: AdminChartSpec[]
  error?: string | null
  streaming?: boolean
}

interface AssistantChatProps {
  messages: ChatMessage[]
  isStreaming: boolean
  onSend: (content: string) => void
  onStop: () => void
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2.5" aria-live="polite" role="status">
      <span className="flex items-center gap-1">
        <span className="size-1.5 rounded-full bg-primary/80 animate-typing-dot" style={{ animationDelay: '0ms' }} />
        <span className="size-1.5 rounded-full bg-primary/80 animate-typing-dot" style={{ animationDelay: '180ms' }} />
        <span className="size-1.5 rounded-full bg-primary/80 animate-typing-dot" style={{ animationDelay: '360ms' }} />
      </span>
      <span className="text-xs font-medium tracking-wide text-muted-foreground animate-pulse">Thinking</span>
    </div>
  )
}

function MessageBubble({ message, isStreaming }: { message: ChatMessage; isStreaming: boolean }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="flex max-w-[85%] items-start gap-2 sm:max-w-[75%]">
          <div className="rounded-2xl rounded-tr-sm border border-border/60 bg-primary px-3.5 py-2 text-sm text-primary-foreground">
            {message.content}
          </div>
          <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
            <User className="size-3.5 text-muted-foreground" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2.5">
      <div
        className={cn(
          'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10',
          message.streaming && !message.content && 'animate-pulse',
        )}
      >
        <Bot className="size-4 text-primary" />
      </div>
      <div className="min-w-0 max-w-[92%] rounded-2xl rounded-tl-sm border border-border/60 bg-card px-3 py-2 sm:max-w-[80%]">
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mb-1.5 flex flex-wrap gap-1">
            {message.toolCalls.map((tc, i) => (
              <ToolCallChip key={i} item={tc} />
            ))}
          </div>
        )}
        {message.charts && message.charts.length > 0 && (
          <div className="mb-1.5 space-y-1.5">
            {message.charts.map((c, i) => (
              <ChartBlock key={i} spec={c} />
            ))}
          </div>
        )}
        {message.error ? (
          <p className="rounded-md bg-destructive/10 px-2.5 py-1.5 text-sm text-destructive">
            Failed: {message.error}
          </p>
        ) : message.streaming && !message.content ? (
          <ThinkingIndicator />
        ) : (
          <AiResponse
            content={message.content}
            isStreaming={message.streaming}
            showActions={!!message.content && !message.streaming && !isStreaming}
          />
        )}
      </div>
    </div>
  )
}

export function AssistantChat({ messages, isStreaming, onSend, onStop }: AssistantChatProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const stickToBottomRef = useRef(true)

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el && stickToBottomRef.current) el.scrollTop = el.scrollHeight
  }, [messages])

  const send = () => {
    const content = input.trim()
    if (!content || isStreaming) return
    setInput('')
    stickToBottomRef.current = true
    onSend(content)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={scrollRef} onScroll={handleScroll} className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex h-full flex-col gap-3 px-3 py-3">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
              <div className="text-center">
                <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10">
                  <Bot className="size-5 text-primary" />
                </div>
                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                  Platform intelligence assistant
                </h2>
                <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
                  Ask about revenue, users, organizations, agents, tickets, usage limits, and system health across Convio.
                </p>
              </div>
              <SuggestedQuestions onSend={(q) => { setInput(''); onSend(q) }} />
            </div>
          ) : (
            messages.map((m) => <MessageBubble key={m.id} message={m} isStreaming={isStreaming} />)
          )}
        </div>
      </div>

      <div className="border-t border-border/60 p-2">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the platform…"
            className="max-h-40 min-h-[38px] flex-1 resize-none"
            rows={1}
            disabled={isStreaming}
          />
          {isStreaming ? (
            <Button type="button" size="icon" variant="secondary" onClick={onStop} aria-label="Stop generating">
              <Square className="size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              size="icon"
              onClick={send}
              disabled={!input.trim()}
              aria-label="Send message"
            >
              {isStreaming ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
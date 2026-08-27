import { ArrowUpIcon, Bot, SquareIcon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useEffect, useRef, useState } from 'react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { ToolCallChip, type ToolCallChipItem } from './tool-call-chip'
import { SuggestedQuestions } from './suggested-questions'
import { ChartBlock } from './chart-block'
import type { AdminChartSpec } from '@/admin/services/admin-api'

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

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === 'user') {
    return (
      <div className="flex w-full justify-end">
        <div className="max-w-[80%] overflow-hidden rounded-3xl bg-muted px-3 py-2.5 text-sm leading-relaxed wrap-break-word">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-w-0">
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
        <div className="shimmer flex items-center gap-2 px-3 text-sm text-muted-foreground">
          Thinking…
        </div>
      ) : (
        <div className="typeset typeset-docs min-w-0 px-1.5 text-sm leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          {message.streaming && (
            <span aria-label="Generating" className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-primary align-middle" />
          )}
        </div>
      )}
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

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Scroll area — takes all remaining space */}
      <div ref={scrollRef} onScroll={handleScroll} className="min-h-0 flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex min-h-full flex-col items-center justify-center px-6 py-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10">
                <Bot className="size-5 text-primary" />
              </div>
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                What can I help with?
              </h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
                Ask about revenue, users, organizations, agents, tickets, usage limits, and system health across Convio.
              </p>
            </div>
            <div className="mt-6 w-full max-w-2xl">
              <SuggestedQuestions onSend={(q) => { setInput(''); onSend(q) }} />
            </div>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-6">
            {messages.map((m) => <MessageBubble key={m.id} message={m} />)}
          </div>
        )}
      </div>

      {/* Composer — always stuck at the bottom */}
      <div className="shrink-0 border-t border-border/60 px-6 py-3">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={(e) => { e.preventDefault(); send() }}>
            <InputGroup className="rounded-2xl border-transparent bg-input/50 dark:bg-input/30">
              <InputGroupTextarea
                placeholder="Send a message…"
                className="p-3.5"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault()
                    send()
                  }
                }}
                disabled={isStreaming}
              />
              <InputGroupAddon align="block-end">
                <div className="flex items-center">
                  <span className="text-xs text-muted-foreground">Platform assistant</span>
                  {isStreaming ? (
                    <InputGroupButton
                      type="button"
                      size="icon-sm"
                      variant="outline"
                      aria-label="Stop generating"
                      className="ml-auto"
                      onClick={onStop}
                    >
                      <SquareIcon />
                    </InputGroupButton>
                  ) : (
                    <InputGroupButton
                      type="submit"
                      size="icon-sm"
                      variant="default"
                      aria-label="Send message"
                      className="ml-auto"
                      disabled={!input.trim()}
                    >
                      <ArrowUpIcon />
                    </InputGroupButton>
                  )}
                </div>
              </InputGroupAddon>
            </InputGroup>
          </form>
        </div>
      </div>
    </div>
  )
}

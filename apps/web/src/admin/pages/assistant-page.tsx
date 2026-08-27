import { ArrowUpIcon, ScrollText, SquareIcon, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AiResponse } from '@/components/shared/ai-response'
import { useAvailableModels } from '@/lib/hooks/use-available-models'
import type { AdminAssistantStreamChunk } from '@/admin/services/admin-api'
import {
  useAdminConversations,
  useAdminMessages,
  useAdminAssistantStream,
  useAdminAssistantLogs,
  useDeleteAdminConversation,
} from '@/admin/hooks/use-admin-assistant'
import { ConversationList } from '@/admin/components/assistant/conversation-list'
import { ToolCallChip, type ToolCallChipItem } from '@/admin/components/assistant/tool-call-chip'
import { ChartBlock } from '@/admin/components/assistant/chart-block'
import { SuggestedQuestions } from '@/admin/components/assistant/suggested-questions'
import type { AdminChartSpec } from '@/admin/services/admin-api'

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

function LogsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: logs, isLoading } = useAdminAssistantLogs()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle>Assistant activity</SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading && (
            <div className="space-y-2 p-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}
          {!isLoading && (logs ?? []).length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">No assistant activity yet.</p>
          )}
          <div className="divide-y divide-border/60">
            {(logs ?? []).map((log) => (
              <div key={log.id} className="px-1 py-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={
                      log.success ? 'text-[11px] font-medium text-emerald-500' : 'text-[11px] font-medium text-destructive'
                    }
                  >
                    {log.success ? 'OK' : 'FAILED'}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">{log.action}</span>
                  {log.latencyMs !== null && (
                    <span className="ml-auto text-[11px] tabular-nums text-muted-foreground">
                      {Math.round(log.latencyMs / 1000)}s
                    </span>
                  )}
                  <span className="text-[11px] text-muted-foreground">{timeAgo(log.createdAt)}</span>
                </div>
                {log.query && <p className="mt-0.5 truncate text-xs text-foreground/80">{log.query}</p>}
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolCalls?: ToolCallChipItem[]
  charts?: AdminChartSpec[]
  error?: string | null
  streaming?: boolean
}

export default function AdminAssistantPage() {
  const queryClient = useQueryClient()
  const { data: models = [], isLoading: modelsLoading } = useAvailableModels()
  const { data: conversations, isLoading: conversationsLoading } = useAdminConversations()
  const { stream, abort, isStreaming } = useAdminAssistantStream()
  const deleteMutation = useDeleteAdminConversation()

  const [model, setModel] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [logsOpen, setLogsOpen] = useState(false)
  const { data: history } = useAdminMessages(activeId)
  const hydratedConvRef = useRef<string | null>(null)

  const resolvedModel = models.some((m) => m.id === model) ? model : (models[0]?.id ?? '')

  useEffect(() => {
    if (!model && models.length > 0) setModel(models[0].id)
  }, [models, model])

  useEffect(() => {
    if (activeId && history && messages.length === 0 && hydratedConvRef.current !== activeId) {
      hydratedConvRef.current = activeId
      setMessages(
        history.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          error: m.error,
          toolCalls: (m.toolCalls ?? []).map((tc) => ({ name: tc.name, status: 'done' as const })),
        })),
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, history])

  const selectConversation = (id: string) => {
    if (isStreaming) abort()
    setActiveId(id)
    setMessages([])
    hydratedConvRef.current = null
    setHistoryOpen(false)
  }

  const handleNew = () => {
    if (isStreaming) abort()
    setActiveId(null)
    setMessages([])
    hydratedConvRef.current = null
    setHistoryOpen(false)
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
    if (id === activeId) {
      setActiveId(null)
      setMessages([])
      hydratedConvRef.current = null
    }
  }

  const handleSend = async (content: string) => {
    const assistantId = crypto.randomUUID()
    const baseId = activeId
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content },
      { id: assistantId, role: 'assistant', content: '', streaming: true, toolCalls: [] },
    ])

    const toolMap = new Map<string, ToolCallChipItem>()
    const syncToolChips = () => {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, toolCalls: [...toolMap.values()] } : m)),
      )
    }

    try {
      await stream(
        { content, conversationId: baseId ?? undefined, model: resolvedModel || undefined },
        {
          onChunk: (chunk: AdminAssistantStreamChunk) => {
            if (chunk.type === 'text' && chunk.content) {
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk.content } : m)),
              )
            } else if (chunk.type === 'tool_call' && chunk.toolCall) {
              toolMap.set(chunk.toolCall.id, { name: chunk.toolCall.name, status: 'running' })
              syncToolChips()
            } else if (chunk.type === 'tool_result' && chunk.toolCall) {
              const result = chunk.toolCall.result as Record<string, unknown> | undefined
              const failed = !!result && 'error' in result
              toolMap.set(chunk.toolCall.id, {
                name: chunk.toolCall.name,
                status: failed ? 'error' : 'done',
              })
              syncToolChips()
            } else if (chunk.type === 'chart' && chunk.chart) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, charts: [...(m.charts ?? []), chunk.chart!] }
                    : m,
                ),
              )
            } else if (chunk.type === 'done' && chunk.conversationId && chunk.conversationId !== baseId) {
              setActiveId(chunk.conversationId)
            }
          },
        },
      )
    } catch (err) {
      const aborted = err instanceof DOMException && err.name === 'AbortError'
      if (!aborted) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, error: err instanceof Error ? err.message : 'Generation failed', streaming: false }
              : m,
          ),
        )
      }
    }

    setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m)))
    queryClient.invalidateQueries({ queryKey: ['admin', 'assistant', 'conversations'] })
    if (baseId) {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'assistant', 'conversations', baseId, 'messages'],
      })
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/40 px-2.5 py-1.5">
        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={() => setHistoryOpen(true)}
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Open conversation history"
                />
              }
            >
              <PanelLeftOpenIcon />
            </TooltipTrigger>
            <TooltipContent>History</TooltipContent>
          </Tooltip>
          <span className="text-sm font-semibold tracking-tight text-foreground">AI Assistant</span>
          {activeId && (
            <Badge variant="secondary" className="hidden h-5 px-1.5 text-[10px] font-normal sm:inline-flex">
              {conversations?.find((c) => c.id === activeId)?.title}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs text-muted-foreground" onClick={() => setLogsOpen(true)}>
          <ScrollText className="size-3.5" />
          Logs
        </Button>
      </div>

      {/* Chat area */}
      <div className="min-h-0 flex-1">
        <div className="flex h-full min-h-0 w-full flex-1 flex-col">
          {messages.length === 0 ? (
            <div className="flex min-h-0 flex-1 items-center justify-center p-6">
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>What can I help with?</EmptyTitle>
                  <EmptyDescription>
                    Ask about revenue, users, organizations, agents, tickets, usage limits, and system health across Convio.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <SuggestedQuestions onSend={(q) => void handleSend(q)} />
                </EmptyContent>
              </Empty>
            </div>
          ) : (
            <MessageScrollerProvider>
              <MessageScroller className="min-h-0 flex-1">
                <MessageScrollerViewport>
                  <MessageScrollerContent className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-6">
                    {messages.map((message) => (
                      <MessageScrollerItem key={message.id} messageId={message.id} scrollAnchor={message.role === 'user'}>
                        {message.role === 'user' ? (
                          <div className="flex justify-end">
                            <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
                              {message.content}
                            </div>
                          </div>
                        ) : (
                          <div className="flex min-w-0 flex-col gap-1">
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
                            ) : message.content ? (
                              <AiResponse content={message.content} showActions={false} />
                            ) : (
                              <span className="flex items-center gap-2 px-3 text-sm text-muted-foreground">
                                <Spinner className="size-3.5" /> Thinking…
                              </span>
                            )}
                          </div>
                        )}
                      </MessageScrollerItem>
                    ))}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            </MessageScrollerProvider>
          )}

          {/* Composer */}
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-6 pb-3">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const input = e.currentTarget.elements.namedItem('prompt') as HTMLTextAreaElement
                const text = input.value.trim()
                if (!text || isStreaming) return
                void handleSend(text)
                input.value = ''
              }}
            >
              <InputGroup>
                <InputGroupTextarea
                  name="prompt"
                  placeholder={resolvedModel ? 'Ask about the platform…' : modelsLoading ? 'Loading models…' : 'No models available'}
                  className="p-3.5"
                  disabled={!resolvedModel || isStreaming}
                />
                <InputGroupAddon align="block-end">
                  <Select
                    items={models.map((m) => ({ label: m.name, value: m.id }))}
                    value={resolvedModel}
                    onValueChange={(next) => { if (typeof next === 'string') setModel(next) }}
                  >
                    <SelectTrigger aria-label="Model" className="bg-background" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        {models.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {isStreaming ? (
                    <InputGroupButton
                      type="button"
                      size="icon-sm"
                      variant="outline"
                      aria-label="Stop generating"
                      className="ml-auto"
                      onClick={abort}
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
                      disabled={!resolvedModel || modelsLoading}
                    >
                      <ArrowUpIcon />
                    </InputGroupButton>
                  )}
                </InputGroupAddon>
              </InputGroup>
            </form>
          </div>
        </div>
      </div>

      {/* History slide-over */}
      {historyOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setHistoryOpen(false)}
          />
          <div className="relative flex h-full w-80 flex-col border-r border-border/50 bg-card shadow-xl animate-in slide-in-from-left duration-200">
            <div className="flex shrink-0 items-center justify-between border-b border-border/40 p-2">
              <span className="px-1 text-sm font-semibold text-foreground">Conversations</span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setHistoryOpen(false)}
                aria-label="Close history"
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="min-h-0 flex-1">
              <ConversationList
                conversations={conversations}
                isLoading={conversationsLoading}
                activeId={activeId}
                onSelect={selectConversation}
                onDelete={handleDelete}
                onNew={handleNew}
              />
            </div>
          </div>
        </div>
      )}

      <LogsSheet open={logsOpen} onOpenChange={setLogsOpen} />
    </div>
  )
}

function PanelLeftOpenIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
    </svg>
  )
}

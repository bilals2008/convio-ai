import { PanelLeftOpen, ScrollText, X } from 'lucide-react'
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
import type { AdminAssistantStreamChunk } from '@/admin/services/admin-api'
import {
  useAdminConversations,
  useAdminMessages,
  useAdminAssistantStream,
  useAdminAssistantLogs,
  useDeleteAdminConversation,
} from '@/admin/hooks/use-admin-assistant'
import { ConversationList } from '@/admin/components/assistant/conversation-list'
import { AssistantChat, type ChatMessage } from '@/admin/components/assistant/assistant-chat'
import type { ToolCallChipItem } from '@/admin/components/assistant/tool-call-chip'

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

export default function AdminAssistantPage() {
  const queryClient = useQueryClient()
  const { data: conversations, isLoading: conversationsLoading } = useAdminConversations()
  const { stream, abort, isStreaming } = useAdminAssistantStream()
  const deleteMutation = useDeleteAdminConversation()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [logsOpen, setLogsOpen] = useState(false)
  const { data: history } = useAdminMessages(activeId)
  const hydratedConvRef = useRef<string | null>(null)

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
        { content, conversationId: baseId ?? undefined },
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

  const historyPanel = (
    <ConversationList
      conversations={conversations}
      isLoading={conversationsLoading}
      activeId={activeId}
      onSelect={selectConversation}
      onDelete={handleDelete}
      onNew={handleNew}
    />
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
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
              <PanelLeftOpen className="size-4" />
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

      <div className="min-h-0 flex-1">
        <AssistantChat
          messages={messages}
          isStreaming={isStreaming}
          onSend={(q) => void handleSend(q)}
          onStop={abort}
        />
      </div>

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
            <div className="min-h-0 flex-1">{historyPanel}</div>
          </div>
        </div>
      )}

      <LogsSheet open={logsOpen} onOpenChange={setLogsOpen} />
    </div>
  )
}
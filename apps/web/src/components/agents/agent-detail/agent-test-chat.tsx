import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import {
  Search,
  Plus,
  Trash2,
  RotateCcw,
  Send,
  Bot,
  User,
  Loader2,
  MessageSquare,
  Settings2,
  Copy,
  Check,
  Globe,
  Calculator,
  ExternalLink,
  Clock,
  Plug,
  Pencil,
  RefreshCw,
  SquarePen,
  PanelLeftOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Message, MessageAvatar, MessageContent, MessageFooter } from '@/components/ui/message'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { cn, formatTokenCount } from '@/lib/utils'
import { TypingIndicator } from '@/components/shared/typing-indicator'
import { AiResponse } from '@/components/shared/ai-response'
import { agents as agentsApi, conversations as conversationsApi, messages as messagesApi } from '@/lib/api'
import { usePlan } from '@/lib/hooks/use-billing'
import { useProfile } from '@/lib/hooks/use-profile'
import { getReasoningEfforts } from '../reasoning'

interface ToolCallEntry {
  tool: string
  args: Record<string, unknown>
  result?: unknown
  status: 'calling' | 'done'
}

const toolIcons: Record<string, React.ElementType> = {
  'web-search': Globe,
  'url-fetcher': ExternalLink,
  calculator: Calculator,
  'current-time': Clock,
}

interface AgentTestChatProps {
  agentConfig: {
    name: string
    model: string
    systemPrompt: string
    temperature: number
    maxTokens: number
    reasoningEffort?: string
    providerKeyId?: string
    knowledgeBaseId?: string | null
    tools?: string[]
    mcpServerIds?: string[]
    avatar?: string | null
  }
  agentId: string
}

interface MessageItem {
  id: string
  role: 'user' | 'assistant'
  content: string
  reasoning?: string
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number }
  createdAt: string
}

interface Conversation {
  id: string
  title: string
  preview: string
  timestamp: string
  messages: MessageItem[]
}

function mapDbConv(conv: Record<string, unknown>): Conversation {
  const lastMsg = ((conv.messages as Record<string, unknown>[]) || [])[0]
  return {
    id: conv.id as string,
    title: 'Conversation',
    preview: lastMsg ? String(lastMsg.content).slice(0, 100) : 'Start a new chat...',
    timestamp: formatTimestamp((conv.updatedAt || conv.createdAt) as string),
    messages: [],
  }
}

function mapDbMsg(msg: Record<string, unknown>): MessageItem {
  return {
    id: msg.id as string,
    role: msg.role as 'user' | 'assistant',
    content: msg.content as string,
    createdAt: msg.createdAt as string,
  }
}

function formatTimestamp(date: string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ConversationItem({
  conversation,
  isActive,
  onClick,
}: {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-2.5 rounded-lg transition-colors duration-150',
        isActive
          ? 'bg-primary/10'
          : 'hover:bg-muted/50'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className={cn(
            'text-sm font-medium truncate',
            isActive ? 'text-primary' : 'text-foreground'
          )}
        >
          {conversation.title}
        </p>
        <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap shrink-0">
          {conversation.timestamp}
        </span>
      </div>
      <p className="text-xs text-muted-foreground truncate mt-0.5">
        {conversation.preview}
      </p>
    </button>
  )
}

function formatModelLabel(id: string): string {
  if (!id) return "Not configured"
  const part = id.includes("/") ? id.split("/").slice(1).join("/") : id
  return part
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function renderToolResultPreview(tool: string, result: unknown): string {
  if (!result) return ''
  const r = result as Record<string, unknown>
  if (tool === 'web-search' && Array.isArray(r.results)) {
    return `${r.results.length} results`
  }
  if (tool === 'current-time' && r.datetime) {
    return String(r.datetime)
  }
  if (tool === 'calculator') {
    const val = r.result ?? r
    if (val && typeof val === 'object') {
      if ('value' in val) return String((val as Record<string, unknown>).value)
      return JSON.stringify(val)
    }
    return String(val)
  }
  // MCP tools return { result: stringified_json }
  if (r.result && typeof r.result === 'string') {
    try {
      const parsed = JSON.parse(r.result)
      if (parsed.total_count !== undefined) return `${parsed.total_count} results`
      if (Array.isArray(parsed)) return `${parsed.length} items`
      if (parsed.items && Array.isArray(parsed.items)) return `${parsed.items.length} items`
    } catch { /* not JSON */ }
    return 'Done'
  }
  return 'Done'
}

export function AgentTestChat({ agentConfig, agentId }: AgentTestChatProps) {
  const { data: profile } = useProfile()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [streamingReasoning, setStreamingReasoning] = useState('')
  const [toolCalls, setToolCalls] = useState<ToolCallEntry[]>([])
  const [error, setError] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [showReasoning, setShowReasoning] = useState(false)
  const [reasoningOverride, setReasoningOverride] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [useKnowledge, setUseKnowledge] = useState(true)
  const [useTools, setUseTools] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const streamingEndRef = useRef<HTMLDivElement | null>(null)
  const configRef = useRef(agentConfig)
  const queryClient = useQueryClient()
  const { data: plan } = usePlan()

  // Web-search / tool execution is a Pro+ feature. Free plans can't use it.
  const toolsAllowed = !!plan && plan.name !== 'free'
  const agentHasTools = !!(agentConfig.tools && agentConfig.tools.length > 0)

  const {
    data: convsPages,
    isLoading: convsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['conversations', agentId],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const res = await conversationsApi.listByAgent(agentId!, { limit: 20, cursor: pageParam })
      return res.data as { data: Record<string, unknown>[]; nextCursor: string | null }
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!agentId,
  })

  const convsData = useMemo(() => convsPages?.pages.flatMap((p) => p.data) ?? [], [convsPages])

  const { data: convDetail } = useQuery({
    queryKey: ['conversation', activeConvId],
    queryFn: async () => {
      const res = await conversationsApi.get(activeConvId!)
      return res.data.data as Record<string, unknown>
    },
    enabled: !!activeConvId,
  })

  const createConv = useMutation({
    mutationFn: () => conversationsApi.create(agentId!, { channel: 'api' }),
    onMutate: async () => {
      const tempConv: Conversation = {
        id: `temp-${crypto.randomUUID()}`,
        title: 'Conversation',
        preview: 'Start a new chat...',
        timestamp: 'Just now',
        messages: [],
      }
      setConversations((prev) => [tempConv, ...prev])
      setActiveConvId(tempConv.id)
      return tempConv
    },
    onSuccess: (res, _vars, tempConv) => {
      if (!tempConv) return
      const realConv = res.data.data as Record<string, unknown>
      setConversations((prev) =>
        prev.map((c) => (c.id === tempConv.id ? { ...c, id: realConv.id as string } : c))
      )
      setActiveConvId((prev) => (prev === tempConv.id ? (realConv.id as string) : prev))
      queryClient.invalidateQueries({ queryKey: ['conversations', agentId] })
    },
    onError: (_err, _vars, tempConv) => {
      if (tempConv) {
        setConversations((prev) => prev.filter((c) => c.id !== tempConv.id))
      }
    },
  })

  const deleteConv = useMutation({
    mutationFn: (id: string) => conversationsApi.delete(id),
  })

  useEffect(() => {
    configRef.current = agentConfig
  })

  const activeConversation = conversations.find((c) => c.id === activeConvId)
  const messages = useMemo(
    () => activeConversation?.messages ?? [],
    [activeConversation?.messages]
  )

  const filteredConversations = useMemo(
    () =>
      conversations.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.preview.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [conversations, searchQuery]
  )

  // Scroll to bottom helper — targets Radix ScrollArea viewport directly
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    // Prefer scrolling to the streaming bubble when it exists
    const target = streamingEndRef.current || messagesEndRef.current
    if (!target) return
    // Find the Radix ScrollArea viewport (the actual scrollable element)
    const viewport = target.closest('[data-radix-scroll-area-viewport]') as HTMLElement | null
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior })
    } else {
      target.scrollIntoView({ behavior, block: 'end' })
    }
  }, [])

  // Track streaming content changes for smooth scroll during generation
  useEffect(() => {
    if (streaming && streamingContent) {
      scrollToBottom('auto')
    }
  }, [streamingContent, streaming, scrollToBottom])

  // When streaming starts, jump to bottom immediately
  useEffect(() => {
    if (streaming) {
      scrollToBottom('auto')
    }
  }, [streaming, scrollToBottom])

  // When streaming ends, smooth scroll to bottom
  useEffect(() => {
    if (!streaming && messages.length > 0) {
      scrollToBottom('smooth')
    }
  }, [streaming, messages.length, scrollToBottom])

  // When conversation changes (switch conv), scroll to bottom
  useEffect(() => {
    scrollToBottom('auto')
  }, [activeConvId, scrollToBottom])

  useEffect(() => {
    if (!streaming) {
      textareaRef.current?.focus()
    }
  }, [streaming])

  // Auto-resize textarea when input changes (including clear after send)
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`
  }, [inputValue])

  const initDone = useRef(false)
  useEffect(() => {
    if (initDone.current) return
    if (convsLoading) return
    initDone.current = true

    if (!convsData.length) {
      createConv.mutate()
      return
    }

    const mapped = convsData.map(mapDbConv)
    setConversations(mapped)
    setActiveConvId(mapped[0].id)
    textareaRef.current?.focus()
  }, [convsData, convsLoading])

  useEffect(() => {
    if (!convDetail) return
    const msgs = ((convDetail as Record<string, unknown>)?.messages || []) as Record<string, unknown>[]
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConvId ? { ...c, messages: msgs.map(mapDbMsg) } : c))
    )
  }, [convDetail, activeConvId])

  const updateActiveConversation = useCallback(
    (updater: (conv: Conversation) => Conversation) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConvId ? updater(c) : c))
      )
    },
    [activeConvId]
  )

  const contentRef = useRef('')
  const reasoningRef = useRef('')

  // Core streaming routine shared by send / regenerate / edit.
  // `prompt` is the current user turn; `history` is everything before it.
  const streamAssistant = useCallback(async (
    prompt: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
  ) => {
    const cfg = configRef.current
    if (!cfg.systemPrompt || !cfg.model) return

    setError('')
    setStreaming(true)
    setStreamingContent('')
    setStreamingReasoning('')
    setToolCalls([])
    contentRef.current = ''
    reasoningRef.current = ''

    // Force scroll to bottom immediately so the streaming bubble is visible
    requestAnimationFrame(() => scrollToBottom('auto'))

    const convId = activeConvId
    const controller = new AbortController()
    abortRef.current = controller
    const streamStartTime = Date.now()

    try {
      const response = await agentsApi.testStream({
        model: cfg.model,
        systemPrompt: cfg.systemPrompt,
        message: prompt,
        temperature: cfg.temperature,
        maxTokens: cfg.maxTokens,
        reasoningEffort: reasoningOverride || cfg.reasoningEffort,
        providerKeyId: cfg.providerKeyId,
        knowledgeBaseId: useKnowledge ? cfg.knowledgeBaseId : null,
        tools: useTools && toolsAllowed ? cfg.tools : [],
        mcpServerIds: cfg.mcpServerIds,
        history,
        signal: controller.signal,
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || `Request failed (${response.status})`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''
      let finalUsage: { promptTokens: number; completionTokens: number; totalTokens: number } | undefined
      const completedToolCalls: string[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'reasoning') {
                reasoningRef.current += parsed.content
                setStreamingReasoning(reasoningRef.current)
              } else if (parsed.type === 'text' && parsed.content) {
                contentRef.current += parsed.content
                setStreamingContent(contentRef.current)
              } else if (parsed.type === 'tool_call') {
                setToolCalls(prev => [...prev, { tool: parsed.tool, args: parsed.args, status: 'calling' }])
              } else if (parsed.type === 'tool_result') {
                completedToolCalls.push(parsed.tool)
                setToolCalls(prev => prev.map(tc =>
                  tc.tool === parsed.tool && tc.status === 'calling'
                    ? { ...tc, result: parsed.result, status: 'done' as const }
                    : tc
                ))
              }
              if (parsed.type === 'usage' && parsed.usage) {
                finalUsage = parsed.usage
              }
              if (parsed.error) {
                throw new Error(parsed.error)
              }
            } catch (e) {
              if (e instanceof Error && e.message !== 'No response body') throw e
            }
          }
        }
      }

      setStreamingContent('')
      setToolCalls([])

      const finalContent = contentRef.current
      const finalReasoning = reasoningRef.current

      // Hide streaming bubble BEFORE adding message to avoid duplicate rendering
      setStreaming(false)

      if (finalContent || completedToolCalls.length > 0) {
        const assistantMessage: MessageItem = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: finalContent || 'I used the available tools to look that up.',
          reasoning: finalReasoning || undefined,
          usage: finalUsage,
          createdAt: new Date().toISOString(),
        }
        updateActiveConversation((conv) => ({
          ...conv,
          messages: [...conv.messages, assistantMessage],
        }))

        if (convId && !convId.startsWith('temp-')) {
          try {
            await messagesApi.send(convId, finalContent || 'I used the available tools to look that up.', 'assistant', {
              ...(finalUsage ? { inputTokens: finalUsage.promptTokens, outputTokens: finalUsage.completionTokens } : {}),
              responseTimeMs: Date.now() - streamStartTime,
            })
          } catch { /* non-blocking */ }
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(msg)
    } finally {
      setStreaming(false)
      setStreamingContent('')
      setToolCalls([])
      abortRef.current = null
    }
  }, [updateActiveConversation, reasoningOverride, activeConvId, useKnowledge, useTools, toolsAllowed])

  const handleSendMessage = useCallback(async () => {
    const trimmed = inputValue.trim()
    if (!trimmed || streaming) return
    const cfg = configRef.current
    if (!cfg.systemPrompt || !cfg.model) return

    setInputValue('')

    const userMessage: MessageItem = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    }

    const history = messages.map((m) => ({ role: m.role, content: m.content }))

    updateActiveConversation((conv) => ({
      ...conv,
      messages: [...conv.messages, userMessage],
      preview: trimmed,
      timestamp: 'Just now',
    }))

    // Set streaming true BEFORE any async work so the bubble renders immediately
    setStreaming(true)
    setStreamingContent('')
    setStreamingReasoning('')
    setToolCalls([])
    contentRef.current = ''
    reasoningRef.current = ''

    // Scroll to bottom immediately — twice for safety (sync + frame)
    scrollToBottom('auto')
    requestAnimationFrame(() => scrollToBottom('auto'))

    if (activeConvId && !activeConvId.startsWith('temp-')) {
      try {
        await messagesApi.send(activeConvId, trimmed, 'user')
      } catch { /* non-blocking */ }
    }

    await streamAssistant(trimmed, history)
  }, [inputValue, streaming, messages, updateActiveConversation, activeConvId, streamAssistant, scrollToBottom])

  // Re-run the last user turn, replacing the last assistant reply.
  const handleRegenerate = useCallback(async () => {
    if (streaming) return
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === 'user')
    if (lastUserIdx === -1) return
    const idx = messages.length - 1 - lastUserIdx
    const prompt = messages[idx].content
    const history = messages.slice(0, idx).map((m) => ({ role: m.role, content: m.content }))

    // Drop everything after (and including) the assistant reply that followed.
    updateActiveConversation((conv) => ({
      ...conv,
      messages: conv.messages.slice(0, idx + 1),
    }))

    await streamAssistant(prompt, history)
  }, [streaming, messages, updateActiveConversation, streamAssistant])

  // Edit a past user message: truncate the conversation after it and resend.
  const handleEditResend = useCallback(async (messageId: string, newContent: string) => {
    if (streaming) return
    const trimmed = newContent.trim()
    if (!trimmed) return
    const idx = messages.findIndex((m) => m.id === messageId)
    if (idx === -1) return

    const history = messages.slice(0, idx).map((m) => ({ role: m.role, content: m.content }))
    const editedMessage: MessageItem = { ...messages[idx], content: trimmed }

    updateActiveConversation((conv) => ({
      ...conv,
      messages: [...conv.messages.slice(0, idx), editedMessage],
      preview: trimmed,
      timestamp: 'Just now',
    }))

    if (activeConvId && !activeConvId.startsWith('temp-')) {
      try {
        await messagesApi.send(activeConvId, trimmed, 'user')
      } catch { /* non-blocking */ }
    }

    setEditingId(null)
    await streamAssistant(trimmed, history)
  }, [streaming, messages, updateActiveConversation, activeConvId, streamAssistant])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleNewConversation = useCallback(() => {
    createConv.mutate()
    setError('')
  }, [createConv])

  const handleClearConversations = useCallback(() => {
    if (abortRef.current) abortRef.current.abort()
    initDone.current = false
    setStreaming(false)
    setStreamingContent('')
    setStreamingReasoning('')
    setToolCalls([])
    setError('')
    setConversations([])

    for (const conv of conversations) {
      deleteConv.mutate(conv.id)
    }

    createConv.mutate()
  }, [conversations, createConv, deleteConv])

  const handleResetChat = useCallback(() => {
    if (abortRef.current) abortRef.current.abort()
    updateActiveConversation((conv) => ({
      ...conv,
      messages: [],
      preview: 'Start a new chat...',
      timestamp: 'Just now',
    }))
    setStreaming(false)
    setStreamingContent('')
    setStreamingReasoning('')
    setToolCalls([])
    setError('')
  }, [updateActiveConversation])

  const handleCopy = useCallback(async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
    } catch { /* ignore */ }
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1600)
  }, [])

  const canSend = !!(agentConfig.systemPrompt && agentConfig.model && !convsLoading && activeConvId)

  const reasoningOptions = useMemo(
    () => getReasoningEfforts({ id: agentConfig.model || '' }),
    [agentConfig.model]
  )

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 shrink-0 border-b border-border/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Open conversations"
            >
              <PanelLeftOpen className="size-4" />
            </button>
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
              {agentConfig.avatar ? (
                <img src={agentConfig.avatar} alt="" className="size-full object-cover" />
              ) : (
                <Bot className="size-3.5 text-primary" />
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{agentConfig.name}</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewConversation}
              className="text-muted-foreground hover:text-foreground text-xs h-7 px-2 gap-1.5"
            >
              <SquarePen className="size-3.5" />
            </Button>
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground text-xs h-7 px-2 gap-1.5"
                  />
                }
              >
                <Settings2 className="size-3" />
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Settings2 className="size-4 text-primary" />
                    <h4 className="text-sm font-semibold">Test settings</h4>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium">Show reasoning</p>
                      <p className="text-[11px] text-muted-foreground">
                        Display model reasoning live
                      </p>
                    </div>
                    <Switch
                      size="sm"
                      checked={showReasoning}
                      onCheckedChange={setShowReasoning}
                    />
                  </div>
                  {agentConfig.knowledgeBaseId && (
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium">Knowledge base</p>
                        <p className="text-[11px] text-muted-foreground">
                          Use retrieved context (RAG)
                        </p>
                      </div>
                      <Switch
                        size="sm"
                        checked={useKnowledge}
                        onCheckedChange={setUseKnowledge}
                      />
                    </div>
                  )}
                  {agentHasTools && (
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-medium">Tools</p>
                          {!toolsAllowed && (
                            <span className="inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                              Pro
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {toolsAllowed
                            ? 'Web search, calculator, and more'
                            : 'Upgrade to Pro to enable tools'}
                        </p>
                      </div>
                      <Switch
                        size="sm"
                        checked={useTools && toolsAllowed}
                        disabled={!toolsAllowed}
                        onCheckedChange={setUseTools}
                      />
                    </div>
                  )}
                  {reasoningOptions && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Reasoning effort</Label>
                      <Select value={reasoningOverride} onValueChange={(v) => setReasoningOverride(v)}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Agent default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Agent default</SelectItem>
                          {reasoningOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetChat}
              className="text-muted-foreground hover:text-foreground text-xs h-7 px-2 gap-1.5"
            >
              <RotateCcw className="size-3" />
            </Button>
          </div>
        </div>

        {/* Messages — fills remaining space, scrollable */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex flex-col min-h-full px-4 py-4">
            <div className="flex-1" />
            {convsLoading && (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            )}
            {!convsLoading && messages.length === 0 && !streaming && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 mb-3">
                  <Bot className="size-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Send a message to test {agentConfig.name}
                </p>
              </div>
            )}

            {messages.map((msg, msgIndex) => {
              const isUser = msg.role === 'user'
              const isCopied = copiedId === msg.id
              const isEditing = editingId === msg.id
              const isLast = msgIndex === messages.length - 1
              return (
                <Message key={msg.id} align={isUser ? 'end' : 'start'}>
                  <MessageAvatar>
                    <div
                      className={cn(
                        'flex size-8 items-center justify-center rounded-full overflow-hidden',
                        isUser
                          ? 'bg-muted'
                          : 'bg-primary/10'
                      )}
                    >
                      {isUser ? (
                        profile?.avatar ? (
                          <img src={profile.avatar} alt="" className="size-full object-cover" />
                        ) : (
                          <User className="size-4 text-muted-foreground" />
                        )
                      ) : agentConfig.avatar ? (
                        <img src={agentConfig.avatar} alt="" className="size-full object-cover" />
                      ) : (
                        <Bot className="size-4 text-primary" />
                      )}
                    </div>
                  </MessageAvatar>
                  <MessageContent>
                    <Bubble variant={isUser ? 'default' : 'muted'}>
                      {!isUser && showReasoning && msg.reasoning && (
                        <details className="px-3 pt-2 pb-1 text-xs text-muted-foreground border-b border-border/40 mb-2">
                          <summary className="cursor-pointer select-none font-medium text-foreground/60 hover:text-foreground transition-colors">
                            Show reasoning
                          </summary>
                          <div className="mt-1.5 max-h-96 overflow-y-auto whitespace-pre-wrap text-muted-foreground/80 leading-relaxed">
                             {msg.reasoning}
                           </div>
                        </details>
                      )}
                      <BubbleContent>
                        {isUser ? (
                          isEditing ? (
                            <div className="space-y-2">
                              <textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleEditResend(msg.id, editValue)
                                  } else if (e.key === 'Escape') {
                                    setEditingId(null)
                                  }
                                }}
                                rows={2}
                                autoFocus
                                className="block w-full resize-none rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                                style={{ fieldSizing: 'content' } as React.CSSProperties}
                              />
                              <div className="flex items-center justify-end gap-1.5">
                                <Button variant="ghost" size="xs" onClick={() => setEditingId(null)}>
                                  Cancel
                                </Button>
                                <Button
                                  size="xs"
                                  onClick={() => handleEditResend(msg.id, editValue)}
                                  disabled={!editValue.trim() || streaming}
                                >
                                  Send
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <span className="whitespace-pre-wrap">{msg.content}</span>
                          )
                        ) : (
                          <AiResponse content={msg.content} showActions={false} />
                        )}
                      </BubbleContent>
                    </Bubble>
                    {!isEditing && (
                      <MessageFooter className="gap-2">
                        <span>{formatTime(msg.createdAt)}</span>
                        {!isUser && msg.usage && (
                          <span className="text-muted-foreground/60 text-[11px]" title={`Prompt: ${msg.usage.promptTokens}, Completion: ${msg.usage.completionTokens}`}>
                            {formatTokenCount(msg.usage.totalTokens)} tokens
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label={isCopied ? 'Copied' : isUser ? 'Copy message' : 'Copy response'}
                        >
                          <span className="relative flex size-3.5 items-center justify-center">
                            <Copy
                              className={cn(
                                'absolute size-3.5 transition-all duration-200 ease-out',
                                isCopied ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
                              )}
                            />
                            <Check
                              className={cn(
                                'absolute size-3.5 text-success transition-all duration-200 ease-out',
                                isCopied ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                              )}
                            />
                          </span>
                        </button>
                        {isUser && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditValue(msg.content)
                              setEditingId(msg.id)
                            }}
                            disabled={streaming}
                            className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                            aria-label="Edit message"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                        )}
                        {!isUser && isLast && (
                          <button
                            type="button"
                            onClick={handleRegenerate}
                            disabled={streaming}
                            className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                            aria-label="Regenerate response"
                          >
                            <RefreshCw className="size-3.5" />
                          </button>
                        )}
                      </MessageFooter>
                    )}
                  </MessageContent>
                </Message>
              )
            })}

            {streaming && (
              <div ref={(el) => { if (el) streamingEndRef.current = el }}>
              <Message align="start">
                <MessageAvatar>
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                    {agentConfig.avatar ? (
                      <img src={agentConfig.avatar} alt="" className="size-full object-cover" />
                    ) : (
                      <Bot className="size-4 text-primary" />
                    )}
                  </div>
                </MessageAvatar>
                <MessageContent>
                  <Bubble variant="muted">
                    {showReasoning && streamingReasoning && (
                      <details className="px-3 pt-2 pb-1 text-xs text-muted-foreground border-b border-border/40 mb-2" open>
                        <summary className="flex cursor-pointer select-none items-center gap-1.5 font-medium text-foreground/60 hover:text-foreground transition-colors">
                          <Loader2 className="size-3 animate-spin" />
                          Reasoning…
                        </summary>
                         <div className="mt-1.5 max-h-96 overflow-y-auto whitespace-pre-wrap text-muted-foreground/80 leading-relaxed">
                           {streamingReasoning}
                         </div>
                      </details>
                    )}
                    {toolCalls.length > 0 && (
                      <div className="px-3 py-2 space-y-1.5 border-b border-border/40">
                        {toolCalls.map((tc, i) => {
                          const Icon = toolIcons[tc.tool] || Plug
                          const isDone = tc.status === 'done'
                          return (
                            <div
                              key={`${tc.tool}-${i}`}
                              className="flex items-center gap-2 text-xs"
                            >
                              {isDone ? (
                                <Check className="size-3 text-success shrink-0" />
                              ) : (
                                <Loader2 className="size-3 animate-spin shrink-0" />
                              )}
                              <Icon className="size-3 text-muted-foreground shrink-0" />
                              <span className="text-muted-foreground">
                                {tc.tool.replace(/-/g, ' ')}
                              </span>
                              {isDone && tc.result && (
                                <span className="text-[11px] text-muted-foreground/60 truncate max-w-[200px]">
                                  {renderToolResultPreview(tc.tool, tc.result)}
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                    <BubbleContent>
                      {streamingContent ? (
                        <AiResponse content={streamingContent} isStreaming showActions={false} />
                      ) : showReasoning && streamingReasoning ? (
                        <TypingIndicator />
                      ) : (
                        <TypingIndicator />
                      )}
                    </BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        </div>

        {/* Composer — sticky at bottom, centered */}
        <div className="shrink-0 border-t border-border/40 bg-card">
          <div className="px-4 py-3">
            <div className="rounded-xl border border-border bg-card transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`
                }}
                onKeyDown={handleKeyDown}
                placeholder={canSend ? 'Message the agent…' : 'Configure agent to start'}
                disabled={streaming || !canSend}
                rows={1}
                className={cn(
                  'block w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 text-foreground outline-none',
                  'placeholder:text-muted-foreground/50 disabled:cursor-not-allowed disabled:opacity-50',
                  'min-h-[38px] max-h-[140px]'
                )}
              />
              <div className="flex items-center justify-between gap-2 px-2.5 pb-2">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="inline-flex min-w-0 items-center gap-1 rounded-md bg-muted/70 px-2 py-0.5 text-[11px] font-medium text-foreground/80">
                    <Bot className="size-3 shrink-0 text-primary/70" />
                    <span className="truncate">{formatModelLabel(agentConfig.model)}</span>
                  </span>
                  {agentConfig.knowledgeBaseId && (
                    <span
                      className={cn(
                        'hidden items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] sm:inline-flex',
                        useKnowledge
                          ? 'border-success/20 bg-success/10 text-success'
                          : 'border-border bg-muted/40 text-muted-foreground'
                      )}
                    >
                      {useKnowledge ? 'Knowledge: On' : 'Knowledge: Off'}
                    </span>
                  )}
                  {agentHasTools && (
                    <span
                      className={cn(
                        'hidden items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] sm:inline-flex',
                        useTools && toolsAllowed
                          ? 'border-success/20 bg-success/10 text-success'
                          : 'border-border bg-muted/40 text-muted-foreground'
                      )}
                    >
                      {toolsAllowed ? (useTools ? 'Tools: On' : 'Tools: Off') : 'Tools: Pro'}
                    </span>
                  )}
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || streaming || !canSend}
                  size="icon-xs"
                  className="shrink-0 rounded-lg"
                  aria-label="Send message"
                >
                  {streaming ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Send className="size-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar overlay — slides in from left */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Panel */}
          <div className="relative flex flex-col w-72 h-full bg-card border-r border-border/50 shadow-xl animate-in slide-in-from-left duration-200">
            <div className="p-4 pb-2">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-muted-foreground">
                  Conversations
                </span>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => { handleNewConversation(); setSidebarOpen(false) }}
                  className="text-primary hover:text-primary/80 h-6 px-1.5 text-xs gap-1"
                >
                  <Plus className="size-3" />
                  New
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-sm rounded-lg border-0 bg-muted/50 placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring/50 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-2">
              <div className="space-y-0.5 py-1">
                {convsLoading ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <MessageSquare className="size-7 mb-2 opacity-30" />
                    <p className="text-xs">No conversations</p>
                  </div>
                ) : (
                  <>
                    {filteredConversations.map((conv) => (
                      <ConversationItem
                        key={conv.id}
                        conversation={conv}
                        isActive={conv.id === activeConvId}
                        onClick={() => { setActiveConvId(conv.id); setSidebarOpen(false) }}
                      />
                    ))}
                    {hasNextPage && (
                      <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="w-full text-center py-2 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                      >
                        {isFetchingNextPage ? (
                          <Loader2 className="size-3 animate-spin mx-auto" />
                        ) : (
                          'Load more'
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="p-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                onClick={() => { handleClearConversations(); setSidebarOpen(false) }}
              >
                <Trash2 className="size-3.5 mr-1.5" />
                Clear Conversations
              </Button>
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  )
}

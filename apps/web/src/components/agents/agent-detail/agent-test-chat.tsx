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
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
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
  toolActivity?: ToolCallEntry[]
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
        'w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150',
        isActive
          ? 'bg-primary/10 shadow-sm'
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
    .replace(/ free$/i, "")
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
  const autoCreated = useRef(false)

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

  const { data: convDetail, isLoading: convDetailLoading } = useQuery({
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

  const serverConvs = useMemo(() => convsData.map(mapDbConv), [convsData])

  // Auto-create conversation on first load
  useEffect(() => {
    if (!convsLoading && !autoCreated.current && !activeConvId && agentConfig.systemPrompt && agentConfig.model) {
      autoCreated.current = true
      createConv.mutate()
    }
  }, [convsLoading, activeConvId, agentConfig.systemPrompt, agentConfig.model, createConv])

  // Focus input when a conversation becomes active
  useEffect(() => {
    if (activeConvId && !streaming) {
      textareaRef.current?.focus()
    }
  }, [activeConvId, streaming])

  const allConvs = useMemo(() => {
    const server = [...serverConvs]
    for (const local of conversations) {
      const idx = server.findIndex(s => s.id === local.id)
      if (idx >= 0) {
        server[idx] = local
      } else {
        server.push(local)
      }
    }
    return server
  }, [serverConvs, conversations])

  const activeConversation = allConvs.find((c) => c.id === activeConvId)

  const messages = useMemo(() => {
    if (activeConversation?.messages && activeConversation.messages.length > 0) {
      return activeConversation.messages
    }
    if (!convDetail) return []
    const msgs = ((convDetail as Record<string, unknown>)?.messages || []) as Record<string, unknown>[]
    return msgs.map(mapDbMsg)
  }, [activeConversation?.messages?.length, activeConversation?.messages, convDetail])

  const filteredConversations = useMemo(
    () =>
      allConvs.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.preview.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [allConvs, searchQuery]
  )

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const target = streamingEndRef.current || messagesEndRef.current
    if (!target) return
    const viewport = target.closest('[data-radix-scroll-area-viewport]') as HTMLElement | null
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior })
    } else {
      target.scrollIntoView({ behavior, block: 'end' })
    }
  }, [])

  useEffect(() => {
    if (streaming && streamingContent) {
      scrollToBottom('auto')
    }
  }, [streamingContent, streaming, scrollToBottom])

  useEffect(() => {
    if (streaming) {
      scrollToBottom('auto')
    }
  }, [streaming, scrollToBottom])

  useEffect(() => {
    if (!streaming && messages.length > 0) {
      scrollToBottom('smooth')
    }
  }, [streaming, messages.length, scrollToBottom])

  useEffect(() => {
    scrollToBottom('auto')
  }, [activeConvId, scrollToBottom])

  useEffect(() => {
    if (!streaming) {
      textareaRef.current?.focus()
    }
  }, [streaming])

  const updateActiveConversation = useCallback(
    (updater: (conv: Conversation) => Conversation) => {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === activeConvId)
        if (idx >= 0) {
          return prev.map((c) => (c.id === activeConvId ? updater(c) : c))
        }
        const serverConv = allConvs.find((c) => c.id === activeConvId)
        if (serverConv) {
          return [...prev, updater(serverConv)]
        }
        return prev
      })
    },
    [activeConvId, allConvs]
  )

  const contentRef = useRef('')
  const reasoningRef = useRef('')

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
      setStreamingReasoning('')

      const finalContent = contentRef.current
      const finalReasoning = reasoningRef.current

      setStreaming(false)

      if (finalContent || completedToolCalls.length > 0) {
        const assistantMessage: MessageItem = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: finalContent || 'I used the available tools to look that up.',
          reasoning: finalReasoning || undefined,
          usage: finalUsage,
          toolActivity: completedToolCalls.length > 0 ? [...toolCalls] : undefined,
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

    setStreaming(true)
    setStreamingContent('')
    setStreamingReasoning('')
    setToolCalls([])
    contentRef.current = ''
    reasoningRef.current = ''

    scrollToBottom('auto')
    requestAnimationFrame(() => scrollToBottom('auto'))

    if (activeConvId && !activeConvId.startsWith('temp-')) {
      try {
        await messagesApi.send(activeConvId, trimmed, 'user')
      } catch { /* non-blocking */ }
    }

    await streamAssistant(trimmed, history)
  }, [inputValue, streaming, messages, updateActiveConversation, activeConvId, streamAssistant, scrollToBottom])

  const handleRegenerate = useCallback(async () => {
    if (streaming) return
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === 'user')
    if (lastUserIdx === -1) return
    const idx = messages.length - 1 - lastUserIdx
    const prompt = messages[idx].content
    const history = messages.slice(0, idx).map((m) => ({ role: m.role, content: m.content }))

    updateActiveConversation((conv) => ({
      ...conv,
      messages: conv.messages.slice(0, idx + 1),
    }))

    await streamAssistant(prompt, history)
  }, [streaming, messages, updateActiveConversation, streamAssistant])

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
    setStreaming(false)
    setStreamingContent('')
    setStreamingReasoning('')
    setToolCalls([])
    setError('')
    setConversations([])

    for (const conv of allConvs) {
      if (!conv.id.startsWith('temp-')) {
        deleteConv.mutate(conv.id)
      }
    }
  }, [allConvs, deleteConv])

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
      <div className="flex flex-col flex-1 min-h-0 bg-card overflow-hidden">
        {/* Sticky Header */}
        <div className="shrink-0 border-b border-border/40">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    />
                  }
                >
                  <PanelLeftOpen className="size-4" />
                </TooltipTrigger>
                <TooltipContent>Conversations</TooltipContent>
              </Tooltip>
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
                {agentConfig.avatar ? (
                  <img src={agentConfig.avatar} alt="" className="size-full object-cover" />
                ) : (
                  <Bot className="size-3.5 text-primary" />
                )}
              </div>
              <span className="text-sm font-semibold text-foreground">{agentConfig.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNewConversation}
                      className="text-muted-foreground hover:text-foreground text-xs h-7 px-2 gap-1.5"
                    />
                  }
                >
                  <SquarePen className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent>New chat</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetChat}
                      className="text-muted-foreground hover:text-foreground text-xs h-7 px-2 gap-1.5"
                    />
                  }
                >
                  <RotateCcw className="size-3" />
                </TooltipTrigger>
                <TooltipContent>Reset chat</TooltipContent>
              </Tooltip>
              <Popover>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <PopoverTrigger
                        className="inline-flex items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground size-8"
                      />
                    }
                  >
                    <Settings2 className="size-3.5" />
                  </TooltipTrigger>
                  <TooltipContent>Settings</TooltipContent>
                </Tooltip>
                <PopoverContent align="end" sideOffset={8} className="w-96 p-0">
                  <div className="p-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <Settings2 className="size-4 text-primary" />
                      <h4 className="text-sm font-semibold">Test Settings</h4>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Show reasoning</Label>
                        <p className="text-xs text-muted-foreground">
                          Display model's reasoning process in real-time
                        </p>
                      </div>
                      <Switch
                        checked={showReasoning}
                        onCheckedChange={setShowReasoning}
                      />
                    </div>
                    {reasoningOptions && (
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">Reasoning effort</Label>
                          <p className="text-xs text-muted-foreground">
                            Control how much reasoning the model performs
                          </p>
                        </div>
                        <Select value={reasoningOverride} onValueChange={(v) => setReasoningOverride(v)}>
                          <SelectTrigger className="h-9 w-auto min-w-[120px]">
                            <SelectValue placeholder="Default" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Default</SelectItem>
                            {reasoningOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {agentConfig.knowledgeBaseId && (
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">Knowledge base</Label>
                          <p className="text-xs text-muted-foreground">
                            Use retrieved context (RAG)
                          </p>
                        </div>
                        <Switch
                          checked={useKnowledge}
                          onCheckedChange={setUseKnowledge}
                        />
                      </div>
                    )}
                    {agentHasTools && (
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <Label className="text-sm font-medium">Tools</Label>
                            {!toolsAllowed && (
                              <span className="inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                Pro
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {toolsAllowed
                              ? 'Web search, calculator, and more'
                              : 'Upgrade to Pro to enable tools'}
                          </p>
                        </div>
                        <Switch
                          checked={useTools && toolsAllowed}
                          disabled={!toolsAllowed}
                          onCheckedChange={setUseTools}
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-border">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={handleClearConversations}
                    >
                      <Trash2 className="size-3.5 mr-1.5" />
                      Clear Conversations
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1 min-h-0">
              <div className="flex flex-col min-h-full px-4 py-4">
                <div className="flex-1" />
                {convsLoading && (
                  <div className="flex items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="size-5 animate-spin" />
                  </div>
                )}
                {!convsLoading && convDetailLoading && activeConvId && messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Loader2 className="size-8 text-primary animate-spin mb-3" />
                    <p className="text-sm text-muted-foreground">Loading conversation…</p>
                  </div>
                )}
                {!convsLoading && !convDetailLoading && messages.length === 0 && !streaming && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 mb-4 overflow-hidden">
                      {agentConfig.avatar ? (
                        <img src={agentConfig.avatar} alt="" className="size-full object-cover" />
                      ) : (
                        <Bot className="size-8 text-primary" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Test {agentConfig.name}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Send a message to start testing your agent's responses and behavior
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
                                    onChange={(e) => setEditValue(e.currentTarget.value)}
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
                        {!isUser && msg.toolActivity && msg.toolActivity.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {msg.toolActivity.map((tc, i) => {
                              const Icon = toolIcons[tc.tool] || Plug
                              return (
                                <span
                                  key={`${tc.tool}-${i}`}
                                  className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 text-[11px] text-emerald-600"
                                >
                                  <Check className="size-2.5" />
                                  <Icon className="size-2.5" />
                                  {tc.tool.replace(/-/g, ' ')}
                                </span>
                              )
                            })}
                          </div>
                        )}
                        {!isEditing && (
                          <MessageFooter className="gap-2">
                            <span>{formatTime(msg.createdAt)}</span>
                            {!isUser && msg.usage && (
                              <span className="text-muted-foreground/60 text-[11px]" title={`Total: ${msg.usage.totalTokens} tokens (Prompt: ${msg.usage.promptTokens} + Completion: ${msg.usage.completionTokens})`}>
                                {formatTokenCount(msg.usage.completionTokens)} tokens
                              </span>
                            )}
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(msg.id, msg.content)}
                                    className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                  />
                                }
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
                              </TooltipTrigger>
                              <TooltipContent>{isCopied ? 'Copied' : isUser ? 'Copy message' : 'Copy response'}</TooltipContent>
                            </Tooltip>
                            {isUser && (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditValue(msg.content)
                                        setEditingId(msg.id)
                                      }}
                                      disabled={streaming}
                                      className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                                    />
                                  }
                                >
                                  <Pencil className="size-3.5" />
                                </TooltipTrigger>
                                <TooltipContent>Edit message</TooltipContent>
                              </Tooltip>
                            )}
                            {!isUser && isLast && (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <button
                                      type="button"
                                      onClick={handleRegenerate}
                                      disabled={streaming}
                                      className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                                    />
                                  }
                                >
                                  <RefreshCw className="size-3.5" />
                                </TooltipTrigger>
                                <TooltipContent>Regenerate response</TooltipContent>
                              </Tooltip>
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
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

        {/* Sticky Composer */}
        <div className="shrink-0 border-t border-border/40 bg-card/80 backdrop-blur-xl px-4 py-3">
            <div className="max-w-3xl mx-auto">
              <div className="rounded-xl border border-border bg-muted/30 shadow-sm transition-all focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.currentTarget.value)
                    e.currentTarget.style.height = 'auto'
                    e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 140)}px`
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={canSend ? 'Message the agent…' : 'Configure agent to start'}
                  disabled={streaming || !canSend}
                  rows={1}
                  className={cn(
                    'block w-full resize-none bg-transparent px-4 py-3 text-sm leading-6 text-foreground outline-none',
                    'placeholder:text-muted-foreground/50 disabled:cursor-not-allowed disabled:opacity-50',
                    'min-h-[44px] max-h-[140px]'
                  )}
                />
                <div className="flex items-center justify-between gap-2 px-3 pb-2.5">
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
                    size="icon-sm"
                    className="shrink-0 rounded-lg"
                    aria-label="Send message"
                  >
                    {streaming ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground/50 text-center mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex flex-col w-80 h-full bg-card border-r border-border/50 shadow-xl animate-in slide-in-from-left duration-200">
            <div className="p-4 pb-3 border-b border-border/40">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-foreground">
                  Conversations
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => { handleNewConversation(); setSidebarOpen(false) }}
                    className="text-primary hover:text-primary/80 h-7 px-2 text-xs gap-1.5"
                  >
                    <Plus className="size-3.5" />
                    New
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setSidebarOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                  className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-border bg-muted/30 placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring/50 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2">
              <div className="space-y-1">
                {convsLoading ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <MessageSquare className="size-8 mb-3 opacity-30" />
                    <p className="text-sm font-medium">No conversations</p>
                    <p className="text-xs mt-1">Start a new chat to begin</p>
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
                        className="w-full text-center py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
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

            <div className="p-3 border-t border-border/40">
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

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
} from 'lucide-react'
import { toast } from '@/lib/toast'
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
import { cn } from '@/lib/utils'
import { TypingIndicator } from '@/components/shared/typing-indicator'
import { AiResponse } from '@/components/shared/ai-response'
import { agents as agentsApi, conversations as conversationsApi, messages as messagesApi } from '@/lib/api'
import { getReasoningEfforts } from '../reasoning'

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

export function AgentTestChat({ agentConfig, agentId }: AgentTestChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [streamingReasoning, setStreamingReasoning] = useState('')
  const [error, setError] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [showReasoning, setShowReasoning] = useState(true)
  const [reasoningOverride, setReasoningOverride] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const configRef = useRef(agentConfig)
  const streamFrameRef = useRef<number | null>(null)
  const streamBufferRef = useRef('')
  const queryClient = useQueryClient()

  const { data: convsData, isLoading: convsLoading } = useQuery({
    queryKey: ['conversations', agentId],
    queryFn: async () => {
      const res = await conversationsApi.listByAgent(agentId!, { limit: 50 })
      return (res.data.data || []) as Record<string, unknown>[]
    },
    enabled: !!agentId,
  })

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
    onSuccess: (res) => {
      const newConv = res.data.data as Record<string, unknown>
      const mapped = mapDbConv(newConv)
      setConversations((prev) => [mapped, ...prev])
      setActiveConvId(mapped.id)
      queryClient.invalidateQueries({ queryKey: ['conversations', agentId] })
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: streaming ? 'auto' : 'smooth' })
  }, [messages, streaming, streamingContent])

  useEffect(() => {
    if (!streaming) {
      textareaRef.current?.focus()
    }
  }, [streaming])

  const initRef = useRef<string | null>(null)
  useEffect(() => {
    if (!convsData) return
    if (initRef.current === agentId) return
    initRef.current = agentId

    if (convsData.length === 0) {
      createConv.mutate()
    } else {
      const mapped = convsData.map(mapDbConv)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConversations(mapped)
      setActiveConvId(mapped[0].id)
    }

    textareaRef.current?.focus()

    return () => {
      if (initRef.current === agentId) initRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convsData])

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

  const queueStreamingContent = useCallback((content: string) => {
    streamBufferRef.current = content
    if (streamFrameRef.current) return

    streamFrameRef.current = requestAnimationFrame(() => {
      setStreamingContent(streamBufferRef.current)
      streamFrameRef.current = null
    })
  }, [])

  const handleSendMessage = useCallback(async () => {
    const trimmed = inputValue.trim()
    if (!trimmed || streaming) return
    const cfg = configRef.current
    if (!cfg.systemPrompt || !cfg.model) return

    setError('')
    setInputValue('')
    setStreaming(true)
    setStreamingContent('')
    setStreamingReasoning('')
    streamBufferRef.current = ''

    const userMessage: MessageItem = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    }

    updateActiveConversation((conv) => ({
      ...conv,
      messages: [...conv.messages, userMessage],
      preview: trimmed,
      timestamp: 'Just now',
    }))

    const convId = activeConvId
    if (convId) {
      try {
        await messagesApi.send(convId, trimmed, 'user')
      } catch { /* non-blocking */ }
    }

    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await agentsApi.testStream({
        model: cfg.model,
        systemPrompt: cfg.systemPrompt,
        message: trimmed,
        temperature: cfg.temperature,
        maxTokens: cfg.maxTokens,
        reasoningEffort: reasoningOverride || cfg.reasoningEffort,
        providerKeyId: cfg.providerKeyId,
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
      let assistantContent = ''
      let assistantReasoning = ''
      let finalUsage: { promptTokens: number; completionTokens: number; totalTokens: number } | undefined

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
                assistantReasoning += parsed.content
                setStreamingReasoning(assistantReasoning)
                queueStreamingContent(assistantContent)
              } else if (parsed.content) {
                assistantContent += parsed.content
                queueStreamingContent(assistantContent)
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

      if (assistantContent) {
        const assistantMessage: MessageItem = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: assistantContent,
          reasoning: assistantReasoning || undefined,
          usage: finalUsage,
          createdAt: new Date().toISOString(),
        }
        updateActiveConversation((conv) => ({
          ...conv,
          messages: [...conv.messages, assistantMessage],
        }))

        if (convId) {
          try {
            await messagesApi.send(convId, assistantContent, 'assistant')
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
      abortRef.current = null
    }
  }, [inputValue, streaming, messages, queueStreamingContent, updateActiveConversation, reasoningOverride, activeConvId])

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
    setError('')

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
      <div className="flex h-[calc(100dvh-14rem)] -mx-6 bg-card overflow-hidden">
        {/* Sidebar */}
        <div className="flex flex-col w-64 shrink-0 border-r border-border/50 bg-card overflow-hidden">
          <div className="p-4 pb-2">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-muted-foreground">
                Conversations
              </span>
              <Button
                variant="ghost"
                size="xs"
                onClick={handleNewConversation}
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
                filteredConversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === activeConvId}
                    onClick={() => setActiveConvId(conv.id)}
                  />
                ))
              )}
            </div>
          </div>

          <div className="p-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
              onClick={handleClearConversations}
            >
              <Trash2 className="size-3.5 mr-1.5" />
              Clear Conversations
            </Button>
          </div>
        </div>

        {/* Chat */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="size-3.5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">
                You are chatting with{' '}
                <span className="font-semibold text-foreground">{agentConfig.name}</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
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
                  Settings
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
                    {reasoningOptions && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Reasoning effort</Label>
                        <Select value={reasoningOverride} onValueChange={setReasoningOverride}>
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
                Reset Chat
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-5 py-4 space-y-6">
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

              {messages.map((msg) => {
                const isUser = msg.role === 'user'
                const isCopied = copiedId === msg.id
                return (
                  <Message key={msg.id} align={isUser ? 'end' : 'start'}>
                    <MessageAvatar>
                      <div
                        className={cn(
                          'flex size-8 items-center justify-center rounded-full',
                          isUser
                            ? 'bg-muted'
                            : 'bg-primary/10'
                        )}
                      >
                        {isUser ? (
                          <User className="size-4 text-muted-foreground" />
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
                          {isUser ? <span className="whitespace-pre-wrap">{msg.content}</span> : <AiResponse content={msg.content} showActions={false} />}
                        </BubbleContent>
                      </Bubble>
                      <MessageFooter className="gap-2">
                        <span>{formatTime(msg.createdAt)}</span>
                        {!isUser && msg.usage && (
                          <span className="text-muted-foreground/60 text-[11px]" title={`Prompt: ${msg.usage.promptTokens}, Completion: ${msg.usage.completionTokens}`}>
                            {msg.usage.totalTokens} tokens
                          </span>
                        )}
                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label={isCopied ? 'Copied' : 'Copy response'}
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
                        )}
                      </MessageFooter>
                    </MessageContent>
                  </Message>
                )
              })}

              {streaming && (
                <Message align="start">
                  <MessageAvatar>
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="size-4 text-primary" />
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
              )}
              {error && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Composer */}
          <div className="shrink-0 px-5 pb-3 pt-2">
            <div className="rounded-xl border border-border bg-card transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={canSend ? 'Message the agent…' : 'Configure agent to start'}
                disabled={streaming || !canSend}
                rows={1}
                className={cn(
                  'block w-full resize-none bg-transparent px-3 py-1.5 text-sm leading-6 text-foreground outline-none',
                  'placeholder:text-muted-foreground/50 disabled:cursor-not-allowed disabled:opacity-50',
                  'min-h-[34px] max-h-[140px]'
                )}
                style={{ fieldSizing: 'content' } as React.CSSProperties}
              />
              <div className="flex items-center justify-between gap-2 px-2.5 pb-1.5">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="inline-flex min-w-0 items-center gap-1 rounded-md bg-muted/70 px-2 py-0.5 text-[11px] font-medium text-foreground/80">
                    <Bot className="size-3 shrink-0 text-primary/70" />
                    <span className="truncate">{formatModelLabel(agentConfig.model)}</span>
                  </span>
                  <span
                    className={cn(
                      'hidden items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] sm:inline-flex',
                      agentConfig.knowledgeBaseId
                        ? 'border-success/20 bg-success/10 text-success'
                        : 'border-border bg-muted/40 text-muted-foreground'
                    )}
                  >
                    {agentConfig.knowledgeBaseId ? 'Knowledge: On' : 'Knowledge: Off'}
                  </span>
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
    </TooltipProvider>
  )
}

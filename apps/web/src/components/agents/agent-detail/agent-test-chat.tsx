import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
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
import { cn } from '@/lib/utils'
import { TypingIndicator } from '@/components/shared/typing-indicator'
import { AiResponse } from '@/components/shared/ai-response'
import { agents as agentsApi } from '@/lib/api'

interface AgentTestChatProps {
  agentConfig: {
    name: string
    model: string
    systemPrompt: string
    temperature: number
    maxTokens: number
    reasoningEffort?: string
    providerKeyId?: string
  }
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

function newConversation(): Conversation {
  return {
    id: crypto.randomUUID(),
    title: 'New Conversation',
    preview: 'Start a new chat...',
    timestamp: 'Just now',
    messages: [],
  }
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

export function AgentTestChat({ agentConfig }: AgentTestChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([newConversation()])
  const [activeConvId, setActiveConvId] = useState(conversations[0]?.id || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [streamingReasoning, setStreamingReasoning] = useState('')
  const [error, setError] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [showReasoning, setShowReasoning] = useState(true)
  const [reasoningOverride, setReasoningOverride] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const configRef = useRef(agentConfig)
  const streamFrameRef = useRef<number | null>(null)
  const streamBufferRef = useRef('')

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

  useEffect(() => () => {
    if (streamFrameRef.current) cancelAnimationFrame(streamFrameRef.current)
  }, [])

  useEffect(() => {
    if (!streaming) {
      textareaRef.current?.focus()
    }
  }, [streaming])

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

      if (assistantContent || assistantReasoning) {
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
  }, [inputValue, streaming, messages, queueStreamingContent, updateActiveConversation, reasoningOverride])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleNewConversation = useCallback(() => {
    const conv = newConversation()
    setConversations((prev) => [conv, ...prev])
    setActiveConvId(conv.id)
    setError('')
  }, [])

  const handleClearConversations = useCallback(() => {
    if (abortRef.current) abortRef.current.abort()
    const conv = newConversation()
    setConversations([conv])
    setActiveConvId(conv.id)
    setStreaming(false)
    setStreamingContent('')
    setStreamingReasoning('')
    setError('')
  }, [])

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

  const canSend = !!(agentConfig.systemPrompt && agentConfig.model)

  const supportsReasoning = useMemo(() => {
    const m = agentConfig.model || ''
    return m.startsWith('local/') || /(reasoning|o1|o3|o4|r1|qwq|deepseek-r1)/i.test(m)
  }, [agentConfig.model])

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
              {filteredConversations.length === 0 ? (
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
                    {supportsReasoning && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Reasoning effort</Label>
                        <Select value={reasoningOverride} onValueChange={setReasoningOverride}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Agent default" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Agent default</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="xhigh">Extra High</SelectItem>
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
              {messages.length === 0 && !streaming && (
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
                            <div className="mt-1.5 whitespace-pre-wrap text-muted-foreground/80 leading-relaxed">
                              {msg.reasoning}
                            </div>
                          </details>
                        )}
                        <BubbleContent>
                          {isUser ? <span className="whitespace-pre-wrap">{msg.content}</span> : <AiResponse content={msg.content} />}
                        </BubbleContent>
                      </Bubble>
                      <MessageFooter className="gap-2">
                        <span>{formatTime(msg.createdAt)}</span>
                        {!isUser && msg.usage && (
                          <span className="text-muted-foreground/60 text-[11px]" title={`Prompt: ${msg.usage.promptTokens}, Completion: ${msg.usage.completionTokens}`}>
                            {msg.usage.totalTokens} tokens
                          </span>
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
                          <div className="mt-1.5 whitespace-pre-wrap text-muted-foreground/80 leading-relaxed">
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
          <div className="shrink-0 px-5 pb-4 pt-2">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    canSend ? 'Type your message...' : 'Configure agent to start'
                  }
                  disabled={streaming || !canSend}
                  rows={1}
                  className={cn(
                    'w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 pr-11 text-sm',
                    'placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
                    'disabled:cursor-not-allowed disabled:opacity-50 min-h-[40px] max-h-[160px] transition-colors'
                  )}
                  style={{ fieldSizing: 'content' } as React.CSSProperties}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || streaming || !canSend}
                  size="icon-sm"
                  className="absolute right-1.5 bottom-1.5 rounded-lg"
                >
                  {streaming ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-[11px] text-muted-foreground">
                Model:{' '}
                <span className="font-medium text-foreground">
                  {agentConfig.model || 'Not configured'}
                </span>
              </span>
              <span className="text-[11px] text-muted-foreground">
                Uses live agent settings and knowledge
              </span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowUp,
  Bot,
  Check,
  Clock,
  Calculator,
  ExternalLink,
  FlaskConical,
  Globe,
  Loader2,
  Plug,
  Plus,
  Settings2,
  Square,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { AiResponse } from '@/components/shared/ai-response'
import { agents as agentsApi, mcpServers as mcpApi } from '@/lib/api'
import { usePlaygroundChat } from '@/lib/hooks/use-playground-chat'
import { usePlan } from '@/lib/hooks/use-billing'
import { getReasoningEfforts } from '@/components/agents/reasoning'
import { cn, formatTokenCount } from '@/lib/utils'

interface Agent {
  id: string
  name: string
  model: string
  systemPrompt: string
  temperature: number
  maxTokens: number
  reasoningEffort?: string
  providerKeyId?: string | null
  knowledgeBaseId?: string | null
  avatar?: string | null
  widgetConfig?: { tools?: string[] }
  guardrails?: { enabled: boolean; blockedWords: string[]; restrictedTopics: string[] }
}

const toolIcons: Record<string, React.ElementType> = {
  'web-search': Globe,
  'url-fetcher': ExternalLink,
  calculator: Calculator,
  'current-time': Clock,
}

function formatModelLabel(id: string): string {
  if (!id) return 'Not configured'
  const part = id.includes('/') ? id.split('/').slice(1).join('/') : id
  return part
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/ free$/i, '')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const SUGGESTIONS = [
  { label: 'Introduce yourself', prompt: 'Introduce yourself and explain what you can help with.' },
  { label: 'Test knowledge base', prompt: 'What can you tell me from your knowledge base?' },
  { label: 'Test tools', prompt: 'What is the current time? Also calculate 128 * 742.' },
]

export default function AgentPlaygroundPage() {
  const { id } = useParams<{ id: string }>()
  const { messages, status, error, send, stop, reset } = usePlaygroundChat()

  const [inputValue, setInputValue] = useState('')
  const [showReasoning, setShowReasoning] = useState(false)
  const [reasoningOverride, setReasoningOverride] = useState('')
  const [useKnowledge, setUseKnowledge] = useState(true)
  const [useTools, setUseTools] = useState(true)

  const { data: agent } = useQuery({
    queryKey: ['agent', id],
    queryFn: async () => {
      const res = await agentsApi.get(id!)
      return (res.data.data ?? res.data) as Agent
    },
    enabled: !!id,
  })

  const { data: linkedMcpServers } = useQuery({
    queryKey: ['agent-mcp-servers', id],
    queryFn: async () => {
      const res = await mcpApi.listByAgent(id!)
      const servers = res.data.data ?? res.data ?? []
      return (Array.isArray(servers) ? servers : []) as Array<{ id: string; name: string }>
    },
    enabled: !!id,
  })

  const { data: plan } = usePlan()
  const toolsAllowed = !!plan && plan.name !== 'free'
  const agentTools = agent?.widgetConfig?.tools ?? []
  const agentHasTools = agentTools.length > 0
  const hasKb = !!agent?.knowledgeBaseId

  const reasoningOptions = useMemo(
    () => (agent ? getReasoningEfforts({ id: agent.model }) : null),
    [agent],
  )

  const isStreaming = status === 'streaming'
  const canSend = !!(agent?.systemPrompt && agent?.model)

  const handleSubmit = () => {
    const trimmed = inputValue.trim()
    if (!trimmed || !canSend) return
    setInputValue('')
    void send(trimmed, {
      model: agent!.model,
      systemPrompt: agent!.systemPrompt,
      temperature: agent!.temperature,
      maxTokens: agent!.maxTokens,
      reasoningEffort: reasoningOverride || agent!.reasoningEffort,
      providerKeyId: agent!.providerKeyId || undefined,
      knowledgeBaseId: useKnowledge ? agent!.knowledgeBaseId : null,
      tools: useTools && toolsAllowed ? agentTools : [],
      mcpServerIds: (linkedMcpServers ?? []).map((s) => s.id),
      guardrails: agent!.guardrails,
    })
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-4xl flex-1 flex-col gap-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <Button variant="ghost" size="icon-sm" render={<Link to={`/agents/${id}/edit`} />} aria-label="Back to agent">
            <ArrowLeft />
          </Button>
          <Avatar className="size-8 shrink-0">
            {agent?.avatar && <AvatarImage src={agent.avatar} alt={agent?.name} />}
            <AvatarFallback className="bg-primary/10 text-primary">
              <Bot className="size-4" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-tight">
              {agent?.name ?? 'Loading…'}
            </h1>
            <span className="text-xs text-muted-foreground">
              Playground · {formatModelLabel(agent?.model ?? '')}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {reasoningOptions && (
            <Select value={reasoningOverride} onValueChange={(v) => setReasoningOverride(v ?? '')}>
              <SelectTrigger size="sm" className="hidden w-auto min-w-[110px] sm:flex" aria-label="Reasoning effort">
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
          )}
          <Popover>
            <PopoverTrigger
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Test settings"
            >
              <Settings2 className="size-4" />
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={8} className="w-80 p-3">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Settings2 className="size-4 text-primary" />
                  <h4 className="text-sm font-semibold">Test Settings</h4>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Show reasoning</Label>
                    <p className="text-xs text-muted-foreground">Display the model's thinking process</p>
                  </div>
                  <Switch checked={showReasoning} onCheckedChange={setShowReasoning} />
                </div>
                {reasoningOptions && (
                  <div className="flex items-center justify-between gap-3 sm:hidden">
                    <Label className="text-sm font-medium">Reasoning effort</Label>
                    <Select value={reasoningOverride} onValueChange={(v) => setReasoningOverride(v ?? '')}>
                      <SelectTrigger size="sm" className="w-auto min-w-[100px]">
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
                {hasKb && (
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Knowledge base</Label>
                      <p className="text-xs text-muted-foreground">Use retrieved context (RAG)</p>
                    </div>
                    <Switch checked={useKnowledge} onCheckedChange={setUseKnowledge} />
                  </div>
                )}
                {agentHasTools && (
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Label className="text-sm font-medium">Tools</Label>
                        {!toolsAllowed && (
                          <Badge variant="secondary" className="bg-primary/10 text-[10px] text-primary">Pro</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {toolsAllowed ? 'Web search, calculator, and more' : 'Upgrade to Pro to enable tools'}
                      </p>
                    </div>
                    <Switch checked={useTools && toolsAllowed} disabled={!toolsAllowed} onCheckedChange={setUseTools} />
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={reset} disabled={messages.length === 0}>
            <Plus data-icon="inline-start" />
            <span className="hidden sm:inline">New chat</span>
          </Button>
        </div>
      </div>

      {/* Messages */}
      {messages.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-center justify-center p-6">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Test {agent?.name ?? 'agent'}</EmptyTitle>
              <EmptyDescription>
                Chat with your agent exactly like a customer would — tools, knowledge base, and guardrails all apply.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyMedia>
              <div className="flex size-14 items-center justify-center overflow-hidden rounded-2xl bg-primary/10">
                {agent?.avatar ? (
                  <img src={agent.avatar} alt="" className="size-full object-cover" />
                ) : (
                  <FlaskConical className="size-6 text-primary" />
                )}
              </div>
            </EmptyMedia>
            <EmptyContent>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <Button key={s.label} variant="outline" size="sm" disabled={!canSend} onClick={() => void send(s.prompt, {
                    model: agent?.model ?? '',
                    systemPrompt: agent?.systemPrompt ?? '',
                    temperature: agent?.temperature,
                    maxTokens: agent?.maxTokens,
                    providerKeyId: agent?.providerKeyId || undefined,
                    knowledgeBaseId: useKnowledge ? agent?.knowledgeBaseId ?? null : null,
                    tools: useTools && toolsAllowed ? agentTools : [],
                    mcpServerIds: (linkedMcpServers ?? []).map((srv) => srv.id),
                    guardrails: agent?.guardrails,
                  })}>
                    {s.label}
                  </Button>
                ))}
              </div>
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <MessageScrollerProvider>
          <MessageScroller className="min-h-0 flex-1">
            <MessageScrollerViewport>
              <MessageScrollerContent className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-6">
                {messages.map((message) =>
                  message.role === 'user' ? (
                    <MessageScrollerItem key={message.id} messageId={message.id} scrollAnchor>
                      <div className="flex justify-end">
                        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
                          {message.content}
                        </div>
                      </div>
                    </MessageScrollerItem>
                  ) : (
                    <MessageScrollerItem key={message.id} messageId={message.id}>
                      <div className="flex min-w-0 flex-col gap-1.5">
                        {showReasoning && message.reasoning && (
                          <details className="rounded-lg border border-border/60 px-3 py-2 text-xs text-muted-foreground">
                            <summary className="cursor-pointer select-none font-medium text-foreground/60 transition-colors hover:text-foreground">
                              Reasoning
                            </summary>
                            <div className="mt-1.5 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                              {message.reasoning}
                            </div>
                          </details>
                        )}
                        {message.toolActivity && message.toolActivity.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {message.toolActivity.map((tc, i) => {
                              const Icon = toolIcons[tc.tool] ?? Plug
                              return (
                                <span
                                  key={`${tc.tool}-${i}`}
                                  className={cn(
                                    'inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 text-[11px] text-emerald-600',
                                    tc.status === 'calling' && 'animate-pulse',
                                  )}
                                >
                                  {tc.status === 'done' ? (
                                    <Check className="size-2.5" />
                                  ) : (
                                    <Loader2 className="size-2.5 animate-spin" />
                                  )}
                                  <Icon className="size-2.5" />
                                  {tc.tool.replace(/-/g, ' ')}
                                </span>
                              )
                            })}
                          </div>
                        )}
                        {message.content ? (
                          <>
                            <AiResponse content={message.content} showActions />
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
                              {message.usage && (
                                <span title={`Total: ${message.usage.totalTokens} tokens`}>
                                  {formatTokenCount(message.usage.completionTokens)} tokens
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <span className="flex items-center gap-2 px-3 text-sm text-muted-foreground">
                            <Spinner className="size-3.5" /> Thinking…
                          </span>
                        )}
                      </div>
                    </MessageScrollerItem>
                  ),
                )}
              </MessageScrollerContent>
              <MessageScrollerButton />
            </MessageScrollerViewport>
          </MessageScroller>
        </MessageScrollerProvider>
      )}

      {/* Composer */}
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 pb-2">
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <InputGroup>
          <InputGroupTextarea
            placeholder={canSend ? 'Message the agent…' : 'Configure the agent first'}
            className="p-3.5"
            value={inputValue}
            disabled={!canSend}
            onChange={(e) => setInputValue(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />
          <InputGroupAddon align="block-end">
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/70 px-2 py-0.5 text-[11px] font-medium text-foreground/80">
              <Bot className="size-3 text-primary/70" />
              {formatModelLabel(agent?.model ?? '')}
            </span>
            {hasKb && (
              <span className={cn(
                'hidden items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] sm:inline-flex',
                useKnowledge
                  ? 'border-success/20 bg-success/10 text-success'
                  : 'border-border bg-muted/40 text-muted-foreground',
              )}>
                Knowledge: {useKnowledge ? 'On' : 'Off'}
              </span>
            )}
            {agentHasTools && (
              <span className={cn(
                'hidden items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] sm:inline-flex',
                useTools && toolsAllowed
                  ? 'border-success/20 bg-success/10 text-success'
                  : 'border-border bg-muted/40 text-muted-foreground',
              )}>
                Tools: {toolsAllowed ? (useTools ? 'On' : 'Off') : 'Pro'}
              </span>
            )}
            {isStreaming ? (
              <InputGroupButton
                type="button"
                size="icon-sm"
                variant="outline"
                aria-label="Stop generating"
                className="ml-auto"
                onClick={stop}
              >
                <Square />
              </InputGroupButton>
            ) : (
              <InputGroupButton
                type="submit"
                size="icon-sm"
                variant="default"
                aria-label="Send message"
                className="ml-auto"
                disabled={!canSend || !inputValue.trim()}
                onClick={handleSubmit}
              >
                <ArrowUp />
              </InputGroupButton>
            )}
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  )
}

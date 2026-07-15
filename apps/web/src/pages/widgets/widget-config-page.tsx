import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Check,
  Code2,
  Copy,
  ExternalLink,
  Globe2,
  GripVertical,
  Loader2,
  Pencil,
  Play,
  Plus,
  Rocket,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ProductCard } from '@/components/shared/product-card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { widgets as widgetsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'

interface WidgetDetail {
  id: string
  name: string
  status: 'draft' | 'active' | 'paused'
  publicKey: string
  allowedDomains: string[]
  config: {
    greeting?: string
    primaryColor?: string
    position?: 'bottom-right' | 'bottom-left'
    quickReplies?: string[]
    agentName?: string
  }
  agent: { id: string; name: string }
}

interface PromptItem {
  id: string
  text: string
}

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

function AutoGrowTextarea({
  value,
  onChange,
  placeholder,
  rows = 2,
  maxLength,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  maxLength?: number
  className?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = ref.current.scrollHeight + 'px'
    }
  }, [value])
  return (
    <div className="relative">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 ${className}`}
      />
      {maxLength && (
        <span className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  )
}

function PromptChip({
  prompt,
  onUpdate,
  onRemove,
  isOnly,
}: {
  prompt: PromptItem
  onUpdate: (text: string) => void
  onRemove: () => void
  isOnly: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(prompt.text)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed) onUpdate(trimmed)
    else setDraft(prompt.text)
    setEditing(false)
  }

  return (
    <div className="group flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-sm transition-colors hover:border-primary/30">
      <GripVertical className="size-3.5 shrink-0 text-muted-foreground/40 cursor-grab" />
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') {
              setDraft(prompt.text)
              setEditing(false)
            }
          }}
          maxLength={80}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      ) : (
        <span className="min-w-0 flex-1 truncate text-sm">{prompt.text}</span>
      )}
      {!editing && (
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              setDraft(prompt.text)
              setEditing(true)
            }}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="size-3" />
          </button>
          {!isOnly && (
            <button onClick={onRemove} className="rounded p-0.5 text-muted-foreground hover:text-destructive">
              <X className="size-3" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function DomainTag({
  domain,
  onRemove,
}: {
  domain: string
  onRemove: () => void
}) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs">
      <Globe2 className="size-3 text-muted-foreground" />
      <span>{domain}</span>
      <button onClick={onRemove} className="ml-0.5 rounded text-muted-foreground hover:text-destructive">
        <X className="size-3" />
      </button>
    </div>
  )
}

export default function WidgetConfigPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId } = useOrg()

  const { data: widget, isLoading } = useQuery({
    queryKey: ['widget', id],
    queryFn: async () => (await widgetsApi.get(id!)).data.data as WidgetDetail,
    enabled: Boolean(id),
  })

  const [name, setName] = useState('')
  const [greeting, setGreeting] = useState('')
  const [prompts, setPrompts] = useState<PromptItem[]>([])
  const [domains, setDomains] = useState<string[]>([])
  const [domainInput, setDomainInput] = useState('')
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right')
  const [copied, setCopied] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Initialize from widget
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (widget) {
      setName(widget.name)
      setGreeting(widget.config.greeting ?? '')
      setPrompts(
        (widget.config.quickReplies ?? []).map((text) => ({
          id: generateId(),
          text,
        })),
      )
      setDomains(widget.allowedDomains ?? [])
      setPosition(widget.config.position ?? 'bottom-right')
    }
  }, [widget])

  // Snapshot of saved state for dirty detection
  const savedSnapshot = useMemo(() => {
    if (!widget) return null
    return {
      name: widget.name,
      greeting: widget.config.greeting ?? '',
      prompts: (widget.config.quickReplies ?? []).join('\n'),
      domains: (widget.allowedDomains ?? []).join(','),
      position: widget.config.position ?? 'bottom-right',
    }
  }, [widget])

  useEffect(() => {
    if (!savedSnapshot) return
    const current = {
      name,
      greeting,
      prompts: prompts.map((p) => p.text).join('\n'),
      domains: domains.join(','),
      position,
    }
    setIsDirty(JSON.stringify(current) !== JSON.stringify(savedSnapshot))
  }, [name, greeting, prompts, domains, position, savedSnapshot])

  // Warn on page close / navigation if dirty
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const save = useMutation({
    mutationFn: (status?: string) =>
      widgetsApi.update(id!, {
        name,
        status,
        allowedDomains: domains,
        config: {
          greeting,
          quickReplies: prompts.map((p) => p.text),
          position,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widget', id] })
      queryClient.invalidateQueries({ queryKey: ['widgets', orgId] })
      toast.success('Widget saved')
      setIsDirty(false)
    },
    onError: (error: Error) => toast.error(error.message || 'Could not save widget'),
  })

  const deleteWidget = useMutation({
    mutationFn: () => widgetsApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widgets', orgId] })
      toast.success('Widget deleted')
      navigate('/widgets')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const copyEmbed = async () => {
    const response = await widgetsApi.getEmbed(id!)
    await navigator.clipboard.writeText(response.data.data.snippet)
    setCopied(true)
    toast.success('Embed code copied')
    window.setTimeout(() => setCopied(false), 2000)
  }

  const addDomain = () => {
    const d = domainInput.trim().toLowerCase()
    if (!d) return
    if (domains.includes(d)) {
      toast.error('Domain already added')
      return
    }
    setDomains([...domains, d])
    setDomainInput('')
    setIsDirty(true)
  }

  const removeDomain = (d: string) => {
    setDomains(domains.filter((x) => x !== d))
    setIsDirty(true)
  }

  const addPrompt = () => {
    if (prompts.length >= 4) return
    setPrompts([...prompts, { id: generateId(), text: 'New prompt' }])
    setIsDirty(true)
  }

  const updatePrompt = (pid: string, text: string) => {
    setPrompts(prompts.map((p) => (p.id === pid ? { ...p, text } : p)))
    setIsDirty(true)
  }

  const removePrompt = (pid: string) => {
    setPrompts(prompts.filter((p) => p.id !== pid))
    setIsDirty(true)
  }

  if (isLoading || !widget) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const isLive = widget.status === 'active'

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            onClick={() => navigate('/widgets')}
            className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Widgets
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">{widget.name}</h1>
            <Badge
              variant="outline"
              className={`h-5 px-1.5 text-[10px] capitalize leading-tight border-transparent ${
                isLive ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'
              }`}
            >
              {widget.status}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Connected to {widget.agent.name}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="sm" onClick={copyEmbed} />
              }
            >
              {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
              {copied ? 'Copied' : 'Copy Embed'}
            </TooltipTrigger>
            <TooltipContent>Copies installation code</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    window.open(
                      `/widget/demo?embed=true&agentId=${widget.agent.id}&position=${position}`,
                      '_blank',
                    )
                  }
                />
              }
            >
              <ExternalLink className="size-3.5" />
              Preview
            </TooltipTrigger>
            <TooltipContent>Open interactive widget preview</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="sm"
                  onClick={() => save.mutate(isLive ? 'paused' : 'active')}
                  disabled={save.isPending}
                  className={isLive ? '' : 'bg-primary text-primary-foreground hover:bg-primary/90'}
                />
              }
            >
              {isLive ? <Trash2 className="size-3.5" /> : <Play className="size-3.5" />}
              {isLive ? 'Pause' : 'Publish'}
            </TooltipTrigger>
            <TooltipContent>{isLive ? 'Disable widget without deleting' : 'Make widget live'}</TooltipContent>
          </Tooltip>

          <Button
            size="sm"
            onClick={() => save.mutate()}
            disabled={save.isPending || !isDirty}
          >
            <Save className="size-3.5" />
            Save
          </Button>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (window.confirm('Delete this widget? This cannot be undone.')) {
                      deleteWidget.mutate()
                    }
                  }}
                />
              }
            >
              <Trash2 className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Delete widget</TooltipContent>
          </Tooltip>
        </div>
      </header>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main */}
        <main className="space-y-6">
          {/* Conversation */}
          <ProductCard className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Rocket className="size-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Conversation</h2>
                <p className="text-xs text-muted-foreground">Set the first thing visitors see.</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Greeting */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="greeting" className="text-xs font-medium">
                    Greeting
                  </Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="inline-flex size-4 items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground cursor-help">
                        ?
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Shown before users send their first message</TooltipContent>
                  </Tooltip>
                </div>
                <AutoGrowTextarea
                  id="greeting"
                  value={greeting}
                  onChange={setGreeting}
                  placeholder="Hi there! How can I help you today?"
                  rows={2}
                  maxLength={500}
                />
              </div>

              {/* Starter Prompts */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-medium">Starter Prompts</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="inline-flex size-4 items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground cursor-help">
                        ?
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Suggested questions users can click</TooltipContent>
                  </Tooltip>
                  <Badge variant="secondary" className="ml-auto h-4 px-1 text-[10px]">
                    {prompts.length}/4
                  </Badge>
                </div>

                <div className="space-y-2">
                  {prompts.map((p) => (
                    <PromptChip
                      key={p.id}
                      prompt={p}
                      onUpdate={(text) => updatePrompt(p.id, text)}
                      onRemove={() => removePrompt(p.id)}
                      isOnly={prompts.length === 1}
                    />
                  ))}
                </div>

                {prompts.length < 4 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 text-muted-foreground"
                    onClick={addPrompt}
                  >
                    <Plus className="size-3.5" />
                    Add Prompt
                  </Button>
                )}
              </div>
            </div>
          </ProductCard>

          {/* Placement */}
          <ProductCard className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium">Launcher Position</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="inline-flex size-4 items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground cursor-help">
                      ?
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Choose where the floating launcher appears</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center rounded-lg border border-border p-0.5">
                {(['bottom-right', 'bottom-left'] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => { setPosition(pos); setIsDirty(true) }}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                      position === pos
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {pos.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </ProductCard>
        </main>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Publish / Domains */}
          <ProductCard className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Globe2 className="size-4 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold">Publish</h2>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="inline-flex size-4 items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground cursor-help">
                        ?
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Only these domains may load your widget</TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-xs text-muted-foreground">Allowed origins.</p>
              </div>
            </div>

            <div className="space-y-3">
              {domains.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {domains.map((d) => (
                    <DomainTag key={d} domain={d} onRemove={() => removeDomain(d)} />
                  ))}
                </div>
              )}

              <div className="flex gap-1.5">
                <Input
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="example.com"
                  className="h-8 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addDomain()
                    }
                  }}
                />
                <Button size="sm" variant="ghost" className="h-8 px-2" onClick={addDomain}>
                  <Plus className="size-3.5" />
                </Button>
              </div>

              {domains.length > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  {domains.length} domain{domains.length !== 1 ? 's' : ''} configured
                </p>
              )}
            </div>
          </ProductCard>

          {/* Install */}
          <ProductCard className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Code2 className="size-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Install</h2>
                <p className="text-xs text-muted-foreground">Embed on your website.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <code className="block text-[11px] leading-relaxed text-muted-foreground break-all">
                  {`<script src="${window.location.origin}/widget.js" data-agent-id="${widget.agent.id}"></script>`}
                </code>
              </div>

              <Button className="w-full" size="sm" onClick={copyEmbed}>
                {copied ? <Check className="size-3.5 text-primary-foreground" /> : <Copy className="size-3.5" />}
                {copied ? 'Copied!' : 'Copy Embed'}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() =>
                    window.open(
                      `/widget/demo?embed=true&agentId=${widget.agent.id}&position=${position}`,
                      '_blank',
                    )
                  }
                >
                  <ExternalLink className="size-3" />
                  Preview
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => window.open('https://docs.convio.ai/embedding', '_blank')}
                >
                  <ExternalLink className="size-3" />
                  View Docs
                </Button>
              </div>
            </div>
          </ProductCard>


        </aside>
      </div>
    </div>
  )
}

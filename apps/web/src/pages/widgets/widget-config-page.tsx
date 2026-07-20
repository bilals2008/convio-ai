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
  MessageSquare,
  MoreVertical,
  Palette,
  Pause,
  Pencil,
  Play,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import { ChatWidget } from '@/components/widget'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProductCard } from '@/components/shared/product-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
    backgroundColor?: string
    textColor?: string
    position?: 'bottom-right' | 'bottom-left'
    quickReplies?: string[]
    agentName?: string
    agentAvatar?: string
  }
  agent: { id: string; name: string; avatar?: string | null }
}

interface PromptItem {
  id: string
  text: string
}

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

function AutoGrowTextarea({
  id,
  value,
  onChange,
  placeholder,
  rows = 2,
  maxLength,
  className = '',
}: {
  id?: string
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
        id={id}
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
          maxLength={60}
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

function ColorField({
  label,
  hint,
  value,
  onChange,
  presets,
}: {
  label: string
  hint: string
  value: string
  onChange: (color: string) => void
  presets: { label: string; color: string }[]
}) {
  return (
    <div className="space-y-2">
      <div>
        <Label className="text-xs font-medium">{label}</Label>
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {presets.map((p) => (
          <button
            key={p.color}
            type="button"
            onClick={() => onChange(p.color)}
            className={`relative size-8 rounded-full ring-2 transition-all hover:scale-110 ${
              value === p.color
                ? 'ring-primary ring-offset-2 ring-offset-background scale-110'
                : 'ring-transparent hover:ring-foreground/20'
            }`}
            style={{ backgroundColor: p.color }}
            title={p.label}
          >
            {value === p.color && (
              <Check className="size-3.5 absolute inset-0 m-auto text-white drop-shadow" />
            )}
          </button>
        ))}
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="size-8 cursor-pointer rounded-full border-2 border-border"
            title="Custom color"
          />
        </div>
      </div>
    </div>
  )
}

const primaryPresets = [
  { label: 'Orange', color: '#fb923c' },
  { label: 'Blue', color: '#3b82f6' },
  { label: 'Emerald', color: '#10b981' },
  { label: 'Violet', color: '#8b5cf6' },
  { label: 'Rose', color: '#f43f5e' },
  { label: 'Slate', color: '#475569' },
]

const bgPresets = [
  { label: 'Dark', color: '#1c1c1c' },
  { label: 'Charcoal', color: '#2d2d2d' },
  { label: 'White', color: '#ffffff' },
  { label: 'Light Gray', color: '#f5f5f5' },
]

const textPresets = [
  { label: 'Light', color: '#f3f4f6' },
  { label: 'White', color: '#ffffff' },
  { label: 'Dark', color: '#1f2937' },
  { label: 'Charcoal', color: '#111827' },
]

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
  const [primaryColor, setPrimaryColor] = useState('#fb923c')
  const [backgroundColor, setBackgroundColor] = useState('#1c1c1c')
  const [textColor, setTextColor] = useState('#f3f4f6')
  const [agentName, setAgentName] = useState('')
  const [agentAvatar, setAgentAvatar] = useState('')
  const [copied, setCopied] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [activeTab, setActiveTab] = useState('content')

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
      setPrimaryColor(widget.config.primaryColor ?? '#fb923c')
      setBackgroundColor(widget.config.backgroundColor ?? '#1c1c1c')
      setTextColor(widget.config.textColor ?? '#f3f4f6')
      setAgentName(widget.config.agentName ?? widget.agent.name ?? '')
      setAgentAvatar(widget.config.agentAvatar ?? '')
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
      primaryColor: widget.config.primaryColor ?? '#fb923c',
      backgroundColor: widget.config.backgroundColor ?? '#1c1c1c',
      textColor: widget.config.textColor ?? '#f3f4f6',
      agentName: widget.config.agentName ?? widget.agent.name ?? '',
      agentAvatar: widget.config.agentAvatar ?? '',
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
      primaryColor,
      backgroundColor,
      textColor,
      agentName,
      agentAvatar,
    }
    setIsDirty(JSON.stringify(current) !== JSON.stringify(savedSnapshot))
  }, [name, greeting, prompts, domains, position, primaryColor, backgroundColor, textColor, agentName, agentAvatar, savedSnapshot])

  // Warn on page close / navigation if dirty
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
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
          primaryColor,
          backgroundColor,
          textColor,
          agentName,
          ...(agentAvatar ? { agentAvatar } : {}),
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widget', id] })
      queryClient.invalidateQueries({ queryKey: ['widgets', orgId] })
      toast.success('Widget saved')
      setIsDirty(false)
    },
    onError: (error: any) => {
      const status = error?.response?.status
      if (status === 402) {
        toast.error('You have reached your plan limit. Upgrade to publish or save more widgets.', {
          action: { label: 'Upgrade', onClick: () => navigate('/settings/billing') },
          duration: 8000,
        })
      } else if (status === 400 && error?.response?.data?.details) {
        const msgs = error.response.data.details.map((d: any) => d.message).join('. ')
        toast.error(msgs || 'Please check your inputs and try again.')
      } else {
        toast.error(error.message || 'Something went wrong. Please try again.')
      }
    },
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
    const d = domainInput.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
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
            <span className="text-[11px] text-muted-foreground">Status:</span>
            <Badge
              variant="outline"
              className={`h-5 px-1.5 text-[10px] capitalize leading-tight border-transparent ${
                isLive
                  ? 'bg-success/15 text-success'
                  : widget.status === 'paused'
                    ? 'bg-warning/15 text-warning'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {widget.status === 'active' ? 'Live' : widget.status === 'paused' ? 'Paused' : 'Draft'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {widget.agent.avatar ? (
              <img src={widget.agent.avatar} alt="" className="size-5 rounded-full object-cover" />
            ) : (
              <div className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                {widget.agent.name.charAt(0).toUpperCase()}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Connected to {widget.agent.name}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={isLive ? 'outline' : 'default'}
            size="sm"
            onClick={() => save.mutate(isLive ? 'paused' : 'active')}
            disabled={save.isPending}
          >
            {isLive ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            {isLive ? 'Pause' : 'Publish'}
          </Button>

          <Button
            size="sm"
            onClick={() => save.mutate()}
            disabled={save.isPending || !isDirty}
          >
            {save.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            {save.isPending ? 'Saving…' : isDirty ? 'Save changes' : 'Saved'}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground" />}
            >
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={copyEmbed}>
                {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
                {copied ? 'Copied!' : 'Copy embed code'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  window.open(
                    `/widget/demo?embed=true&widgetKey=${widget.publicKey}&position=${position}&preview=true`,
                    '_blank',
                  )
                }
              >
                <ExternalLink className="size-4" />
                Open live preview
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  if (window.confirm('Delete this widget? This cannot be undone.')) {
                    deleteWidget.mutate()
                  }
                }}
              >
                <Trash2 className="size-4" />
                Delete widget
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        {/* Settings tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as string)} className="min-w-0">
          <TabsList variant="line" className="mb-5">
            <TabsTrigger value="content">
              <MessageSquare className="size-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="size-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="install">
              <Code2 className="size-4" />
              Install
            </TabsTrigger>
          </TabsList>

          {/* Content tab */}
          <TabsContent value="content" className="space-y-6">
          {/* Conversation */}
          <ProductCard className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="size-4 text-primary" />
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
          </TabsContent>

          {/* Appearance tab */}
          <TabsContent value="appearance" className="space-y-6">
          {/* Identity + colors */}
          <ProductCard className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Palette className="size-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Appearance</h2>
                <p className="text-xs text-muted-foreground">Customize the widget look and feel.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="agentName" className="text-xs font-medium">Agent Name</Label>
                <Input
                  id="agentName"
                  value={agentName}
                  onChange={(e) => { setAgentName(e.target.value); setIsDirty(true) }}
                  placeholder="Assistant"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agentAvatar" className="text-xs font-medium">Agent Avatar URL</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="agentAvatar"
                    value={agentAvatar}
                    onChange={(e) => { setAgentAvatar(e.target.value); setIsDirty(true) }}
                    placeholder="https://example.com/avatar.png"
                    className="h-8 text-xs flex-1"
                  />
                  <div
                    className="size-10 shrink-0 rounded-full flex items-center justify-center overflow-hidden"
                    style={
                      agentAvatar
                        ? {}
                        : {
                            background: `linear-gradient(135deg, ${primaryColor}, color-mix(in srgb, ${primaryColor} 80%, black))`,
                            boxShadow: `0 0 0 2px ${primaryColor}`,
                          }
                    }
                  >
                    {agentAvatar ? (
                      <img src={agentAvatar} alt="Avatar preview" className="size-full rounded-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-white">
                        {(agentName || 'A').split(' ').map((w: string) => w[0]).slice(0, 1).join('').toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <ColorField
                label="Primary Color"
                hint="Accent for the launcher button and user bubbles"
                value={primaryColor}
                onChange={(c) => { setPrimaryColor(c); setIsDirty(true) }}
                presets={primaryPresets}
              />

              <ColorField
                label="Background Color"
                hint="Main background of the widget window"
                value={backgroundColor}
                onChange={(c) => { setBackgroundColor(c); setIsDirty(true) }}
                presets={bgPresets}
              />

              <ColorField
                label="Text Color"
                hint="Color of message text and labels"
                value={textColor}
                onChange={(c) => { setTextColor(c); setIsDirty(true) }}
                presets={textPresets}
              />
            </div>
          </ProductCard>

          {/* Placement */}
          <ProductCard className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label className="text-sm font-semibold">Launcher Position</Label>
                <p className="text-[11px] text-muted-foreground">Where the floating launcher appears on the page</p>
              </div>
              <div className="flex shrink-0 items-center rounded-lg border border-border p-0.5">
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
          </TabsContent>

          {/* Install tab */}
          <TabsContent value="install" className="space-y-6">
          {/* Domains */}
          <ProductCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Globe2 className="size-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Allowed domains</h2>
                <p className="text-xs text-muted-foreground">Only these origins may load your widget.</p>
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
                  className="h-9 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addDomain()
                    }
                  }}
                />
                <Button size="sm" variant="outline" onClick={addDomain}>
                  <Plus className="size-3.5" />
                  Add
                </Button>
              </div>

              <p className="text-[11px] text-muted-foreground">
                {domains.length > 0
                  ? `${domains.length} domain${domains.length !== 1 ? 's' : ''} configured`
                  : 'Add at least one domain before publishing.'}
              </p>
            </div>
          </ProductCard>

          {/* Embed snippet */}
          <ProductCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Code2 className="size-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Embed snippet</h2>
                <p className="text-xs text-muted-foreground">Paste this before the closing &lt;/body&gt; tag.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <code className="block text-xs leading-relaxed text-muted-foreground break-all">
                  {`<script src="${window.location.origin}/widget.js" data-widget-key="${widget.publicKey}"></script>`}
                </code>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={copyEmbed}>
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? 'Copied!' : 'Copy embed code'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      `/widget/demo?embed=true&widgetKey=${widget.publicKey}&position=${position}&preview=true`,
                      '_blank',
                    )
                  }
                >
                  <ExternalLink className="size-3.5" />
                  Live preview
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('https://docs.convio.ai/embedding', '_blank')}
                >
                  <ExternalLink className="size-3.5" />
                  Docs
                </Button>
              </div>
            </div>
          </ProductCard>
          </TabsContent>
        </Tabs>

        {/* Sticky live preview */}
        <aside className="lg:sticky lg:top-6">
          <ProductCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                <Play className="size-3.5 text-primary" />
              </div>
              <h2 className="text-sm font-semibold">Live preview</h2>
            </div>
            <div
              className="relative rounded-xl overflow-hidden shadow-lg"
              style={{ backgroundColor, height: 180 }}
            >
              {/* Header bar */}
              <div
                className="flex items-center gap-2 px-3 h-10"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, color-mix(in srgb, ${primaryColor} 80%, black))` }}
              >
                <div className="relative shrink-0">
                  <div
                    className="size-6 rounded-full flex items-center justify-center overflow-hidden"
                    style={{ boxShadow: `0 0 0 2px ${primaryColor}` }}
                  >
                    {agentAvatar ? (
                      <img src={agentAvatar} alt="" className="size-full object-cover" />
                    ) : (
                      <span className="text-[8px] font-bold text-white">
                        {(agentName || 'A').split(' ').map((w: string) => w[0]).slice(0, 1).join('').toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-white truncate">{agentName || 'Assistant'}</span>
              </div>
              {/* Greeting bubble */}
              <div className="px-3 pt-3">
                <div
                  className="inline-block max-w-[85%] rounded-xl rounded-bl-md px-2.5 py-1.5 text-[9px] leading-snug"
                  style={{ color: textColor, backgroundColor: `color-mix(in srgb, ${backgroundColor} 85%, ${textColor === '#f3f4f6' ? 'white' : 'black'})` }}
                >
                  {greeting || 'Hi there! How can I help you today?'}
                </div>
              </div>
              {/* Quick replies */}
              {prompts.length > 0 && (
                <div className="px-3 pt-2 flex flex-wrap gap-1">
                  {prompts.slice(0, 2).map((p) => (
                    <span
                      key={p.id}
                      className="inline-block rounded-full border px-2 py-0.5 text-[8px]"
                      style={{ borderColor: `color-mix(in srgb, ${primaryColor} 40%, transparent)`, color: primaryColor }}
                    >
                      {p.text.length > 18 ? p.text.slice(0, 18) + '…' : p.text}
                    </span>
                  ))}
                </div>
              )}
              {/* Bottom launcher hint */}
              <div className="absolute bottom-2 right-2">
                <div
                  className="size-7 rounded-full flex items-center justify-center shadow-md"
                  style={{ backgroundColor: primaryColor }}
                >
                  <svg className="size-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </ProductCard>

        </aside>
      </div>

      {widget.agent.id && (
        <ChatWidget
          key={`${agentName}-${primaryColor}-${backgroundColor}-${textColor}-${position}-${greeting}-${agentAvatar}-${prompts.map(p => p.text).join(',')}`}
          agentId={widget.agent.id}
          position={position}
          greeting={greeting || 'Hi there! How can I help you today?'}
          agentName={agentName || widget.agent.name}
          agentAvatar={agentAvatar || undefined}
          quickReplies={prompts.map(p => p.text).filter(Boolean)}
          theme={{
            primaryColor,
            backgroundColor,
            textColor: ['#ffffff', '#f3f4f6', '#e5e7eb'].includes(backgroundColor) ? '#1f2937' : textColor,
          }}
        />
      )}
    </div>
  )
}

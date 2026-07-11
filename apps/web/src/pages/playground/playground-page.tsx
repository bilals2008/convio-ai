import { useState, useCallback, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Eye,
  EyeOff,
  Send,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Copy,
  Check,
  ArrowRight,
  Terminal,
  Key,
  Globe,
  Loader2,
  BookTemplate,
  History,
  TestTube,
  Search,
  Sparkles,
  MessageSquare,
  Brain,
  Code,
  FileText,
  Lightbulb,
  Puzzle,
  List,
} from 'lucide-react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface LogEntry {
  id: string
  timestamp: Date
  provider: string
  model: string
  message: string
  response?: string
  latencyMs?: number
  success: boolean
  error?: string
  usage?: any
}

interface PromptTemplate {
  id: string
  name: string
  description: string
  icon: typeof MessageSquare
  message: string
  category: string
}

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', slug: 'openai', variant: 'light' },
  { id: 'anthropic', name: 'Anthropic', slug: 'anthropic', variant: 'light' },
  { id: 'google', name: 'Google AI', slug: 'google', variant: 'default' },
  { id: 'groq', name: 'Groq', slug: 'groq', variant: 'default' },
  { id: 'kie', name: 'KIE AI', slug: '', variant: 'default' },
  { id: 'openrouter', name: 'OpenRouter', slug: 'openrouter', variant: 'light' },
  { id: 'opencode', name: 'OpenCode Zen', slug: 'opencode', variant: 'mono' },
  { id: 'mistral', name: 'Mistral', slug: 'mistral', variant: 'color' },
  { id: 'together', name: 'Together', slug: 'together-ai', variant: 'light' },
  { id: 'deepseek', name: 'DeepSeek', slug: 'deepseek', variant: 'default' },
  { id: 'perplexity', name: 'Perplexity', slug: 'perplexity', variant: 'default' },
  { id: 'local', name: 'Local API', slug: '', variant: 'default' },
] as const

type ProviderId = (typeof PROVIDERS)[number]['id']

const SVG_BASE = 'https://thesvg.org/icons'

const ENV_KEY_MAP: Record<ProviderId, string> = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  google: 'GOOGLE_API_KEY',
  groq: 'GROQ_API_KEY',
  kie: 'KIE_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  opencode: 'OPENCODE_API_KEY',
  mistral: 'MISTRAL_API_KEY',
  together: 'TOGETHER_API_KEY',
  deepseek: 'DEEPSEEK_API_KEY',
  perplexity: 'PERPLEXITY_API_KEY',
  local: 'LOCAL_API_URL',
}

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'hello',
    name: 'Basic Hello',
    description: 'Simple greeting test',
    icon: MessageSquare,
    message: 'Hello! Reply with a short greeting.',
    category: 'basic',
  },
  {
    id: 'math',
    name: 'Math Problem',
    description: 'Test reasoning & calculation',
    icon: Brain,
    message: 'What is 2+2? Reply with just the number.',
    category: 'reasoning',
  },
  {
    id: 'code',
    name: 'Write Code',
    description: 'Generate a function',
    icon: Code,
    message: 'Write a JavaScript function that reverses a string. Return only the code.',
    category: 'code',
  },
  {
    id: 'explain',
    name: 'Explain Concept',
    description: 'Test explanation quality',
    icon: Lightbulb,
    message: 'Explain what a REST API is in one paragraph.',
    category: 'reasoning',
  },
  {
    id: 'summarize',
    name: 'Summarize Text',
    description: 'Test summarization',
    icon: FileText,
    message: 'Summarize this in one sentence: Artificial intelligence is transforming industries by automating repetitive tasks, enhancing decision-making through data analysis, and creating new opportunities for innovation across healthcare, finance, transportation, and education sectors.',
    category: 'reasoning',
  },
  {
    id: 'creative',
    name: 'Creative Writing',
    description: 'Test creative output',
    icon: Sparkles,
    message: 'Write a haiku about artificial intelligence.',
    category: 'creative',
  },
  {
    id: 'logic',
    name: 'Logic Puzzle',
    description: 'Test logical reasoning',
    icon: Puzzle,
    message: 'If all humans are mortal and Socrates is human, is Socrates mortal? Explain briefly.',
    category: 'reasoning',
  },
  {
    id: 'list',
    name: 'List Generation',
    description: 'Test structured output',
    icon: List,
    message: 'List 5 programming languages and their primary use cases. Format as a bullet list.',
    category: 'code',
  },
  {
    id: 'search',
    name: 'Search Query',
    description: 'Simulate a search',
    icon: Search,
    message: 'What are the best practices for writing clean React components? Give 3 tips.',
    category: 'code',
  },
  {
    id: 'translate',
    name: 'Translation',
    description: 'Test multilingual',
    icon: Globe,
    message: 'Translate "Hello, how are you?" to French, Spanish, and German.',
    category: 'creative',
  },
]

const CATEGORIES = [
  { id: 'all', label: 'All', icon: BookTemplate },
  { id: 'basic', label: 'Basic', icon: MessageSquare },
  { id: 'reasoning', label: 'Reasoning', icon: Brain },
  { id: 'code', label: 'Code', icon: Code },
  { id: 'creative', label: 'Creative', icon: Sparkles },
] as const

export default function PlaygroundPage() {
  const [provider, setProvider] = useState<ProviderId>('groq')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [message, setMessage] = useState(PROMPT_TEMPLATES[0].message)
  const [showKey, setShowKey] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [copied, setCopied] = useState(false)
  const [models, setModels] = useState<string[]>([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('test')
  const [templateCategory, setTemplateCategory] = useState('all')
  const logsEndRef = useRef<HTMLDivElement>(null)
  const modelsFetchRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedProvider = PROVIDERS.find((p) => p.id === provider)!
  const currentModel = model || models[0] || ''

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  useEffect(() => {
    if (modelsFetchRef.current) {
      clearTimeout(modelsFetchRef.current)
    }

    const isLocal = provider === 'local'
    const effectiveKey = isLocal ? 'no-key-needed' : apiKey

    if (!isLocal && !apiKey.trim()) {
      setModels([])
      setModel('')
      return
    }

    setModelsLoading(true)
    setModel('')

    modelsFetchRef.current = setTimeout(async () => {
      try {
        const res = await api.post('/playground/models', { provider, apiKey: effectiveKey })
        const fetchedModels = res.data.models || []
        setModels(fetchedModels)
        if (fetchedModels.length > 0) {
          setModel(fetchedModels[0])
        }
      } catch {
        setModels([])
      } finally {
        setModelsLoading(false)
      }
    }, 500)

    return () => {
      if (modelsFetchRef.current) {
        clearTimeout(modelsFetchRef.current)
      }
    }
  }, [provider, apiKey])

  const testMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/playground/test', {
        provider,
        apiKey,
        model: currentModel,
        message,
      })
      return res.data
    },
    onSuccess: (data) => {
      const log: LogEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        provider,
        model: currentModel,
        message,
        response: data.response,
        latencyMs: data.latencyMs,
        success: data.success,
        error: data.error,
        usage: data.usage,
      }
      setLogs((prev) => [...prev, log])
    },
    onError: (error: any) => {
      const log: LogEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        provider,
        model: currentModel,
        message,
        success: false,
        error: error.response?.data?.error || error.message || 'Request failed',
        latencyMs: 0,
      }
      setLogs((prev) => [...prev, log])
    },
  })

  const handleTest = useCallback(() => {
    const isLocal = provider === 'local'
    if ((!isLocal && !apiKey.trim()) || !message.trim() || !currentModel) return
    testMutation.mutate()
  }, [provider, apiKey, message, currentModel, testMutation])

  const handleCopyEnv = useCallback(() => {
    const envVar = ENV_KEY_MAP[provider]
    navigator.clipboard.writeText(`${envVar}=${apiKey || 'http://localhost:20128/v1'}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [provider, apiKey])

  const handleClearLogs = useCallback(() => setLogs([]), [])

  const filteredTemplates = templateCategory === 'all'
    ? PROMPT_TEMPLATES
    : PROMPT_TEMPLATES.filter((t) => t.category === templateCategory)

  const providerSvgUrl = selectedProvider.slug
    ? `${SVG_BASE}/${selectedProvider.slug}/${selectedProvider.variant}.svg`
    : null

  return (
    <PageContainer>
      <PageHeader
        title="AI Playground"
        description="Test API keys, models, and prompts across providers"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="test">
              <TestTube className="size-4" />
              Test
            </TabsTrigger>
            <TabsTrigger value="templates">
              <BookTemplate className="size-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="size-4" />
              History
              {logs.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-[9px]">
                  {logs.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="toasts">
              <Sparkles className="size-4" />
              Toast Test
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="test" className="mt-0">
          <div className="grid lg:grid-cols-[400px_1fr] gap-6">
            <div className="space-y-4">
              <Card className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                    <Globe className="size-4 text-primary" />
                  </div>
                  <h2 className="text-sm font-semibold">Provider</h2>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {PROVIDERS.map((p) => {
                    const isActive = provider === p.id
                    const imgUrl = p.slug ? `${SVG_BASE}/${p.slug}/${p.variant}.svg` : null
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setProvider(p.id)
                          setModel('')
                          setApiKey('')
                          setModels([])
                        }}
                        className={cn(
                          'flex flex-col items-center gap-1.5 rounded-lg p-2 transition-all',
                          isActive
                            ? 'bg-primary/10 ring-1 ring-primary/20'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={p.name}
                            className="size-5"
                            loading="lazy"
                          />
                        ) : (
                          <div className="size-5 rounded bg-muted flex items-center justify-center text-[8px] font-bold">
                            {p.name.charAt(0)}
                          </div>
                        )}
                        <span className="text-[9px] font-medium leading-tight text-center">
                          {p.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </Card>

              <Card className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                    <Key className="size-4 text-primary" />
                  </div>
                  <h2 className="text-sm font-semibold">API Key</h2>
                  <Badge variant="secondary" className="text-[10px] ml-auto font-mono">
                    {ENV_KEY_MAP[provider]}
                  </Badge>
                </div>

                {provider === 'local' ? (
                  <div className="flex items-center justify-center h-9 rounded-md border border-dashed text-xs text-emerald-500 bg-emerald-500/5">
                    No API key required — local server
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          type={showKey ? 'text' : 'password'}
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder={`Enter ${selectedProvider.name} API key`}
                          className="h-10 text-sm font-mono pr-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </button>
                      </div>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleCopyEnv}
                        disabled={!apiKey}
                        title="Copy env variable"
                      >
                        {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Key is sent to backend only for this test. Not stored anywhere.
                    </p>
                  </div>
                )}
              </Card>

              <Card className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                    <Zap className="size-4 text-primary" />
                  </div>
                  <h2 className="text-sm font-semibold">Model</h2>
                  {modelsLoading && (
                    <Loader2 className="size-3.5 animate-spin text-muted-foreground ml-auto" />
                  )}
                  {!modelsLoading && models.length > 0 && (
                    <Badge variant="secondary" className="text-[10px] ml-auto">
                      {models.length} models
                    </Badge>
                  )}
                </div>

                {provider !== 'local' && !apiKey.trim() ? (
                  <div className="flex items-center justify-center h-9 rounded-md border border-dashed text-xs text-muted-foreground">
                    Enter API key to load models
                  </div>
                ) : (
                  <Select value={currentModel} onValueChange={setModel} disabled={modelsLoading}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder={modelsLoading ? 'Loading models...' : 'Select model'} />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((m) => (
                        <SelectItem key={m} value={m} className="text-sm font-mono">
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                      <Send className="size-4 text-primary" />
                    </div>
                    <h2 className="text-sm font-semibold">Test Message</h2>
                  </div>
                  <Button
                    size="default"
                    onClick={handleTest}
                    disabled={(provider !== 'local' && !apiKey.trim()) || !message.trim() || !currentModel || testMutation.isPending}
                    className="gap-1.5 text-xs"
                  >
                    {testMutation.isPending ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="size-3.5" />
                        Send Test
                      </>
                    )}
                  </Button>
                </div>

                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Enter a test message..."
                  className="text-sm resize-none"
                />

                {currentModel && (
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    <span>
                      Using <strong className="font-mono">{currentModel}</strong> via {selectedProvider.name}
                    </span>
                  </div>
                )}
              </Card>

              <Card className="flex flex-col overflow-hidden flex-1">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Terminal className="size-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">Response</h2>
                    {logs.length > 0 && (
                      <Badge variant="secondary" className="text-[10px]">
                        {logs.length}
                      </Badge>
                    )}
                  </div>
                </div>

                <ScrollArea className="flex-1 h-[300px]">
                  <div className="p-4 space-y-3">
                    {logs.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
                          <Terminal className="size-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          No logs yet. Send a test message to see results.
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          You can also use a template from the Templates tab.
                        </p>
                      </div>
                    )}

                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className={cn(
                          'rounded-lg border p-3 space-y-2 text-xs',
                          log.success
                            ? 'border-emerald-500/20 bg-emerald-500/5'
                            : 'border-destructive/20 bg-destructive/5'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {log.success ? (
                              <CheckCircle2 className="size-3.5 text-emerald-500" />
                            ) : (
                              <XCircle className="size-3.5 text-destructive" />
                            )}
                            <Badge variant="outline" className="text-[9px] font-mono">
                              {log.provider}
                            </Badge>
                            <span className="text-muted-foreground font-mono">{log.model}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="size-3" />
                            <span>{log.latencyMs}ms</span>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <p className="text-[10px] text-muted-foreground mb-1 font-medium uppercase tracking-wide">You</p>
                          <p className="text-foreground">{log.message}</p>
                        </div>

                        {log.response && (
                          <div>
                            <p className="text-[10px] text-muted-foreground mb-1 font-medium uppercase tracking-wide">Response</p>
                            <p className="text-foreground whitespace-pre-wrap">{log.response}</p>
                          </div>
                        )}

                        {log.error && (
                          <div>
                            <p className="text-[10px] text-destructive mb-1 font-medium uppercase tracking-wide">Error</p>
                            <p className="text-destructive whitespace-pre-wrap">{log.error}</p>
                          </div>
                        )}

                        {log.usage && (
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1">
                            {log.usage.prompt_tokens && <span>Prompt: {log.usage.prompt_tokens}</span>}
                            {log.usage.completion_tokens && <span>Completion: {log.usage.completion_tokens}</span>}
                            {log.usage.total_tokens && <span>Total: {log.usage.total_tokens}</span>}
                          </div>
                        )}

                        <p className="text-[9px] text-muted-foreground/60">
                          {log.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                </ScrollArea>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-0">
          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            <Card className="p-4 h-fit">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                  <BookTemplate className="size-4 text-primary" />
                </div>
                <h2 className="text-sm font-semibold">Categories</h2>
              </div>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setTemplateCategory(cat.id)}
                      className={cn(
                        'flex items-center gap-2 w-full rounded-lg px-3 py-2 text-xs font-medium transition-all',
                        templateCategory === cat.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <Icon className="size-3.5" />
                      {cat.label}
                    </button>
                  )
                })}
              </div>
            </Card>

            <div className="space-y-3">
              {filteredTemplates.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-sm text-muted-foreground">No templates found.</p>
                </div>
              )}
              {filteredTemplates.map((template) => {
                const Icon = template.icon
                return (
                  <Card
                    key={template.id}
                    className="p-4 cursor-pointer transition-all hover:border-primary/30 hover:bg-muted/30"
                    onClick={() => {
                      setMessage(template.message)
                      setActiveTab('test')
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 shrink-0 mt-0.5">
                        <Icon className="size-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium">{template.name}</h3>
                          <Badge variant="outline" className="text-[9px] capitalize">
                            {template.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
                        <p className="text-[11px] text-muted-foreground/70 mt-2 line-clamp-2 font-mono bg-muted/50 rounded p-2">
                          {template.message}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          setMessage(template.message)
                          setActiveTab('test')
                        }}
                      >
                        <ArrowRight className="size-3.5" />
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="toasts" className="mt-0">
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="size-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Toast Test</h2>
                <p className="text-xs text-muted-foreground">Click a button to test each toast type</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 border-emerald-500/30 hover:bg-emerald-500/10"
                onClick={() => toast.success('Success! The operation completed successfully.')}
              >
                <CheckCircle2 className="size-5 text-emerald-500" />
                <span className="text-xs font-medium">Success</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 border-destructive/30 hover:bg-destructive/10"
                onClick={() => toast.error('Error! Something went wrong. Please try again.')}
              >
                <XCircle className="size-5 text-destructive" />
                <span className="text-xs font-medium">Error</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 border-amber-500/30 hover:bg-amber-500/10"
                onClick={() => toast.warning('Warning! This action may have consequences.')}
              >
                <Clock className="size-5 text-amber-500" />
                <span className="text-xs font-medium">Warning</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 border-blue-500/30 hover:bg-blue-500/10"
                onClick={() => toast.info('Info: Here is some useful information.')}
              >
                <Terminal className="size-5 text-blue-500" />
                <span className="text-xs font-medium">Info</span>
              </Button>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Advanced</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => toast.promise(
                    new Promise((resolve) => setTimeout(resolve, 2000)),
                    {
                      loading: 'Loading data...',
                      success: 'Data loaded successfully!',
                      error: 'Failed to load data.',
                    }
                  )}
                >
                  Promise Toast
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => toast.success('Copied to clipboard!', { duration: 2000 })}
                >
                  Custom Duration (2s)
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => toast.success('With description', { description: 'This toast has a description below the title.' })}
                >
                  With Description
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const id = toast.loading('Loading...')
                    setTimeout(() => toast.success('Done!', { id }), 1500)
                  }}
                >
                  Update Toast
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <Card className="flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
              <div className="flex items-center gap-2">
                <History className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Test History</h2>
                {logs.length > 0 && (
                  <Badge variant="secondary" className="text-[10px]">
                    {logs.length} entries
                  </Badge>
                )}
              </div>
              {logs.length > 0 && (
                <Button
                  size="default"
                  variant="ghost"
                  onClick={handleClearLogs}
                  className="gap-1.5 text-xs text-muted-foreground"
                >
                  <Trash2 className="size-3.5" />
                  Clear All
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1 h-[calc(100vh-360px)]">
              <div className="p-4 space-y-3">
                {logs.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
                      <History className="size-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No test history yet.
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Results appear here after you send a test message.
                    </p>
                  </div>
                )}

                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={cn(
                      'rounded-lg border p-3 space-y-2 text-xs',
                      log.success
                        ? 'border-emerald-500/20 bg-emerald-500/5'
                        : 'border-destructive/20 bg-destructive/5'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {log.success ? (
                          <CheckCircle2 className="size-3.5 text-emerald-500" />
                        ) : (
                          <XCircle className="size-3.5 text-destructive" />
                        )}
                        <Badge variant="outline" className="text-[9px] font-mono">
                          {log.provider}
                        </Badge>
                        <span className="text-muted-foreground font-mono">{log.model}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="size-3" />
                        <span>{log.latencyMs}ms</span>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1 font-medium uppercase tracking-wide">You</p>
                      <p className="text-foreground">{log.message}</p>
                    </div>

                    {log.response && (
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1 font-medium uppercase tracking-wide">Response</p>
                        <p className="text-foreground whitespace-pre-wrap">{log.response}</p>
                      </div>
                    )}

                    {log.error && (
                      <div>
                        <p className="text-[10px] text-destructive mb-1 font-medium uppercase tracking-wide">Error</p>
                        <p className="text-destructive whitespace-pre-wrap">{log.error}</p>
                      </div>
                    )}

                    {log.usage && (
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1">
                        {log.usage.prompt_tokens && <span>Prompt: {log.usage.prompt_tokens}</span>}
                        {log.usage.completion_tokens && <span>Completion: {log.usage.completion_tokens}</span>}
                        {log.usage.total_tokens && <span>Total: {log.usage.total_tokens}</span>}
                      </div>
                    )}

                    <p className="text-[9px] text-muted-foreground/60">
                      {log.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}

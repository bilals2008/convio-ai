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
} from 'lucide-react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

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

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', color: '#10a37f' },
  { id: 'anthropic', name: 'Anthropic', color: '#d4a574' },
  { id: 'google', name: 'Google AI', color: '#4285f4' },
  { id: 'groq', name: 'Groq', color: '#f55036' },
  { id: 'kie', name: 'KIE AI', color: '#8b5cf6' },
  { id: 'openrouter', name: 'OpenRouter', color: '#71717a' },
  { id: 'mistral', name: 'Mistral', color: '#f59e0b' },
  { id: 'together', name: 'Together', color: '#0ea5e9' },
  { id: 'deepseek', name: 'DeepSeek', color: '#3b82f6' },
  { id: 'perplexity', name: 'Perplexity', color: '#06b6d4' },
  { id: 'local', name: 'Local API', color: '#22c55e' },
] as const

type ProviderId = (typeof PROVIDERS)[number]['id']

const ENV_KEY_MAP: Record<ProviderId, string> = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  google: 'GOOGLE_API_KEY',
  groq: 'GROQ_API_KEY',
  kie: 'KIE_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  mistral: 'MISTRAL_API_KEY',
  together: 'TOGETHER_API_KEY',
  deepseek: 'DEEPSEEK_API_KEY',
  perplexity: 'PERPLEXITY_API_KEY',
  local: 'LOCAL_API_URL',
}

export default function PlaygroundPage() {
  const [provider, setProvider] = useState<ProviderId>('groq')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [message, setMessage] = useState('Hello! What is 2+2? Reply with just the number.')
  const [showKey, setShowKey] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [copied, setCopied] = useState(false)
  const [models, setModels] = useState<string[]>([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const modelsFetchRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedProvider = PROVIDERS.find((p) => p.id === provider)!
  const currentModel = model || models[0] || ''

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // Fetch models from backend when API key or provider changes (debounced)
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
    navigator.clipboard.writeText(`${envVar}=${apiKey || 'http://localhost:20128'}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [provider, apiKey])

  const handleClearLogs = useCallback(() => setLogs([]), [])

  return (
    <PageContainer>
      <PageHeader
        title="AI Playground"
        description="Test API keys and models from all providers"
      />

      <div className="grid lg:grid-cols-[400px_1fr] gap-6">
        {/* Left: Config */}
        <div className="space-y-4">
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                <Globe className="size-4 text-primary" />
              </div>
              <h2 className="text-sm font-semibold">Provider</h2>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {PROVIDERS.map((p) => (
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
                    'flex flex-col items-center gap-1 rounded-lg p-2 text-[10px] font-medium transition-all',
                    provider === p.id
                      ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  {p.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                <Key className="size-4 text-primary" />
              </div>
              <h2 className="text-sm font-semibold">API Key</h2>
              <Badge variant="secondary" className="text-[10px] ml-auto">
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
                      className="h-9 text-sm font-mono pr-9"
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
                    size="icon-sm"
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
                    <SelectItem key={m} value={m} className="text-sm">
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Card>

          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                  <Send className="size-4 text-primary" />
                </div>
                <h2 className="text-sm font-semibold">Test Message</h2>
              </div>
              <Button
                size="sm"
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
              rows={3}
              placeholder="Enter a test message..."
              className="text-sm resize-none"
            />

            {currentModel && (
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span>
                  Using <strong>{currentModel}</strong> via <strong>{selectedProvider.name}</strong>
                </span>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Logs */}
        <Card className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
            <div className="flex items-center gap-2">
              <Terminal className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Logs</h2>
              {logs.length > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {logs.length}
                </Badge>
              )}
            </div>
            {logs.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearLogs}
                className="gap-1.5 text-xs text-muted-foreground"
              >
                <Trash2 className="size-3.5" />
                Clear
              </Button>
            )}
          </div>

          <ScrollArea className="flex-1 h-[calc(100vh-300px)]">
            <div className="p-4 space-y-3">
              {logs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
                    <Terminal className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No logs yet. Send a test message to see results.
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
    </PageContainer>
  )
}

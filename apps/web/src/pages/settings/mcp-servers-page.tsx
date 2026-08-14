import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Plug,
  Pencil,
  Trash2,
  Wifi,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Link2,
  Unlink,
  ShieldCheck,
  ChevronDown,
  LayoutTemplate,
  Search,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { PageContainer } from '@/components/shared/page-container'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/shared/loading'
import { SearchInput } from '@/components/shared/search-input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { mcpServers as mcpApi } from '@/lib/api'
import { mcpServerTemplates } from '@/lib/mcp-templates'
import { McpHelpButton, McpHelpModal } from '@/components/mcp/mcp-help-modal'
import { useOrg } from '@/lib/org-context'
import { useOAuthStatuses } from '@/lib/hooks/use-mcp-oauth'
import { toast } from '@/lib/toast'
import { cn, formatRelativeTime } from '@/lib/utils'

interface McpServer {
  id: string
  name: string
  type: string
  command: string | null
  args: string[]
  url: string | null
  authType: string
  headers: Record<string, string>
  apiKey: string | null
  enabled: boolean
  oauthState: OAuthState | null
  lastTestResult: TestResult | null
  lastTestedAt: string | null
  createdAt: string
}

interface OAuthState {
  clientInformation?: { client_id?: string }
  tokens?: { access_token?: string; refresh_token?: string }
}

interface TestResult {
  connected: boolean
  tools?: Array<{ name: string; description?: string; inputSchema?: Record<string, unknown> }>
  error?: string
  needsAuth?: boolean
  redirectUrl?: string
}

const SERVER_TYPES = [
  { id: 'stdio', name: 'Stdio (Local Command)' },
  { id: 'streamable-http', name: 'Streamable HTTP' },
]

const AUTH_TYPES = [
  { id: 'none', name: 'None' },
  { id: 'header', name: 'Header (Bearer / custom)' },
  { id: 'oauth', name: 'OAuth 2.0' },
]

const MCP_ICON = 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/mcp-model-context-protocol/default.svg'
const ICON_CDN = 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons'

// ponytail: naive name/url match against known templates; add a provider field on McpServer if matching gets wrong
function providerFor(server: McpServer): string | null {
  const name = server.name.toLowerCase()
  const endpoint = (server.url ?? server.command ?? '').toLowerCase()
  const hit = mcpServerTemplates.find(
    (t) =>
      name.includes(t.name.toLowerCase()) ||
      endpoint.includes(t.name.toLowerCase()) ||
      endpoint.includes(t.provider)
  )
  return hit ? hit.provider : null
}

export default function McpServersPage() {
  const { orgId, isLoading: orgLoading } = useOrg()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [, setSearchParams] = useSearchParams()

  const { data: servers, isLoading } = useQuery({
    queryKey: ['mcp-servers', orgId],
    queryFn: async () => {
      const res = await mcpApi.list(orgId!)
      return (res.data.data || []) as McpServer[]
    },
    enabled: !!orgId,
  })

  const oauthServerIds = (servers ?? [])
    .filter((s) => s.authType === 'oauth')
    .map((s) => s.id)
  const { data: oauthStatuses } = useOAuthStatuses(oauthServerIds)
  const isOauthAuthorized = (server: McpServer) => oauthStatuses?.get(server.id)?.authorized ?? false

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('stdio')
  const [command, setCommand] = useState('')
  const [args, setArgs] = useState('')
  const [url, setUrl] = useState('')
  const [authType, setAuthType] = useState('none')
  const [headersText, setHeadersText] = useState('')
  const [apiKey, setApiKey] = useState('')

  const [editServer, setEditServer] = useState<McpServer | null>(null)
  const [authorizingId, setAuthorizingId] = useState<string | null>(null)

  const [testModal, setTestModal] = useState<{ open: boolean; server: McpServer | null }>({
    open: false,
    server: null,
  })
  const [helpOpen, setHelpOpen] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [testing, setTesting] = useState(false)

  function resetForm() {
    setName('')
    setType('stdio')
    setCommand('')
    setArgs('')
    setUrl('')
    setAuthType('none')
    setHeadersText('')
    setApiKey('')
  }

  function headersFromText(): Record<string, string> {
    const headers: Record<string, string> = {}
    for (const line of headersText.split('\n')) {
      const idx = line.indexOf(':')
      if (idx > 0) {
        const k = line.slice(0, idx).trim()
        const v = line.slice(idx + 1).trim()
        if (k && v) headers[k] = v
      }
    }
    return headers
  }

  function headersToText(headers: Record<string, string> | undefined): string {
    if (!headers) return ''
    return Object.entries(headers).map(([k, v]) => `${k}: ${v}`).join('\n')
  }

  const oauthParams = new URLSearchParams(window.location.search)
  useEffect(() => {
    const status = oauthParams.get('oauth')
    if (status === 'success') {
      toast.success('MCP server authorized successfully')
      queryClient.invalidateQueries({ queryKey: ['mcp-servers', orgId] })
      queryClient.invalidateQueries({ queryKey: ['mcp-oauth-statuses'] })
      window.history.replaceState({}, '', window.location.pathname)
    } else if (status === 'error') {
      toast.error(`OAuth failed: ${oauthParams.get('reason') || 'unknown error'}`)
      queryClient.invalidateQueries({ queryKey: ['mcp-servers', orgId] })
      queryClient.invalidateQueries({ queryKey: ['mcp-oauth-statuses'] })
      window.history.replaceState({}, '', window.location.pathname)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount to handle OAuth callback
  }, [])

  useEffect(() => {
    const templateId = oauthParams.get('template')
    if (!templateId) return
    const template = mcpServerTemplates.find((t) => t.id === templateId)
    if (!template) return
    setName(template.name)
    setType(template.type)
    setUrl(template.url || '')
    setCommand(template.command || '')
    setArgs((template.args || []).join(', '))
    setAuthType(template.authType)
    setOpen(true)
    oauthParams.delete('template')
    setSearchParams(oauthParams, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const createMutation = useMutation({
    mutationFn: () => {
      if (!orgId) throw new Error('No organization selected')
      const data: Record<string, unknown> = { name, type, authType }
      if (type === 'stdio') {
        data.command = command
        data.args = args ? args.split(',').map((a) => a.trim()) : []
      } else {
        data.url = url
        if (authType === 'header') {
          data.apiKey = apiKey || undefined
          data.headers = headersFromText()
        } else {
          data.apiKey = undefined
          data.headers = undefined
        }
      }
      return mcpApi.create(orgId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-servers', orgId] })
      setOpen(false)
      resetForm()
      toast.success('MCP server created')
    },
    onError: (err) => toast.error(`Failed: ${(err as Error).message}`),
  })

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editServer) throw new Error('No server selected')
      const data: Record<string, unknown> = { name, type, authType }
      if (type === 'stdio') {
        data.command = command
        data.args = args ? args.split(',').map((a) => a.trim()) : []
      } else {
        data.url = url
        if (authType === 'header') {
          data.apiKey = apiKey || undefined
          data.headers = headersFromText()
        } else {
          data.apiKey = undefined
          data.headers = undefined
        }
      }
      return mcpApi.update(editServer.id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-servers', orgId] })
      setEditServer(null)
      resetForm()
      toast.success('MCP server updated')
    },
    onError: (err) => toast.error(`Failed: ${(err as Error).message}`),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mcpApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-servers', orgId] })
      toast.success('MCP server deleted')
    },
    onError: (err) => toast.error(`Failed: ${(err as Error).message}`),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      mcpApi.update(id, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-servers', orgId] })
    },
    onError: (err) => toast.error(`Failed: ${(err as Error).message}`),
  })

  const disconnectMutation = useMutation({
    mutationFn: (id: string) => mcpApi.disconnect(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-servers', orgId] })
      queryClient.invalidateQueries({ queryKey: ['mcp-oauth-statuses'] })
      toast.success('OAuth disconnected')
    },
    onError: (err) => toast.error(`Failed: ${(err as Error).message}`),
  })

  async function handleAuthorize(server: McpServer, force = false) {
    setAuthorizingId(server.id)
    try {
      const res = await mcpApi.authorize(server.id, force)
      const data = res.data.data as { status: string; redirectUrl?: string }
      if (data.status === 'redirect' && data.redirectUrl) {
        window.location.href = data.redirectUrl
        return
      }
      queryClient.invalidateQueries({ queryKey: ['mcp-servers', orgId] })
      queryClient.invalidateQueries({ queryKey: ['mcp-oauth-statuses'] })
      toast.success('Already authorized')
    } catch (err) {
      toast.error(`Failed: ${(err as Error).message}`)
    } finally {
      setAuthorizingId(null)
    }
  }

  async function handleTest(server: McpServer) {
    setTestModal({ open: true, server })
    setTestResult(null)
    setTesting(true)
    try {
      const res = await mcpApi.test(server.id)
      setTestResult(res.data.data as TestResult)
      queryClient.invalidateQueries({ queryKey: ['mcp-servers', orgId] })
    } catch {
      setTestResult({ connected: false, error: 'Connection failed' })
      queryClient.invalidateQueries({ queryKey: ['mcp-servers', orgId] })
    } finally {
      setTesting(false)
    }
  }

  function openEdit(server: McpServer) {
    setEditServer(server)
    setName(server.name)
    setType(server.type)
    setCommand(server.command || '')
    setArgs(Array.isArray(server.args) ? server.args.join(', ') : '')
    setUrl(server.url || '')
    setAuthType(server.authType || 'none')
    setHeadersText(headersToText(server.headers))
    setApiKey(server.apiKey || '')
  }

  const filtered = useMemo(() => {
    let list = servers ?? []
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.url ?? '').toLowerCase().includes(q) ||
          (s.command ?? '').toLowerCase().includes(q)
      )
    }
    if (typeFilter !== 'all') list = list.filter((s) => s.type === typeFilter)
    if (statusFilter !== 'all') {
      list = list.filter((s) => {
        if (statusFilter === 'enabled') return s.enabled
        if (statusFilter === 'disabled') return !s.enabled
        if (statusFilter === 'connected') return !!s.lastTestResult?.connected
        if (statusFilter === 'failed') return !!s.lastTestResult && !s.lastTestResult.connected
        return true
      })
    }
    return list
  }, [servers, search, typeFilter, statusFilter])

  const pageLoading = orgLoading || isLoading

  function statusInfo(server: McpServer) {
    if (server.lastTestResult?.connected)
      return { text: `Connected · ${server.lastTestResult.tools?.length ?? 0} tools`, className: 'text-success' }
    if (server.lastTestResult)
      return { text: 'Last test failed', className: 'text-destructive' }
    if (server.authType === 'oauth') {
      return isOauthAuthorized(server)
        ? { text: 'OAuth connected', className: 'text-success' }
        : { text: 'OAuth pending', className: 'text-warning' }
    }
    return { text: server.lastTestedAt ? `Tested ${formatRelativeTime(server.lastTestedAt)}` : 'Not tested', className: 'text-muted-foreground' }
  }

  function endpointOf(server: McpServer) {
    return server.type === 'stdio' ? server.command || 'stdio' : server.url || ''
  }

  return (
    <PageContainer>
      <PageHeader
        className="sm:flex-row sm:items-center sm:justify-between gap-3"
        title="MCP Servers"
        description="Connect your agents to external tools through the Model Context Protocol."
        action={
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <McpHelpButton onClick={() => setHelpOpen(true)} />
            <Button variant="outline" onClick={() => navigate('/mcp-servers/templates')}>
              <LayoutTemplate className="size-4 shrink-0" />
              Templates
            </Button>
            <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
              <Button onClick={() => setOpen(true)}>
                <Plus className="size-4 shrink-0" />
                Add Server
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add MCP Server</DialogTitle>
                  <DialogDescription>
                    Connect to an MCP server to expose its tools to your agents.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My MCP Server" />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={type} onValueChange={(v) => v && setType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVER_TYPES.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {type === 'stdio' ? (
                    <>
                      <div className="space-y-2">
                        <Label>Command</Label>
                        <Input value={command} onChange={(e) => setCommand(e.target.value)} placeholder="npx" />
                      </div>
                      <div className="space-y-2">
                        <Label>Args (comma-separated)</Label>
                        <Input value={args} onChange={(e) => setArgs(e.target.value)} placeholder="-y, @modelcontextprotocol/server-github" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>URL</Label>
                        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://mcp.example.com" />
                      </div>
                      <div className="space-y-2">
                        <Label>Authentication</Label>
                        <Select value={authType} onValueChange={(v) => v && setAuthType(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {AUTH_TYPES.map((t) => (
                              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {authType === 'header' && (
                        <>
                          <div className="space-y-2">
                            <Label>API Key (sends as Bearer token)</Label>
                            <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." type="password" />
                          </div>
                          <div className="space-y-2">
                            <Label>Custom headers (one per line, Name: value)</Label>
                            <Input value={headersText} onChange={(e) => setHeadersText(e.target.value)} placeholder={"X-Api-Key: abc123\nAuthorization: Bearer xyz"} className="font-mono" />
                          </div>
                        </>
                      )}
                      {authType === 'oauth' && (
                        <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                          Save the server, then use the Connect (shield) button to authorize via OAuth 2.0.
                        </p>
                      )}
                    </>
                  )}
                  </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setOpen(false); resetForm() }}>Cancel</Button>
                  <Button onClick={() => createMutation.mutate()} disabled={!name || createMutation.isPending}>
                    {createMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="flex items-start gap-3 rounded-xl border border-warning/25 bg-warning/5 px-4 py-3 text-sm text-warning">
        <AlertTriangle className="size-4 mt-0.5 shrink-0" />
        <p className="text-sm text-foreground/80">
          MCP Servers is in <strong>Beta</strong>. Features may change or break without notice.
        </p>
      </div>

      {pageLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : !servers || servers.length === 0 ? (
        <Card className="rounded-xl border-dashed">
          <CardContent>
            <EmptyState
              icon={Plug}
              title="No MCP servers yet"
              description="Connect your agents to external tools like Notion, GitHub, and Linear. Add one from a template or configure a custom server."
              action={{
                label: 'Browse templates',
                onClick: () => navigate('/mcp-servers/templates'),
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex-1">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search servers, URLs, or commands..."
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="stdio">Stdio</SelectItem>
                  <SelectItem value="streamable-http">HTTP</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                  <SelectItem value="connected">Connected</SelectItem>
                  <SelectItem value="failed">Test failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <Card className="rounded-xl border-dashed">
              <CardContent>
                <EmptyState
                  icon={Search}
                  title="No servers match your filters"
                  description="Try a different search term or clear the filters."
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((server) => {
                const status = statusInfo(server)
                const oauthAuthed = isOauthAuthorized(server)
                const toggling = toggleMutation.isPending
                const provider = providerFor(server)
                return (
                  <div
                    key={server.id}
                    className="group relative flex flex-col rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-soft-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                        <img
                          src={provider ? `${ICON_CDN}/${provider}/default.svg` : MCP_ICON}
                          alt={provider ?? 'MCP'}
                          className={cn('size-5', (!provider || provider === 'github') && 'dark:invert dark:brightness-200')}
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold">{server.name}</h3>
                        <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                          {endpointOf(server)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {server.type === 'stdio' ? 'Stdio' : 'HTTP'}
                      </Badge>
                      {server.authType !== 'none' && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {server.authType === 'oauth' ? (
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="size-3" />
                              OAuth
                            </span>
                          ) : (
                            'API Key'
                          )}
                        </Badge>
                      )}
                      {server.authType === 'oauth' && (
                        oauthAuthed ? (
                          <Badge variant="active" className="text-[10px] px-1.5 py-0">
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="inactive" className="text-[10px] px-1.5 py-0">
                            Pending
                          </Badge>
                        )
                      )}
                    </div>

                    <p className={cn('mt-3 text-xs', status.className)}>{status.text}</p>

                    <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                      <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                        <Switch
                          size="sm"
                          checked={server.enabled}
                          disabled={toggling}
                          onCheckedChange={(c) => toggleMutation.mutate({ id: server.id, enabled: c })}
                        />
                        Enabled
                      </label>
                      <div className="flex items-center gap-0.5">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 text-muted-foreground hover:text-foreground"
                                  onClick={() => handleTest(server)}
                                >
                                  <Wifi className="size-3.5" />
                                </Button>
                              }
                            />
                            <TooltipContent side="top" className="text-xs">Test connection</TooltipContent>
                          </Tooltip>
                          {server.authType === 'oauth' && (
                            oauthAuthed ? (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                      onClick={() => disconnectMutation.mutate(server.id)}
                                      disabled={disconnectMutation.isPending}
                                    >
                                      {disconnectMutation.isPending
                                        ? <Loader2 className="size-3.5 animate-spin" />
                                        : <Unlink className="size-3.5" />}
                                    </Button>
                                  }
                                />
                                <TooltipContent side="top" className="text-xs">Disconnect OAuth</TooltipContent>
                              </Tooltip>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-7 text-warning hover:text-warning hover:bg-warning/10"
                                      onClick={() => handleAuthorize(server)}
                                      disabled={authorizingId === server.id}
                                    >
                                      {authorizingId === server.id
                                        ? <Loader2 className="size-3.5 animate-spin" />
                                        : <ShieldCheck className="size-3.5" />}
                                    </Button>
                                  }
                                />
                                <TooltipContent side="top" className="text-xs">Connect with OAuth</TooltipContent>
                              </Tooltip>
                            )
                          )}
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 text-muted-foreground hover:text-foreground"
                                  onClick={() => openEdit(server)}
                                >
                                  <Pencil className="size-3.5" />
                                </Button>
                              }
                            />
                            <TooltipContent side="top" className="text-xs">Edit</TooltipContent>
                          </Tooltip>
                          <AlertDialog>
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <AlertDialogTrigger
                                    render={
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                      >
                                        <Trash2 className="size-3.5" />
                                      </Button>
                                    }
                                  />
                                }
                              />
                              <TooltipContent side="top" className="text-xs">Delete</TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete MCP server?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove{' '}
                                  <span className="font-medium">{server.name}</span> and unlink it from all
                                  agents.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  variant="destructive"
                                  onClick={() => deleteMutation.mutate(server.id)}
                                  disabled={deleteMutation.isPending}
                                >
                                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editServer} onOpenChange={(o) => { if (!o) { setEditServer(null); resetForm() } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit MCP Server</DialogTitle>
            <DialogDescription>Update the server configuration.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => v && setType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SERVER_TYPES.map((t) => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            {type === 'stdio' ? (
              <>
                <div className="space-y-2">
                  <Label>Command</Label>
                  <Input value={command} onChange={(e) => setCommand(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Args (comma-separated)</Label>
                  <Input value={args} onChange={(e) => setArgs(e.target.value)} />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input value={url} onChange={(e) => setUrl(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Authentication</Label>
                  <Select value={authType} onValueChange={(v) => v && setAuthType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AUTH_TYPES.map((t) => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                {authType === 'header' && (
                  <>
                    <div className="space-y-2">
                      <Label>API Key (sends as Bearer token)</Label>
                      <Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Custom headers (one per line, Name: value)</Label>
                      <Input value={headersText} onChange={(e) => setHeadersText(e.target.value)} className="font-mono" />
                    </div>
                  </>
                )}
                {authType === 'oauth' && (
                  <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                    Use the Connect (shield) button in the table to authorize this server.
                  </p>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditServer(null); resetForm() }}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate()} disabled={!name || updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Connection Modal */}
      <Dialog open={testModal.open} onOpenChange={(o) => setTestModal((prev) => ({ ...prev, open: o }))}>
        <DialogContent className="sm:max-w-[70vw] sm:max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Test Connection</DialogTitle>
            <DialogDescription>
              Testing connection to <span className="font-medium">{testModal.server?.name}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 flex-1">
            {testing ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Connecting to server...</p>
              </div>
            ) : testResult ? (
              <>
                <div className={cn(
                  'flex items-center gap-3 rounded-lg border p-4',
                  testResult.connected
                    ? 'border-success/30 bg-success/5'
                    : testResult.needsAuth
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : 'border-destructive/30 bg-destructive/5'
                )}>
                  {testResult.connected ? (
                    <CheckCircle2 className="size-5 text-success shrink-0" />
                  ) : (
                    <XCircle className={cn('size-5 shrink-0', testResult.needsAuth ? 'text-amber-500' : 'text-destructive')} />
                  )}
                  <div className="min-w-0">
                    <p className={cn(
                      'text-sm font-medium',
                      testResult.connected ? 'text-success' : testResult.needsAuth ? 'text-amber-500' : 'text-destructive'
                    )}>
                      {testResult.connected ? 'Connected Successfully' : testResult.needsAuth ? 'OAuth Required' : 'Connection Failed'}
                    </p>
                    {testResult.error && (
                      <p className="text-xs text-muted-foreground mt-0.5">{testResult.error}</p>
                    )}
                    {testResult.needsAuth && testResult.redirectUrl && (
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => { window.location.href = testResult.redirectUrl! }}
                      >
                        <Link2 className="size-3.5 mr-1.5" />
                        Connect with OAuth
                      </Button>
                    )}
                  </div>
                </div>

                {testResult.connected && testResult.tools && testResult.tools.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Available Tools
                      </p>
                      <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium">
                        {testResult.tools.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                      {testResult.tools.map((tool) => (
                        <ToolDocCard key={tool.name} tool={tool} />
                      ))}
                    </div>
                  </div>
                )}

                {testResult.connected && testResult.tools && testResult.tools.length === 0 && (
                  <div className="rounded-lg border border-border p-4 text-center">
                    <p className="text-sm text-muted-foreground">Connected but no tools exposed.</p>
                  </div>
                )}
              </>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTestModal({ open: false, server: null })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <McpHelpModal open={helpOpen} onOpenChange={setHelpOpen} />
    </PageContainer>
  )
}

function ToolDocCard({ tool }: { tool: NonNullable<TestResult['tools']>[number] }) {
  const [open, setOpen] = useState(false)
  const schema = tool.inputSchema as { properties?: Record<string, { type?: string; description?: string }>; required?: string[] } | undefined
  const props = schema?.properties ?? {}
  const required = schema?.required ?? []
  const entries = Object.entries(props)

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-colors">
      <div className="p-3.5">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="rounded-md bg-primary/10 p-1.5 shrink-0">
            <Plug className="size-4 text-primary" />
          </div>
          <code className="text-sm font-semibold break-all leading-snug">{tool.name}</code>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed text-pretty">
          {tool.description || 'No description provided.'}
        </p>
      </div>
      {entries.length > 0 && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-2 border-t border-border px-3.5 py-2 text-left text-xs font-medium text-muted-foreground hover:bg-muted/30 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
            Parameters
          </span>
          <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px]">{entries.length}</span>
        </button>
      )}
      {open && entries.length > 0 && (
        <div className="divide-y divide-border border-t border-border">
          {entries.map(([key, prop]) => (
            <div key={key} className="px-3.5 py-2 flex items-start gap-2">
              <code className="text-xs font-medium text-primary whitespace-nowrap shrink-0">{key}</code>
              {required.includes(key) && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">required</Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {prop.type ? <span className="text-muted-foreground/60">({prop.type}) </span> : null}
                {prop.description || '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
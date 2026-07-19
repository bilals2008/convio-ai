import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Plug, Trash2, Pencil, Wifi, WifiOff, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/shared/loading'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
import { mcpServers as mcpApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { toast } from '@/lib/toast'

interface McpServer {
  id: string
  name: string
  type: string
  command: string | null
  args: string[]
  url: string | null
  apiKey: string | null
  enabled: boolean
  createdAt: string
}

interface TestResult {
  connected: boolean
  tools?: Array<{ name: string; description?: string }>
  error?: string
}

const SERVER_TYPES = [
  { id: 'stdio', name: 'Stdio (Local Command)' },
  { id: 'streamable-http', name: 'Streamable HTTP' },
]

export default function McpServersPage() {
  const { orgId, isLoading: orgLoading } = useOrg()
  const queryClient = useQueryClient()

  const { data: servers, isLoading } = useQuery({
    queryKey: ['mcp-servers', orgId],
    queryFn: async () => {
      const res = await mcpApi.list(orgId!)
      return (res.data.data || []) as McpServer[]
    },
    enabled: !!orgId,
  })

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('stdio')
  const [command, setCommand] = useState('')
  const [args, setArgs] = useState('')
  const [url, setUrl] = useState('')
  const [apiKey, setApiKey] = useState('')

  const [editServer, setEditServer] = useState<McpServer | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})

  function resetForm() {
    setName('')
    setType('stdio')
    setCommand('')
    setArgs('')
    setUrl('')
    setApiKey('')
  }

  const createMutation = useMutation({
    mutationFn: () => {
      if (!orgId) throw new Error('No organization selected')
      const data: Record<string, unknown> = { name, type }
      if (type === 'stdio') {
        data.command = command
        data.args = args ? args.split(',').map((a) => a.trim()) : []
      } else {
        data.url = url
        data.apiKey = apiKey || undefined
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
      const data: Record<string, unknown> = { name }
      if (type === 'stdio') {
        data.command = command
        data.args = args ? args.split(',').map((a) => a.trim()) : []
      } else {
        data.url = url
        data.apiKey = apiKey || undefined
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

  async function handleTest(id: string) {
    setTestingId(id)
    try {
      const res = await mcpApi.test(id)
      setTestResults((prev) => ({ ...prev, [id]: res.data.data as TestResult }))
    } catch {
      setTestResults((prev) => ({ ...prev, [id]: { connected: false, error: 'Connection failed' } }))
    } finally {
      setTestingId(null)
    }
  }

  function openEdit(server: McpServer) {
    setEditServer(server)
    setName(server.name)
    setType(server.type)
    setCommand(server.command || '')
    setArgs(Array.isArray(server.args) ? server.args.join(', ') : '')
    setUrl(server.url || '')
    setApiKey(server.apiKey || '')
  }

  if (orgLoading || isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="MCP Servers" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        className="flex-row items-center justify-between gap-3"
        title="MCP Servers"
        description="Connect agents to external tools via Model Context Protocol."
        action={
            <div className="shrink-0">
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
                        <Label>API Key (optional)</Label>
                        <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." type="password" />
                      </div>
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

      <Card>
        <CardHeader>
          <CardTitle>Your MCP Servers</CardTitle>
          <CardDescription>
            MCP servers expose tools that agents can use. Add a server, test the connection, then link it to agents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!servers || servers.length === 0 ? (
            <EmptyState icon={Plug} title="No MCP servers" description="Add an MCP server to get started." />
          ) : (
            <div className="space-y-3">
              {servers.map((server) => {
                const testResult = testResults[server.id]
                return (
                  <div key={server.id} className="flex items-center justify-between gap-2 rounded-lg border p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Plug className="size-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{server.name}</span>
                          <Badge variant="outline" className="text-[10px]">{server.type}</Badge>
                        </div>
                        <p className="truncate text-xs text-muted-foreground font-mono">
                          {server.type === 'stdio' ? server.command : server.url}
                        </p>
                        {testResult && (
                          <div className="flex items-center gap-1.5 mt-1">
                            {testResult.connected ? (
                              <>
                                <Wifi className="size-3 text-success" />
                                <span className="text-[11px] text-success">{testResult.tools?.length || 0} tools</span>
                              </>
                            ) : (
                              <>
                                <WifiOff className="size-3 text-destructive" />
                                <span className="text-[11px] text-destructive">{testResult.error || 'Failed'}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger render={
                            <Button size="icon" variant="ghost" onClick={() => handleTest(server.id)} disabled={testingId === server.id}>
                              {testingId === server.id ? <Loader2 className="size-3.5 animate-spin" /> : <Wifi className="size-3.5" />}
                            </Button>
                          } />
                          <TooltipContent className="text-xs">Test connection</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger render={
                            <Button size="icon" variant="ghost" onClick={() => openEdit(server)}>
                              <Pencil className="size-3.5 text-muted-foreground" />
                            </Button>
                          } />
                          <TooltipContent className="text-xs">Edit</TooltipContent>
                        </Tooltip>
                        <AlertDialog>
                          <Tooltip>
                            <TooltipTrigger render={
                              <AlertDialogTrigger render={<Button size="icon" variant="ghost"><Trash2 className="size-3.5 text-destructive" /></Button>} />
                            } />
                            <TooltipContent className="text-xs">Delete</TooltipContent>
                          </Tooltip>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete MCP server?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove <span className="font-medium">{server.name}</span> and unlink it from all agents.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction variant="destructive" onClick={() => deleteMutation.mutate(server.id)} disabled={deleteMutation.isPending}>
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TooltipProvider>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

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
                  <Label>API Key</Label>
                  <Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                </div>
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
    </div>
  )
}

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
  type Column,
} from '@/lib/table'
import {
  Plus,
  Plug,
  Pencil,
  Trash2,
  Wifi,
  WifiOff,
  Loader2,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  XCircle,
  Search,
  X,
  AlertTriangle,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/shared/loading'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { useOrg } from '@/lib/org-context'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'

interface McpServer {
  id: string
  name: string
  type: string
  command: string | null
  args: string[]
  url: string | null
  apiKey: string | null
  enabled: boolean
  lastTestResult: TestResult | null
  lastTestedAt: string | null
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

function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: {
  column: Column<TData, TValue>
  title: string
  className?: string
}) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-1.5 -ml-1.5 font-medium text-muted-foreground hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <span>{title}</span>
        {column.getIsSorted() === 'desc' ? (
          <ArrowDown className="ml-1 size-3.5" />
        ) : column.getIsSorted() === 'asc' ? (
          <ArrowUp className="ml-1 size-3.5" />
        ) : (
          <ArrowUpDown className="ml-1 size-3.5 text-muted-foreground/50" />
        )}
      </Button>
    </div>
  )
}

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

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('stdio')
  const [command, setCommand] = useState('')
  const [args, setArgs] = useState('')
  const [url, setUrl] = useState('')
  const [apiKey, setApiKey] = useState('')

  const [editServer, setEditServer] = useState<McpServer | null>(null)

  const [testModal, setTestModal] = useState<{ open: boolean; server: McpServer | null }>({
    open: false,
    server: null,
  })
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [testing, setTesting] = useState(false)

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

  const clearTestMutation = useMutation({
    mutationFn: (id: string) => mcpApi.clearTest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-servers', orgId] })
      toast.success('Test result cleared')
    },
    onError: (err) => toast.error(`Failed: ${(err as Error).message}`),
  })

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
    setApiKey(server.apiKey || '')
  }

  const columns: ColumnDef<McpServer, unknown>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const lastTest = row.original.lastTestResult
        return (
          <div className="flex items-center gap-3">
            <div className="relative flex size-9 items-center justify-center rounded-lg bg-primary/[0.04] shrink-0">
              <img
                src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/mcp-model-context-protocol/default.svg"
                alt="MCP"
                className="size-4 dark:invert dark:brightness-200"
              />
              {lastTest && (
                <span
                  className={cn(
                    'absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-card',
                    lastTest.connected ? 'bg-success' : 'bg-destructive'
                  )}
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{row.original.name}</p>
              <p className="truncate text-xs text-muted-foreground font-mono">
                {row.original.type === 'stdio' ? row.original.command : row.original.url}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'type',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
          {row.original.type === 'stdio' ? 'Stdio' : 'HTTP'}
        </Badge>
      ),
    },
    {
      id: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      enableSorting: false,
      cell: ({ row }) => (
        <Badge
          variant={row.original.enabled ? 'active' : 'inactive'}
          className="text-[10px] px-1.5 py-0"
        >
          {row.original.enabled ? 'Enabled' : 'Disabled'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      enableHiding: false,
      size: 120,
      cell: ({ row }) => {
        const server = row.original
        return (
          <TooltipProvider>
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleTest(server)}
                    >
                      <Wifi className="size-3.5" />
                    </Button>
                  }
                />
                <TooltipContent side="top" className="text-xs">Test connection</TooltipContent>
              </Tooltip>
              {server.lastTestResult?.connected && (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => clearTestMutation.mutate(server.id)}
                      >
                        <WifiOff className="size-3.5" />
                      </Button>
                    }
                  />
                  <TooltipContent side="top" className="text-xs">Disconnect</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
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
                            className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
            </div>
          </TooltipProvider>
        )
      },
    },
  ]

  const table = useReactTable({
    data: servers || [],
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

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

      <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
        <AlertTriangle className="size-4 mt-0.5 shrink-0" />
        <p>MCP Servers is currently in <strong>Beta</strong>. Features may change or break without notice. Use in production at your own risk.</p>
      </div>

      <div className="space-y-3">
        {!servers || servers.length === 0 ? (
          <EmptyState icon={Plug} title="No MCP servers" description="Add an MCP server to get started." />
        ) : (
          <div className="space-y-3">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search servers..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-8 pr-8"
              />
              {globalFilter && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 size-6 -translate-y-1/2"
                  onClick={() => setGlobalFilter('')}
                >
                  <X className="size-3" />
                </Button>
              )}
            </div>
            <Card className="rounded-xl border-border/60">
              <CardContent className="p-0">
                <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="hover:bg-transparent border-b border-border"
                    >
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className={cn(
                            'text-muted-foreground font-medium h-11 px-4 text-sm',
                            header.column.getCanSort() && 'cursor-pointer select-none'
                          )}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="px-4 py-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                        {globalFilter ? `No servers matching "${globalFilter}"` : 'No servers found.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          </div>
        )}
      </div>

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

      {/* Test Connection Modal */}
      <Dialog open={testModal.open} onOpenChange={(o) => setTestModal((prev) => ({ ...prev, open: o }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Test Connection</DialogTitle>
            <DialogDescription>
              Testing connection to <span className="font-medium">{testModal.server?.name}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
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
                    : 'border-destructive/30 bg-destructive/5'
                )}>
                  {testResult.connected ? (
                    <CheckCircle2 className="size-5 text-success shrink-0" />
                  ) : (
                    <XCircle className="size-5 text-destructive shrink-0" />
                  )}
                  <div>
                    <p className={cn(
                      'text-sm font-medium',
                      testResult.connected ? 'text-success' : 'text-destructive'
                    )}>
                      {testResult.connected ? 'Connected Successfully' : 'Connection Failed'}
                    </p>
                    {testResult.error && (
                      <p className="text-xs text-muted-foreground mt-0.5">{testResult.error}</p>
                    )}
                  </div>
                </div>

                {testResult.connected && testResult.tools && testResult.tools.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Available Tools ({testResult.tools.length})
                    </p>
                    <div className="max-h-56 overflow-y-auto rounded-lg border border-border">
                      <table className="w-full text-sm">
                        <tbody>
                          {testResult.tools.map((tool) => (
                            <tr key={tool.name} className="border-b border-border last:border-0 hover:bg-muted/30">
                              <td className="px-3 py-2 align-top">
                                <div className="flex items-center gap-2">
                                  <Plug className="size-3.5 text-primary shrink-0" />
                                  <span className="font-medium whitespace-nowrap">{tool.name}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2 text-muted-foreground text-xs align-top w-full">
                                {tool.description || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
    </div>
  )
}

import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deployments as deploymentsApi, agents as agentsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Plus, Trash2, Loader2, Copy, Check, Globe, Calendar, Braces, RefreshCw, Phone, type LucideIcon } from 'lucide-react'
import { DeploymentForm } from '@/components/settings/deployment-form'
import { DeploymentDetail } from '@/components/settings/deployment-detail'
import { SearchFilterBar } from '@/components/shared/search-filter-bar'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CDN = 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons'

const channelLogos: Record<string, { logo: string | null; icon?: LucideIcon; fallback: string }> = {
  web: { logo: null, icon: Globe, fallback: 'W' },
  whatsapp: { logo: `${CDN}/whatsapp/default.svg`, fallback: 'WA' },
  slack: { logo: `${CDN}/slack/default.svg`, fallback: 'S' },
  discord: { logo: `${CDN}/discord/default.svg`, fallback: 'D' },
  telegram: { logo: `${CDN}/telegram/default.svg`, fallback: 'T' },
  api: { logo: null, icon: Braces, fallback: 'A' },
}

const channelFilters = [
  { value: 'all', label: 'All channels' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'slack', label: 'Slack' },
  { value: 'discord', label: 'Discord' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'api', label: 'API' },
  { value: 'web', label: 'Web' },
]

function channelDetail(channel: string, config: Record<string, unknown>): string | null {
  if (channel === 'whatsapp') {
    return (config.kapsoDisplayPhone || config.phoneNumber || null) as string | null
  }
  return null
}

interface DeploymentItem {
  id: string
  agentId: string
  channel: string
  status: string
  config: Record<string, unknown>
  createdAt: string
  agentName?: string
}

export default function DeploymentsPage() {
  const { orgId, isLoading: orgLoading } = useOrg()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<Partial<DeploymentItem> | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [channelFilter, setChannelFilter] = useState('all')
  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Handle Discord OAuth2 callback params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const connected = params.get('connected')
    const error = params.get('error')
    if (connected === 'discord') {
      toast.success('Discord bot added to your server!')
      queryClient.invalidateQueries({ queryKey: ['all-deployments'] })
    } else if (error) {
      const messages: Record<string, string> = {
        discord_already_deployed: 'This agent already has a Discord deployment.',
        discord_missing_params: 'Discord setup failed — missing parameters.',
        discord_not_configured: 'Discord one-click setup is not configured.',
        agent_not_found: 'Agent not found.',
        discord_callback_failed: 'Discord setup failed. Please try again.',
      }
      toast.error(messages[error] || 'Something went wrong with Discord setup.')
    }
    if (connected || error) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [queryClient])

  const agentsQuery = useQuery({
    queryKey: ['agents-for-deployments', orgId],
    queryFn: () => agentsApi.list(orgId!),
    enabled: !!orgId,
  })

  const agentsData = (() => {
    const raw = agentsQuery.data?.data?.data || agentsQuery.data?.data || []
    return Array.isArray(raw) ? raw : []
  })()

  const allDeploymentsQuery = useQuery({
    queryKey: ['all-deployments', orgId],
    queryFn: async () => {
      const res = await deploymentsApi.listByOrg(orgId!)
      const items = res.data.data || res.data
      return Array.isArray(items) ? items : []
    },
    enabled: !!orgId,
  })

  const createMutation = {
    mutate: async (data: {agentId: string; channel: string; config: Record<string, unknown>}) => {
      return deploymentsApi.create(data.agentId, { channel: data.channel, config: data.config })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-deployments'] })
    },
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deploymentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-deployments'] })
      toast.success('Deployment deleted')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete deployment')
    },
  })

  const retryMutation = useMutation({
    mutationFn: async (deployment: DeploymentItem) => {
      const res = await deploymentsApi.test(deployment.id)
      const result = res.data.data as { success?: boolean; message?: string }
      if (!result?.success) throw new Error(result?.message || 'Connection check failed')
      await deploymentsApi.update(deployment.id, { status: 'active' })
      return result.message
    },
    onSuccess: (msg) => {
      queryClient.invalidateQueries({ queryKey: ['all-deployments'] })
      toast.success(msg || 'Deployment is configured and active')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Retry failed')
    },
  })

  const deployments = allDeploymentsQuery.data || []

  const filteredDeployments = useMemo(() => {
    return deployments.filter((deployment: DeploymentItem) => {
      const matchesSearch =
        search === '' ||
        deployment.channel.toLowerCase().includes(search.toLowerCase()) ||
        (deployment.agentName || deployment.agentId)
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' || deployment.status === statusFilter

      const matchesChannel =
        channelFilter === 'all' || deployment.channel === channelFilter

      return matchesSearch && matchesStatus && matchesChannel
    })
  }, [deployments, search, statusFilter, channelFilter])

  if (orgLoading || allDeploymentsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight">Deployments</h1>
          <p className="text-sm text-muted-foreground">Connect agents to channels</p>
        </div>
        <Button size="sm" onClick={() => setEditing({})} className="self-start">
          <Plus className="size-4" />
          New
        </Button>
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search deployments..."
        filters={[
          { value: 'all', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'pending', label: 'Pending' },
        ]}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        filterLabel="Status"
        trailing={
          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All channels" />
            </SelectTrigger>
            <SelectContent>
              {channelFilters.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {editing && (
        <DeploymentForm
          agents={agentsData}
          onSave={async (data) => {
            try {
              const res = await createMutation.mutate(data)
              const body = res?.data
              const config = body?.data?.config || {}
              const deploymentId = body?.data?.id
              const setupLinkUrl = config.kapsoSetupLinkUrl as string | undefined
              if (setupLinkUrl) {
                createMutation.onSuccess()
                return { setupLinkUrl, deploymentId }
              }
              createMutation.onSuccess()
              setEditing(null)
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Failed to create deployment'
              toast.error(message)
              throw err
            }
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {deployments.length === 0 && !editing && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="size-10 rounded-full bg-muted flex items-center justify-center mb-3">
            <Globe className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No deployments</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create your first deployment to connect an agent to a channel.
          </p>
          <Button size="sm" className="mt-4" onClick={() => setEditing({})}>
            <Plus className="size-4" />
            Connect a channel
          </Button>
        </div>
      )}

      {deployments.length > 0 && filteredDeployments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="size-10 rounded-full bg-muted flex items-center justify-center mb-3">
            <Globe className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No results found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {filteredDeployments.map((deployment: DeploymentItem) => {
          const ch = channelLogos[deployment.channel] || channelLogos.web
          const config = deployment.config || {}
          const subtitle = (config.guildName || config.workspaceName || config.projectName || deployment.agentName || deployment.agentId) as string
          const detail = channelDetail(deployment.channel, config)
          return (
            <div
              key={deployment.id}
              className="group rounded-xl border border-border/60 bg-card cursor-pointer transition-all duration-200 hover:border-border hover:shadow-sm overflow-hidden"
              onClick={() => setSelectedDeployment(deployment)}
            >
              <div className="flex items-center gap-2.5 px-3 py-2.5 sm:px-4 sm:py-3">
                <div className="flex size-8 sm:size-9 items-center justify-center rounded-lg bg-muted shrink-0 transition-transform duration-200 group-hover:scale-105">
                  {ch.logo ? (
                    <img src={ch.logo} alt={deployment.channel} className="size-4" />
                  ) : ch.icon ? (
                    <ch.icon className="size-4 text-muted-foreground" />
                  ) : (
                    <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">{ch.fallback}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold capitalize truncate">{deployment.channel}</span>
                     <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium shrink-0 ${
                      deployment.status === 'active'
                        ? 'bg-success/10 text-success'
                        : deployment.status === 'error'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {deployment.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</p>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  {(deployment.status === 'error' || deployment.status === 'pending') && (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <button
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              retryMutation.mutate(deployment)
                            }}
                          >
                            {retryMutation.isPending && retryMutation.variables?.id === deployment.id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="size-3.5" />
                            )}
                          </button>
                        }
                      />
                      <TooltipContent side="top" className="text-xs">
                        Retry connection
                      </TooltipContent>
                    </Tooltip>
                  )}

                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <button
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(deployment.id)
                            setCopiedId(deployment.id)
                            setTimeout(() => setCopiedId(null), 1500)
                          }}
                        >
                          {copiedId === deployment.id ? (
                            <Check className="size-3.5 text-success" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </button>
                      }
                    />
                    <TooltipContent side="top" className="text-xs">
                      {copiedId === deployment.id ? 'Copied!' : 'Copy ID'}
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <button
                          className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeletingId(deployment.id)
                          }}
                        >
                          {deleteMutation.isPending && deletingId === deployment.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                        </button>
                      }
                    />
                    <TooltipContent side="top" className="text-xs">
                      Delete
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="flex items-center gap-1.5 border-t border-border/40 px-3 py-1.5 sm:px-4 sm:py-2 bg-muted/20">
                {detail ? (
                  <>
                    <Phone className="size-3 text-muted-foreground" />
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground truncate">{detail}</span>
                  </>
                ) : (
                  <>
                    <Calendar className="size-3 text-muted-foreground" />
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground">Created {new Date(deployment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => { if (!open) setDeletingId(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete deployment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this deployment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) {
                  deleteMutation.mutate(deletingId, {
                    onSuccess: () => setDeletingId(null),
                  })
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DeploymentDetail
        deploymentId={selectedDeployment?.id || null}
        agentName={selectedDeployment?.agentName || ''}
        onClose={() => setSelectedDeployment(null)}
        onDelete={(id) => setDeletingId(id)}
      />
    </div>
  )
}

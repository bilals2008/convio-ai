import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { deployments as deploymentsApi, agents as agentsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Plus, Trash2, Loader2, Copy, Check, Globe } from 'lucide-react'
import { DeploymentForm } from '@/components/settings/deployment-form'
import { SearchFilterBar } from '@/components/shared/search-filter-bar'

const CDN = 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons'

const channelLogos: Record<string, { logo: string | null; fallback: string }> = {
  web: { logo: null, fallback: 'W' },
  whatsapp: { logo: `${CDN}/whatsapp/default.svg`, fallback: 'WA' },
  slack: { logo: `${CDN}/slack/default.svg`, fallback: 'S' },
  discord: { logo: `${CDN}/discord/default.svg`, fallback: 'D' },
  telegram: { logo: `${CDN}/telegram/default.svg`, fallback: 'T' },
  api: { logo: null, fallback: 'A' },
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
      const agentsRes = await agentsApi.list(orgId!)
      const agents = agentsRes.data.data || agentsRes.data
      const agentsList = Array.isArray(agents) ? agents : []
      const deploymentPromises = agentsList.map(async (agent: { id: string; name: string }) => {
        try {
          const res = await deploymentsApi.list(agent.id)
          const items = res.data.data || res.data
          const list = Array.isArray(items) ? items : []
          return list.map((d: DeploymentItem) => ({ ...d, agentName: agent.name }))
        } catch {
          return []
        }
      })
      const nested = await Promise.all(deploymentPromises)
      return nested.flat()
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

  const deleteMutation = {
    mutate: async (id: string) => {
      await deploymentsApi.delete(id)
      queryClient.invalidateQueries({ queryKey: ['all-deployments'] })
    }
  }

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

      return matchesSearch && matchesStatus
    })
  }, [deployments, search, statusFilter])

  if (orgLoading || allDeploymentsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Deployments</h1>
          <p className="text-sm text-muted-foreground">Connect agents to channels</p>
        </div>
        <Button size="sm" onClick={() => setEditing({})}>
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
      />

      {editing && (
        <DeploymentForm
          agents={agentsData}
          onSave={async (data) => {
            const res = await createMutation.mutate(data)
            const body = res?.data
            const config = body?.data?.config || {}
            const setupLinkUrl = config.kapsoSetupLinkUrl as string | undefined
            if (setupLinkUrl) {
              createMutation.onSuccess()
              return { setupLinkUrl }
            }
            createMutation.onSuccess()
            setEditing(null)
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
          return (
            <div
              key={deployment.id}
              className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5"
            >
              <div className="flex size-8 items-center justify-center rounded-md bg-muted shrink-0">
                {ch.logo ? (
                  <img src={ch.logo} alt={deployment.channel} className="size-4" />
                ) : (
                  <span className="text-[10px] font-bold text-muted-foreground">{ch.fallback}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium capitalize truncate">{deployment.channel}</span>
                  <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium shrink-0 ${
                    deployment.status === 'active'
                      ? 'bg-success/10 text-success'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {deployment.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{deployment.agentName || deployment.agentId}</p>
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        className="rounded p-1 text-muted-foreground hover:bg-muted transition-colors"
                        onClick={() => {
                          navigator.clipboard.writeText(deployment.id)
                          setCopiedId(deployment.id)
                          setTimeout(() => setCopiedId(null), 1500)
                        }}
                      >
                        {copiedId === deployment.id ? (
                          <Check className="size-3 text-success" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    }
                  />
                  <TooltipContent side="top" className="text-xs">
                    {copiedId === deployment.id ? 'Copied!' : 'Copy deployment ID'}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => deleteMutation.mutate(deployment.id)}
                      >
                        <Trash2 className="size-3" />
                      </button>
                    }
                  />
                  <TooltipContent side="top" className="text-xs">
                    Delete deployment
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

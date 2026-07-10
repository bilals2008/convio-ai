import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Brain, Clock, Pencil, Trash2 } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/shared/loading'
import { SearchInput } from '@/components/shared/search-input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { toast } from '@/lib/toast'
import { AgentDeleteDialog } from '@/components/agents/agent-delete-dialog'
import { agents as agentsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'

interface Agent {
  id: string
  name: string
  description?: string
  avatar?: string
  model: string
  systemPrompt: string
  temperature: number
  status: string
  createdAt: string
  updatedAt: string
}

const MODEL_BADGE_CLASSES: Record<string, string> = {
  'auto/': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  'aug/': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'gpt-': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'claude-': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'gemini-': 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  'llama-': 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  'ddgw/': 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  'oc': 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  'tllm/': 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  'mistral': 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  'deepseek': 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
}

function getModelBadgeClass(model: string): string {
  for (const [prefix, cls] of Object.entries(MODEL_BADGE_CLASSES)) {
    if (model.startsWith(prefix)) return cls
  }
  return 'bg-muted text-muted-foreground'
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function AgentsListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId, isLoading: orgLoading } = useOrg()
  const [search, setSearch] = useState('')
  const [deleteAgent, setDeleteAgent] = useState<Agent | null>(null)

  const { data: agentsData, isLoading } = useQuery({
    queryKey: ['agents', orgId],
    queryFn: async () => {
      try {
        const res = await agentsApi.list(orgId!)
        return (res.data.data || []) as Agent[]
      } catch {
        return [] as Agent[]
      }
    },
    enabled: !!orgId,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => agentsApi.delete(id),
    onSuccess: () => {
      toast.success('Agent deleted')
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      setDeleteAgent(null)
    },
    onError: () => {
      toast.error('Failed to delete agent')
    },
  })

  const agents = agentsData || []

  const filteredAgents = search
    ? agents.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.description?.toLowerCase().includes(search.toLowerCase()) ||
          a.model.toLowerCase().includes(search.toLowerCase())
      )
    : agents

  const sortedAgents = [...filteredAgents].sort(
    (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
  )

  const loadingSkeletons = Array.from({ length: 6 }, (_, i) => (
    <Card key={i}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-12 rounded-md" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-14" />
        </div>
      </CardContent>
    </Card>
  ))

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your AI agents
          </p>
        </div>
        <Button onClick={() => navigate('/agents/new')}>
          <Plus className="size-4 mr-2" />
          Create Agent
        </Button>
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search agents by name, description, or model..."
      />

      {(orgLoading || isLoading) && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {loadingSkeletons}
        </div>
      )}

      {!orgLoading && !isLoading && agents.length === 0 && (
        <EmptyState
          icon={Brain}
          title="No agents yet"
          description="Create your first AI agent to get started."
          action={{ label: 'Create Agent', onClick: () => navigate('/agents/new') }}
        />
      )}

      {!orgLoading && !isLoading && agents.length > 0 && filteredAgents.length === 0 && (
        <EmptyState
          icon={Brain}
          title="No agents match your search"
          description="Try a different search term or clear the filter."
          action={{ label: 'Clear search', onClick: () => setSearch('') }}
        />
      )}

      {!orgLoading && !isLoading && sortedAgents.length > 0 && (
        <div>
          {search && (
            <p className="text-sm text-muted-foreground">
              {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} found
            </p>
          )}

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mt-3">
            {sortedAgents.map((agent) => (
              <Card
                key={agent.id}
                className="group cursor-pointer transition-all hover:border-primary/30 hover:shadow-sm"
                onClick={() => navigate(`/agents/${agent.id}/edit`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="size-10 rounded-lg">
                        {agent.avatar ? (
                          <AvatarImage src={agent.avatar} alt={agent.name} className="object-cover" />
                        ) : null}
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                          <Brain className="size-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate">{agent.name}</h3>
                        {agent.description ? (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {agent.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] font-mono border-0 px-1.5 py-0 ${getModelBadgeClass(agent.model)}`}
                    >
                      {agent.model.length > 28 ? agent.model.slice(0, 25) + '...' : agent.model}
                    </Badge>
                    {agent.status && agent.status !== 'draft' && (
                      <Badge variant="outline" className="text-[10px] capitalize px-1.5 py-0">
                        {agent.status}
                      </Badge>
                    )}
                  </div>

                  <div className="h-px bg-border/60 mb-3" />

                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                    {agent.systemPrompt.slice(0, 100)}
                    {agent.systemPrompt.length > 100 ? '...' : ''}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Clock className="size-3" />
                      {formatDate(agent.createdAt)}
                    </div>

                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/agents/${agent.id}/edit`)
                        }}
                        className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteAgent(agent)
                        }}
                        className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {deleteAgent && (
        <AgentDeleteDialog
          open={!!deleteAgent}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteAgent(null)
            }
          }}
          agentName={deleteAgent.name}
          onConfirm={() => {
            deleteMutation.mutate(deleteAgent.id)
          }}
          isPending={deleteMutation.isPending}
        />
      )}
    </PageContainer>
  )
}

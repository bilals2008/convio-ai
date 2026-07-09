import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Brain,
  Pencil,
  Trash2,
  MessageSquare,
  Clock,
} from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/shared/loading'
import { SearchInput } from '@/components/shared/search-input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AgentDeleteDialog } from '@/components/agents/agent-delete-dialog'
import { agents as agentsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'

interface Agent {
  id: string
  name: string
  description?: string
  model: string
  systemPrompt: string
  temperature: number
  createdAt: string
  updatedAt: string
}

function formatModel(model: string) {
  const parts = model.split('/')
  const name = parts[parts.length - 1]
  return name.length > 22 ? name.slice(0, 19) + '...' : name
}

function formatPrompt(prompt: string) {
  return prompt.length > 60 ? prompt.slice(0, 57) + '...' : prompt
}

function formatTemp(temp: number) {
  return temp.toFixed(1)
}

export default function AgentsListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId } = useOrg()
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
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })

  const agents = agentsData || []

  const filteredAgents = search
    ? agents.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.description?.toLowerCase().includes(search.toLowerCase())
      )
    : agents

  const loadingSkeletons = Array.from({ length: 3 }, (_, i) => (
    <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-lg" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-12 rounded-md" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-3 w-14" />
      </div>
    </div>
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
        placeholder="Search agents..."
      />

      {isLoading && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {loadingSkeletons}
        </div>
      )}

      {!isLoading && filteredAgents.length === 0 && (
        <EmptyState
          icon={Brain}
          title="No agents yet"
          description={
            search
              ? 'No agents match your search. Try a different query.'
              : 'Create your first AI agent to get started.'
          }
          action={
            search
              ? { label: 'Clear search', onClick: () => setSearch('') }
              : { label: 'Create Agent', onClick: () => navigate('/agents/new') }
          }
        />
      )}

      {!isLoading && filteredAgents.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="group relative rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm cursor-pointer"
              onClick={() => navigate(`/agents/${agent.id}/edit`)}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Brain className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm truncate">{agent.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {agent.description || 'No description'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                <Badge
                  variant="secondary"
                  className="text-[10px] font-mono bg-purple-500/10 text-purple-500 border-0 px-1.5 py-0"
                >
                  {formatModel(agent.model)}
                </Badge>
                <Badge
                  variant="secondary"
                  className="text-[10px] bg-muted/60 text-muted-foreground border-0 px-1.5 py-0"
                >
                  {formatTemp(agent.temperature)}
                </Badge>
              </div>

              <div className="h-px bg-border/60 mb-3" />

              <p className="text-[11px] text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                {formatPrompt(agent.systemPrompt)}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="size-3" />
                  {new Date(agent.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>

                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/agents/${agent.id}/edit?tab=test-chat`)
                    }}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
                  >
                    <MessageSquare className="size-3" />
                    Chat
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/agents/${agent.id}/edit`)
                    }}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                  >
                    <Pencil className="size-3" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteAgent(agent)
                    }}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteAgent && (
        <AgentDeleteDialog
          open={!!deleteAgent}
          onOpenChange={(open) => {
            if (!open) setDeleteAgent(null)
          }}
          agentName={deleteAgent.name}
          onConfirm={() => {
            deleteMutation.mutate(deleteAgent.id)
            setDeleteAgent(null)
          }}
        />
      )}
    </PageContainer>
  )
}

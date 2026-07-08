import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Brain } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/shared/loading'
import { SearchInput } from '@/components/shared/search-input'
import { Button } from '@/components/ui/button'
import { AgentCard } from '@/components/agents/agent-card'
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
    <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-5 w-20 rounded-full" />
      <Skeleton className="h-px w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  ))

  return (
    <PageContainer>
      <PageHeader
        title="AI Agents"
        description="Configure your AI brains with custom prompts and models"
        action={
          <Button onClick={() => navigate('/agents/new')}>
            <Plus className="size-4" />
            Create Agent
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search agents..."
      />

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onDelete={() => setDeleteAgent(agent)}
            />
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

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Brain, MoreVertical, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/shared/loading'
import { SearchInput } from '@/components/shared/search-input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
    <Card key={i} className="overflow-hidden">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="size-8 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
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
            <Card
              key={agent.id}
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary/20 group"
              onClick={() => navigate(`/agents/${agent.id}/edit`)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                      <Brain className="size-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {agent.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/agents/${agent.id}/edit`)
                        }}
                      >
                        <Pencil className="size-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/agents/${agent.id}/edit?tab=test-chat`)
                        }}
                      >
                        <ExternalLink className="size-4 mr-2" />
                        Test Chat
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteAgent(agent)
                        }}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">
                    {agent.model.length > 20 ? agent.model.slice(0, 17) + '...' : agent.model}
                  </Badge>
                  <Badge variant="outline">
                    Temp {agent.temperature}
                  </Badge>
                </div>

                <Separator className="mb-4" />

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <p className="line-clamp-1 max-w-[60%]">
                    {agent.systemPrompt.slice(0, 40)}{agent.systemPrompt.length > 40 ? '...' : ''}
                  </p>
                  <span className="text-xs">
                    {new Date(agent.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
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

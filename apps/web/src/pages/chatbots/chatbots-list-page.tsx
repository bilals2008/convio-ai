import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Bot } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/shared/loading'
import { SearchInput } from '@/components/shared/search-input'
import { Button } from '@/components/ui/button'
import { BotCard } from '@/components/chatbots/bot-card'
import { BotDeleteDialog } from '@/components/chatbots/bot-delete-dialog'
import { bots as botsApi } from '@/lib/api'

type BotStatus = 'draft' | 'active' | 'paused' | 'archived'

interface Chatbot {
  id: string
  name: string
  description?: string
  avatar?: string
  widgetColor: string
  status: BotStatus
  agentId: string
  agentName?: string
  conversations?: number
  updatedAt: string
}

const MOCK_ORG_ID = 'mock-org-id'

const statusFilters = ['all', 'draft', 'active', 'paused', 'archived'] as const

export default function ChatbotsListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>('all')
  const [deleteBot, setDeleteBot] = useState<Chatbot | null>(null)

  const { data: botsData, isLoading } = useQuery({
    queryKey: ['chatbots', MOCK_ORG_ID],
    queryFn: async () => {
      try {
        const res = await botsApi.list(MOCK_ORG_ID)
        return (res.data.data || []) as Chatbot[]
      } catch {
        return [] as Chatbot[]
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => botsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbots'] })
    },
  })

  const bots = botsData || []

  const filteredBots = bots.filter((bot) => {
    const matchesSearch =
      !search ||
      bot.name.toLowerCase().includes(search.toLowerCase()) ||
      bot.description?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || bot.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const loadingSkeletons = Array.from({ length: 3 }, (_, i) => (
    <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
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
        title="Chatbots"
        description="Create and manage your AI chatbots"
        action={
          <Button onClick={() => navigate('/chatbots/new')}>
            <Plus className="size-4" />
            Create Bot
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search bots..."
          className="flex-1"
        />
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {statusFilters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                statusFilter === f
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{loadingSkeletons}</div>
      )}

      {!isLoading && filteredBots.length === 0 && (
        <EmptyState
          icon={Bot}
          title="No chatbots yet"
          description={
            search
              ? 'No bots match your search. Try a different query.'
              : 'Create your first chatbot to start accepting conversations.'
          }
          action={
            search
              ? { label: 'Clear search', onClick: () => setSearch('') }
              : { label: 'Create Bot', onClick: () => navigate('/chatbots/new') }
          }
        />
      )}

      {!isLoading && filteredBots.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBots.map((bot) => (
            <BotCard key={bot.id} bot={bot} onDelete={() => setDeleteBot(bot)} />
          ))}
        </div>
      )}

      {deleteBot && (
        <BotDeleteDialog
          open={!!deleteBot}
          onOpenChange={(open) => { if (!open) setDeleteBot(null) }}
          botName={deleteBot.name}
          onConfirm={() => {
            deleteMutation.mutate(deleteBot.id)
            setDeleteBot(null)
          }}
        />
      )}
    </PageContainer>
  )
}

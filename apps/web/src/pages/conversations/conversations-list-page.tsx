import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Plus } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/shared/loading'
import { SearchInput } from '@/components/shared/search-input'
import { Button } from '@/components/ui/button'
import { ConversationCard } from '@/components/conversations/conversation-card'
import { ConversationFilters } from '@/components/conversations/conversation-filters'
import { BotSelectorDialog } from '@/components/conversations/bot-selector-dialog'
import { conversations as conversationsApi, bots as botsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'

type Channel = 'web' | 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'api'
type ConvStatus = 'active' | 'waiting' | 'resolved' | 'closed' | 'archived'

interface ConversationItem {
  id: string
  userId?: string
  userName?: string
  botName: string
  botId: string
  channel: Channel
  status: ConvStatus
  messageCount: number
  lastMessage?: string
  updatedAt: string
}

interface BotOption {
  id: string
  name: string
  status: string
  agentName?: string
  agentModel?: string
  conversations?: number
}

export default function ConversationsListPage() {
  const navigate = useNavigate()
  const { orgId } = useOrg()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [channelFilter, setChannelFilter] = useState('all')
  const [cursor, setCursor] = useState<string | undefined>()
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [botSelectorOpen, setBotSelectorOpen] = useState(false)

  const params: Record<string, string | undefined> = {}
  if (statusFilter !== 'all') params.status = statusFilter
  if (channelFilter !== 'all') params.channel = channelFilter
  if (cursor) params.cursor = cursor

  const { data: convsData, isLoading } = useQuery({
    queryKey: ['conversations', params, cursor],
    queryFn: async () => {
      try {
        const res = await conversationsApi.list(params)
        setNextCursor(res.data.nextCursor ?? null)
        return (res.data.data || []) as ConversationItem[]
      } catch {
        return [] as ConversationItem[]
      }
    },
  })

  const { data: bots, isLoading: botsLoading } = useQuery({
    queryKey: ['bots-list', orgId],
    queryFn: async () => {
      const res = await botsApi.list(orgId!)
      return (res.data.data || []) as BotOption[]
    },
    enabled: !!orgId,
  })

  const createConvMutation = useMutation({
    mutationFn: async (botId: string) => {
      const res = await conversationsApi.create(botId, { channel: 'web' })
      return res.data.data as { id: string }
    },
    onSuccess: (data) => {
      setBotSelectorOpen(false)
      navigate(`/conversations/${data.id}`)
    },
  })

  const handleSelectBot = (botId: string) => {
    createConvMutation.mutate(botId)
  }

  const conversations = convsData || []

  const filteredConvs = search
    ? conversations.filter(
        (c) =>
          c.userName?.toLowerCase().includes(search.toLowerCase()) ||
          c.botName.toLowerCase().includes(search.toLowerCase()) ||
          c.lastMessage?.toLowerCase().includes(search.toLowerCase())
      )
    : conversations

  const botCount = (bots || []).length

  const loadingSkeletons = Array.from({ length: 5 }, (_, i) => (
    <div key={i} className="rounded-xl border bg-card p-4 flex items-center gap-4">
      <Skeleton className="size-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="flex flex-col items-end gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  ))

  return (
    <PageContainer>
      <PageHeader
        title="Conversations"
        description="View and manage all chat conversations"
        action={
          <Button
            onClick={() => setBotSelectorOpen(true)}
            disabled={createConvMutation.isPending || botCount === 0}
          >
            <Plus className="size-4" />
            {createConvMutation.isPending ? 'Starting...' : 'Start Chat'}
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search conversations..."
          className="flex-1"
        />
        <ConversationFilters
          statusFilter={statusFilter}
          channelFilter={channelFilter}
          onStatusChange={setStatusFilter}
          onChannelChange={setChannelFilter}
          onClear={() => { setStatusFilter('all'); setChannelFilter('all') }}
        />
      </div>

      {isLoading && (
        <div className="space-y-2">{loadingSkeletons}</div>
      )}

      {!isLoading && filteredConvs.length === 0 && (
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description={
            search
              ? 'No conversations match your search.'
              : 'Conversations will appear here once users start chatting with your bots.'
          }
          action={
            search
              ? { label: 'Clear search', onClick: () => setSearch('') }
              : { label: 'Start Chat', onClick: () => setBotSelectorOpen(true) }
          }
        />
      )}

      {!isLoading && filteredConvs.length > 0 && (
        <div className="space-y-2">
          {filteredConvs.map((conv) => (
            <ConversationCard key={conv.id} conversation={conv} />
          ))}
        </div>
      )}

      {!isLoading && filteredConvs.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredConvs.length} conversation{filteredConvs.length !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!cursor}
              onClick={() => setCursor(undefined)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!nextCursor}
              onClick={() => setCursor(nextCursor!)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <BotSelectorDialog
        open={botSelectorOpen}
        onOpenChange={setBotSelectorOpen}
        bots={(bots || []) as BotOption[]}
        loading={botsLoading}
        onSelect={handleSelectBot}
      />
    </PageContainer>
  )
}

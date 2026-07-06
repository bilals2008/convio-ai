import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MessageSquare } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/shared/loading'
import { SearchInput } from '@/components/shared/search-input'
import { Button } from '@/components/ui/button'
import { ConversationCard } from '@/components/conversations/conversation-card'
import { ConversationFilters } from '@/components/conversations/conversation-filters'
import { conversations as conversationsApi } from '@/lib/api'

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

const MOCK_ORG_ID = 'mock-org-id'

export default function ConversationsListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [channelFilter, setChannelFilter] = useState('all')
  const [page, setPage] = useState(1)

  const { data: convsData, isLoading } = useQuery({
    queryKey: ['conversations', MOCK_ORG_ID, statusFilter, channelFilter, page],
    queryFn: async () => {
      try {
        const res = await conversationsApi.list(MOCK_ORG_ID)
        return (res.data.data || []) as ConversationItem[]
      } catch {
        return [] as ConversationItem[]
      }
    },
  })

  const conversations = convsData || []

  const filteredConvs = search
    ? conversations.filter(
        (c) =>
          c.userName?.toLowerCase().includes(search.toLowerCase()) ||
          c.botName.toLowerCase().includes(search.toLowerCase()) ||
          c.lastMessage?.toLowerCase().includes(search.toLowerCase())
      )
    : conversations

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
              : undefined
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
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

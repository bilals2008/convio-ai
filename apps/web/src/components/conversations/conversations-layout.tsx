import { useState, useEffect } from 'react'
import { Outlet, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ArrowLeft, MessageSquare, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { SearchInput } from '@/components/shared/search-input'
import { Skeleton } from '@/components/shared/loading'
import { ConversationStatusBadge } from './conversation-status-badge'
import type { ConvStatus } from './conversation-status-badge'
import { conversations as conversationsApi, agents as agentsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { cn } from '@/lib/utils'

type Channel = 'web' | 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'api'

interface ConversationItem {
  id: string
  userId?: string
  userName?: string
  agentName: string
  agentId: string
  channel: Channel
  status: ConvStatus
  messageCount: number
  lastMessage?: string
  messages?: Array<{ content: string }>
  updatedAt: string
}

function formatRelativeTime(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`
  return then.toLocaleDateString()
}

function getInitials(name: string | undefined): string {
  if (!name) return 'A'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function getLastMessage(conv: ConversationItem): string {
  if (conv.lastMessage) return conv.lastMessage
  if (conv.messages && conv.messages.length > 0) {
    return conv.messages[0].content
  }
  return 'No messages yet'
}

export function ConversationsLayout() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { orgId } = useOrg()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(id || null)
  const [showAgentPicker, setShowAgentPicker] = useState(false)
  const [agentSearch, setAgentSearch] = useState('')

  const { data: agents = [] } = useQuery({
    queryKey: ['agents-for-conversations', orgId],
    queryFn: async () => (await agentsApi.list(orgId!)).data.data as Array<{ id: string; name: string }>,
    enabled: Boolean(orgId),
    staleTime: 5 * 60 * 1000,
  })

  const { data: convsData, isLoading } = useQuery({
    queryKey: ['conversations', orgId, statusFilter],
    queryFn: async () => {
      const params: Record<string, string | undefined> = {}
      if (statusFilter !== 'all') params.status = statusFilter
      try {
        const res = await conversationsApi.list(params)
        return (res.data.data || []) as ConversationItem[]
      } catch {
        return [] as ConversationItem[]
      }
    },
    enabled: !!orgId,
  })

  const createConvMutation = useMutation({
    mutationFn: async (agentId: string) => {
      const res = await conversationsApi.create(agentId, { channel: 'web' })
      return res.data.data as { id: string }
    },
    onSuccess: (data) => {
      setSelectedId(data.id)
      navigate(`/conversations/${data.id}`)
    },
  })

  const conversations = convsData || []

  const filteredConvs = search
    ? conversations.filter(
        (c) =>
          c.userName?.toLowerCase().includes(search.toLowerCase()) ||
          c.agentName?.toLowerCase().includes(search.toLowerCase()) ||
          c.lastMessage?.toLowerCase().includes(search.toLowerCase())
      )
    : conversations

  const filteredAgents = agentSearch
    ? agents.filter((a) => a.name.toLowerCase().includes(agentSearch.toLowerCase()))
    : agents

  useEffect(() => {
    if (id) setSelectedId(id)
  }, [id])

  const handleSelect = (convId: string) => {
    setSelectedId(convId)
    navigate(`/conversations/${convId}`)
  }

  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 1024
  const showList = !id || !isMobileView
  const showChat = id

  return (
    <>
    <div className="flex h-full overflow-hidden">
      {/* Left Panel - Conversation List */}
      <div
        className={cn(
          'flex flex-col border-r',
          'w-full lg:w-[340px] lg:min-w-[340px]',
          showChat && isMobileView ? 'hidden' : 'flex'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-base font-semibold">Chats</h2>
          <Button
            size="sm"
            onClick={() => setShowAgentPicker(true)}
            disabled={agents.length === 0}
          >
            <Plus className="size-3.5" />
            New
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search chats..."
            className="h-9 text-sm"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex px-4 pb-3 gap-1.5">
          {[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'waiting', label: 'Waiting' },
            { value: 'resolved', label: 'Resolved' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded-full transition-colors',
                statusFilter === tab.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto scrollbar-none">
          {isLoading && (
            <div className="space-y-0">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="size-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-3 w-6" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && filteredConvs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <p className="text-xs text-muted-foreground">No conversations</p>
            </div>
          )}

          {!isLoading && filteredConvs.map((conv) => (
            <button
              key={conv.id}
              onClick={() => handleSelect(conv.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                selectedId === conv.id
                  ? 'bg-primary/10'
                  : 'hover:bg-muted/50'
              )}
            >
              <div className={cn(
                'flex size-10 items-center justify-center rounded-full shrink-0',
                selectedId === conv.id ? 'bg-primary/20' : 'bg-primary/10'
              )}>
                <span className={cn(
                  'text-xs font-semibold',
                  selectedId === conv.id ? 'text-primary' : 'text-primary/80'
                )}>
                  {getInitials(conv.userName)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={cn(
                    'text-sm font-medium truncate',
                    selectedId === conv.id && 'text-primary'
                  )}>
                    {conv.userName || 'Anonymous'}
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                    {formatRelativeTime(conv.updatedAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                    {getLastMessage(conv)}
                  </p>
                  <ConversationStatusBadge status={conv.status} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel - Chat View */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0',
          !showChat && 'hidden lg:flex'
        )}
      >
        {id ? (
          <Outlet />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="size-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <MessageSquare className="size-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground">Select a conversation</p>
          </div>
        )}
      </div>

    </div>

    <Dialog open={showAgentPicker} onOpenChange={setShowAgentPicker}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a conversation</DialogTitle>
          <DialogDescription>Pick an agent to chat with</DialogDescription>
        </DialogHeader>
        <input
          type="text"
          placeholder="Search agents..."
          value={agentSearch}
          onChange={(e) => setAgentSearch(e.target.value)}
          className="h-9 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          autoFocus
        />
        <div className="space-y-1 max-h-72 overflow-y-auto">
          {filteredAgents.length === 0 && (
            <p className="py-6 text-center text-xs text-muted-foreground">No agents found</p>
          )}
          {filteredAgents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => {
                setShowAgentPicker(false)
                setAgentSearch('')
                createConvMutation.mutate(agent.id)
              }}
              disabled={createConvMutation.isPending}
              className={cn(
                'w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-colors',
                'hover:bg-muted/70 active:bg-muted disabled:opacity-50'
              )}
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
                <span className="text-sm font-semibold text-primary">
                  {getInitials(agent.name)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground truncate">{agent.name}</span>
                </div>
                {agent.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{agent.description}</p>
                )}
                {agent.model && (
                  <span className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {agent.model}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}

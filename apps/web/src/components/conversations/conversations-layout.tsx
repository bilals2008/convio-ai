import { useState, useEffect, useRef, useCallback } from 'react'
import { Outlet, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Plus, Search, Brain, Check, ArrowUp, ArrowDown, Trash2, Loader2, CheckSquare } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ChannelBadge } from '@/components/shared/channel-badge'
import { SearchInput } from '@/components/shared/search-input'
import { Skeleton } from '@/components/shared/loading'
import { BulkActionBar } from '@/components/shared/bulk-action-bar'
import { ConversationStatusBadge } from './conversation-status-badge'
import type { ConvStatus } from './conversation-status-badge'
import { ProviderLogo } from '@/components/agents/provider-logos'
import { conversations as conversationsApi, agents as agentsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { useBulkSelection } from '@/lib/hooks/use-bulk-selection'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'

type Channel = 'web' | 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'api'

interface AgentItem {
  id: string
  name: string
  description?: string
  avatar?: string
  model?: string
  status?: string
  updatedAt?: string
}

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

function formatModelName(model: string): string {
  const part = model.includes('/') ? model.split('/').slice(1).join('/') : model
  return part.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').replace(/ free$/i, '').trim()
}

function formatAgentDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const STATUS_META: Record<string, { label: string; className: string; dot: string }> = {
  active: { label: 'Active', className: 'border-success/20 bg-success/10 text-success', dot: 'bg-success' },
  draft: { label: 'Draft', className: 'border-warning/20 bg-warning/10 text-warning', dot: 'bg-warning' },
}

function AgentStatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    className: 'border-border bg-muted/40 text-muted-foreground',
    dot: 'bg-muted-foreground',
  }
  return (
     <span className={cn('inline-flex shrink-0 items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium', meta.className)}>
      <span className={cn('size-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  )
}

function AgentModelChip({ model }: { model: string }) {
  const provider = model.split('/')[0] || 'other'
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      <ProviderLogo provider={provider} className="size-3.5 rounded-[3px]" />
      <span className="max-w-[160px] truncate">{formatModelName(model)}</span>
    </span>
  )
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
  const [activeIndex, setActiveIndex] = useState(-1)
  const agentListRef = useRef<HTMLDivElement>(null)
  const agentSearchRef = useRef<HTMLInputElement>(null)

  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ['agents-for-conversations', orgId],
    queryFn: async () => (await agentsApi.list(orgId!)).data.data as AgentItem[],
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
      } catch (err) {
        console.error('Failed to load conversations', err)
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

  const bulk = useBulkSelection(filteredConvs)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const queryClient = useQueryClient()

  const deleteMany = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((cid) => conversationsApi.delete(cid)))
    },
    onSuccess: (_, ids) => {
      toast.success(`${ids.length} conversation${ids.length !== 1 ? 's' : ''} deleted`)
      queryClient.invalidateQueries({ queryKey: ['conversations', orgId, statusFilter] })
      setBulkDeleteOpen(false)
      setDeleteAllOpen(false)
      bulk.exitSelectionMode()
      if (id && ids.includes(id)) navigate('/conversations')
    },
    onError: () => {
      toast.error('Failed to delete conversations')
    },
  })

  const handleAgentKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((prev) => Math.min(prev + 1, filteredAgents.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && activeIndex >= 0 && filteredAgents[activeIndex]) {
        e.preventDefault()
        setShowAgentPicker(false)
        setAgentSearch('')
        setActiveIndex(-1)
        createConvMutation.mutate(filteredAgents[activeIndex].id)
      }
    },
    [filteredAgents, activeIndex, createConvMutation]
  )

  useEffect(() => {
    if (activeIndex >= 0 && agentListRef.current) {
      const el = agentListRef.current.children[activeIndex] as HTMLElement | undefined
      el?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  const selectAgent = useCallback(
    (agentId: string) => {
      setShowAgentPicker(false)
      setAgentSearch('')
      setActiveIndex(-1)
      createConvMutation.mutate(agentId)
    },
    [createConvMutation]
  )

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
          {bulk.selectionMode ? (
            <BulkActionBar
              onExitSelectionMode={bulk.exitSelectionMode}
              action={
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={bulk.selectedCount === 0 || deleteMany.isPending}
                  onClick={() => setBulkDeleteOpen(true)}
                >
                  {deleteMany.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                  Delete ({bulk.selectedCount})
                </Button>
              }
            />
          ) : (
            <Button
              size="sm"
              onClick={() => setShowAgentPicker(true)}
              disabled={agentsLoading || agents.length === 0}
            >
              {agentsLoading ? <Skeleton className="size-3.5 rounded-full" /> : <Plus className="size-3.5" />}
              New
            </Button>
          )}
        </div>

        {/* Search */}
        <TooltipProvider>
        <div className="flex items-center gap-1.5 px-4 pb-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search chats..."
            className="h-9 flex-1 text-sm"
          />
          <div className="flex shrink-0 items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger
              aria-label="Delete all conversations"
              disabled={conversations.length === 0 || isLoading || deleteMany.isPending}
              onClick={() => setDeleteAllOpen(true)}
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-9 shrink-0 text-muted-foreground')}
            >
              {deleteMany.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            </TooltipTrigger>
            <TooltipContent>Delete all conversations</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              aria-label="Select conversations"
              disabled={filteredConvs.length === 0}
              onClick={bulk.enterSelectionMode}
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-9 shrink-0 text-muted-foreground')}
            >
              <CheckSquare className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Select conversations</TooltipContent>
          </Tooltip>
          </div>
        </div>
        </TooltipProvider>

        {/* Filter Tabs */}
        {bulk.selectionMode ? (
          <div className="flex items-center justify-between px-4 pb-3">
            <div
              className="flex cursor-pointer select-none items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={bulk.toggleSelectAll}
            >
              <Checkbox checked={bulk.isAllSelected} onCheckedChange={bulk.toggleSelectAll} className="size-4" />
              {bulk.isAllSelected ? 'Deselect all' : 'Select all'}
            </div>
            <span className="text-xs text-muted-foreground">{bulk.selectedCount} selected</span>
          </div>
        ) : (
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
                 'px-2.5 py-1 text-xs font-medium rounded transition-colors',
                statusFilter === tab.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        )}

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
              <p className="text-xs text-muted-foreground">
                {search ? 'No conversations matching your search' : 'No conversations yet'}
              </p>
            </div>
          )}

          {!isLoading && filteredConvs.map((conv) => (
            <div
              key={conv.id}
              role="button"
              tabIndex={0}
              aria-label={`Conversation with ${conv.userName || 'Anonymous'}`}
              aria-current={selectedId === conv.id ? 'page' : undefined}
              onClick={() => (bulk.selectionMode ? bulk.toggleSelect(conv.id) : handleSelect(conv.id))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  if (bulk.selectionMode) {
                    bulk.toggleSelect(conv.id)
                  } else {
                    handleSelect(conv.id)
                  }
                }
              }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer',
                bulk.selectionMode && bulk.isSelected(conv.id)
                  ? 'bg-primary/10'
                  : selectedId === conv.id
                    ? 'bg-primary/10'
                    : 'hover:bg-muted/50'
              )}
            >
              {bulk.selectionMode && (
                <Checkbox
                  checked={bulk.isSelected(conv.id)}
                  onCheckedChange={() => bulk.toggleSelect(conv.id)}
                  aria-label={`Select ${conv.userName || 'Anonymous'}`}
                  className="size-4 shrink-0"
                />
              )}
              <Avatar size="lg" className="shrink-0">
                <AvatarFallback className={cn(
                  'text-xs font-semibold',
                  selectedId === conv.id ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary/80'
                )}>
                  {getInitials(conv.userName)}
                </AvatarFallback>
                <ChannelBadge channel={conv.channel} />
              </Avatar>

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
            </div>
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

    <Dialog
      open={showAgentPicker}
      onOpenChange={(open) => {
        setShowAgentPicker(open)
        if (!open) {
          setAgentSearch('')
          setActiveIndex(-1)
        }
      }}
    >
      <DialogContent className="sm:max-w-lg gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="text-base">Start a conversation</DialogTitle>
          <DialogDescription className="text-xs">Pick an agent to begin chatting with</DialogDescription>
        </DialogHeader>

        {/* Sticky Search */}
        <div className="relative px-5 pt-4 pb-3">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            ref={agentSearchRef}
            type="text"
            placeholder="Search agents..."
            value={agentSearch}
            onChange={(e) => {
              setAgentSearch(e.target.value)
              setActiveIndex(-1)
            }}
            onKeyDown={handleAgentKeyDown}
            className={cn(
              'h-10 w-full rounded-lg border border-border bg-muted/30 pl-9 pr-3 text-sm',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring/40',
              'transition-colors'
            )}
            autoFocus
          />
        </div>

        {/* Agent List */}
        <div
          ref={agentListRef}
          role="listbox"
          aria-label="Select an agent"
          className="max-h-80 overflow-y-auto scroll-smooth px-2 pb-2"
        >
          {/* Loading State */}
          {agentsLoading && (
            <div className="space-y-1 p-2">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-3">
                  <Skeleton className="size-10 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!agentsLoading && filteredAgents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="size-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <Search className="size-5 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {agentSearch ? 'No agents found' : 'No agents yet'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {agentSearch ? 'Try a different search term' : 'Create an agent to get started'}
              </p>
            </div>
          )}

          {/* Agent Cards */}
          {!agentsLoading && filteredAgents.map((agent, index) => (
            <button
              key={agent.id}
              role="option"
              aria-selected={activeIndex === index}
              onClick={() => selectAgent(agent.id)}
              onMouseEnter={() => setActiveIndex(index)}
              disabled={createConvMutation.isPending}
              className={cn(
                'group w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:opacity-50',
                activeIndex === index
                  ? 'bg-primary/8 border border-primary/20'
                  : 'border border-transparent hover:bg-muted/60 hover:border-border/60'
              )}
            >
              <Avatar className="size-10 shrink-0 rounded-xl">
                {agent.avatar ? (
                  <AvatarImage src={agent.avatar} alt={agent.name} className="object-cover" />
                ) : null}
                <AvatarFallback className="rounded-xl bg-primary/10 text-primary">
                  <Brain className="size-4.5" />
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground truncate">{agent.name}</span>
                  {agent.status && <AgentStatusBadge status={agent.status} />}
                </div>
                {agent.description && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{agent.description}</p>
                )}
                <div className="mt-1.5 flex items-center gap-2">
                  {agent.model && <AgentModelChip model={agent.model} />}
                  {agent.updatedAt && (
                    <span className="text-[10px] text-muted-foreground">{formatAgentDate(agent.updatedAt)}</span>
                  )}
                </div>
              </div>

              <Check
                className={cn(
                  'size-4 shrink-0 text-primary transition-all duration-150',
                  activeIndex === index ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                )}
              />
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-5 py-2.5">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-0.5 rounded border border-border bg-muted/60 px-1 py-0.5 font-mono text-[9px]">
              <ArrowUp className="size-2.5" />
              <ArrowDown className="size-2.5" />
            </span>
            <span>Navigate</span>
            <span className="inline-flex items-center rounded border border-border bg-muted/60 px-1 py-0.5 font-mono text-[9px]">Enter</span>
            <span>Select</span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
          </span>
        </div>
      </DialogContent>
    </Dialog>

    <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {bulk.selectedCount} conversation{bulk.selectedCount !== 1 ? 's' : ''}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {bulk.selectedCount} conversation{bulk.selectedCount !== 1 ? 's' : ''} and all their messages. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMany.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteMany.isPending}
            onClick={() => deleteMany.mutate(Array.from(bulk.selectedIds))}
          >
            {deleteMany.isPending ? 'Deleting...' : `Delete ${bulk.selectedCount} conversation${bulk.selectedCount !== 1 ? 's' : ''}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete all conversations?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete all {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} and their messages. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMany.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteMany.isPending}
            onClick={() => deleteMany.mutate(conversations.map((c) => c.id))}
          >
            {deleteMany.isPending ? 'Deleting...' : `Delete all ${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}

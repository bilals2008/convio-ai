import { MessageSquare, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/admin/empty-state'
import type { AdminConversation } from '@/admin/services/admin-api'
import { cn } from '@/lib/utils'

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

interface ConversationListProps {
  conversations: AdminConversation[] | undefined
  isLoading: boolean
  activeId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onNew: () => void
}

export function ConversationList({
  conversations,
  isLoading,
  activeId,
  onSelect,
  onDelete,
  onNew,
}: ConversationListProps) {
  const [search, setSearch] = useState('')

  const filtered = (conversations ?? []).filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 p-2">
        <Button type="button" size="sm" className="flex-1 justify-start gap-1.5" onClick={onNew}>
          <Plus className="size-3.5" /> New chat
        </Button>
      </div>
      <div className="px-2 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations"
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {isLoading && (
          <div className="space-y-1.5 p-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <EmptyState
            icon={MessageSquare}
            title={search ? 'No matches' : 'No conversations yet'}
            description={search ? 'Try a different search.' : 'Ask your first question about the platform.'}
          />
        )}
        {!isLoading &&
          filtered.map((c) => (
            <div
              key={c.id}
              className={cn(
                'group flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 transition-colors',
                c.id === activeId
                  ? 'bg-primary/10 text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
              )}
              onClick={() => onSelect(c.id)}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.title}</p>
                <p className="text-[11px] text-muted-foreground">{timeAgo(c.updatedAt)}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  aria-label="Conversation options"
                  className="rounded p-1 opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100 hover:bg-muted"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => onDelete(c.id)}
                  >
                    <Trash2 className="size-3.5" />
                    Delete conversation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
      </div>
    </div>
  )
}
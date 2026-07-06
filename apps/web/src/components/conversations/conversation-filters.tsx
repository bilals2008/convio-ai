import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Filter, X } from 'lucide-react'

type ConvStatus = 'active' | 'waiting' | 'resolved' | 'closed' | 'archived'
type Channel = 'web' | 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'api'

const statuses: { value: string; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'archived', label: 'Archived' },
]

const channels: { value: string; label: string }[] = [
  { value: 'all', label: 'All Channels' },
  { value: 'web', label: 'Web Widget' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'slack', label: 'Slack' },
  { value: 'discord', label: 'Discord' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'api', label: 'API' },
]

interface ConversationFiltersProps {
  statusFilter: string
  channelFilter: string
  onStatusChange: (status: string) => void
  onChannelChange: (channel: string) => void
  onClear: () => void
}

export function ConversationFilters({
  statusFilter,
  channelFilter,
  onStatusChange,
  onChannelChange,
  onClear,
}: ConversationFiltersProps) {
  const hasFilters = statusFilter !== 'all' || channelFilter !== 'all'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Filter className="size-4" />
        Filters
      </div>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((s) => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={channelFilter} onValueChange={onChannelChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {channels.map((c) => (
            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="gap-1">
          <X className="size-3" />
          Clear
        </Button>
      )}
    </div>
  )
}

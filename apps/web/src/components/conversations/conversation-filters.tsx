import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Filter, X, Globe, Phone, Hash, Send, Code, MessageCircle } from 'lucide-react'

type ConvStatus = 'active' | 'waiting' | 'resolved' | 'closed' | 'archived'
type Channel = 'web' | 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'api'

const statuses: { value: string; label: string; color: string }[] = [
  { value: 'all', label: 'All Statuses', color: 'text-muted-foreground' },
  { value: 'active', label: 'Active', color: 'text-emerald-500' },
  { value: 'waiting', label: 'Waiting', color: 'text-amber-500' },
  { value: 'resolved', label: 'Resolved', color: 'text-blue-500' },
  { value: 'closed', label: 'Closed', color: 'text-muted-foreground' },
  { value: 'archived', label: 'Archived', color: 'text-muted-foreground/60' },
]

const channels: { value: string; label: string; icon: typeof Globe }[] = [
  { value: 'all', label: 'All Channels', icon: Filter },
  { value: 'web', label: 'Web Widget', icon: Globe },
  { value: 'whatsapp', label: 'WhatsApp', icon: Phone },
  { value: 'slack', label: 'Slack', icon: Hash },
  { value: 'discord', label: 'Discord', icon: MessageCircle },
  { value: 'telegram', label: 'Telegram', icon: Send },
  { value: 'api', label: 'API', icon: Code },
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
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Filter className="size-4" />
        <span className="hidden sm:inline">Filters</span>
      </div>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              <span className={s.color}>{s.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={channelFilter} onValueChange={onChannelChange}>
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {channels.map((c) => (
            <SelectItem key={c.value} value={c.value}>
              <div className="flex items-center gap-2">
                <c.icon className="size-3.5" />
                <span>{c.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="gap-1.5 h-9">
          <X className="size-3.5" />
          Clear
        </Button>
      )}

      {hasFilters && (
        <Badge variant="secondary" className="text-xs">
          {(statusFilter !== 'all' ? 1 : 0) + (channelFilter !== 'all' ? 1 : 0)} active
        </Badge>
      )}
    </div>
  )
}

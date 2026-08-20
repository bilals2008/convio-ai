import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CATEGORIES,
  CATEGORY_META,
  PRIORITIES,
  PRIORITY_META,
  NOTIFICATION_STATUS_TABS,
  type NotificationFilters,
} from './notification-styles'

interface NotificationFiltersProps {
  filters: NotificationFilters
  onChange: (next: Partial<NotificationFilters>) => void
  counts?: { unread?: number; critical?: number }
  className?: string
}

export function NotificationFilters({ filters, onChange, counts, className }: NotificationFiltersProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div
        role="tablist"
        aria-label="Filter notifications by status"
        className="flex gap-1 rounded-lg bg-muted p-1"
      >
        {NOTIFICATION_STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={filters.status === tab.value}
            onClick={() => onChange({ status: tab.value })}
            className={cn(
              'flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
              filters.status === tab.value
                ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            {tab.label}
            {tab.value === 'unread' && !!counts?.unread && (
              <span className="ml-1 text-[10px] text-primary">{counts.unread}</span>
            )}
            {tab.value === 'all' && !!counts?.critical && (
              <span className="ml-1 text-[10px] text-destructive">{counts.critical}</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Search notifications..."
            className="h-8 pl-8"
            aria-label="Search notifications"
          />
        </div>
        <Select value={filters.category} onValueChange={(v) => onChange({ category: v ?? 'all' })}>
          <SelectTrigger aria-label="Filter by category" className="w-36">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORY_META[c].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.priority} onValueChange={(v) => onChange({ priority: v ?? 'all' })}>
          <SelectTrigger aria-label="Filter by priority" className="w-32">
            <SelectValue placeholder="All priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {PRIORITY_META[p].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
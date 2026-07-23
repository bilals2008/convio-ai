import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, Check, Clock, Copy, Eye, Globe2, LayoutDashboard, MoreVertical, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SelectionCheckbox } from '@/components/shared/selection-checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { WidgetSummary } from '@/lib/hooks/use-widgets'

interface WidgetCardProps {
  widget: WidgetSummary
  onCopyEmbed: (widget: WidgetSummary) => void
  onDelete: (widget: WidgetSummary) => void
  selectionMode?: boolean
  isSelected?: boolean
  onToggleSelect?: () => void
}

const STATUS_META: Record<string, { label: string; dot: string }> = {
  active: { label: 'Live', dot: 'bg-emerald-500' },
  paused: { label: 'Paused', dot: 'bg-amber-500' },
  draft: { label: 'Draft', dot: 'bg-muted-foreground' },
}

function statusMeta(status: string) {
  return STATUS_META[status] ?? { label: status.charAt(0).toUpperCase() + status.slice(1), dot: 'bg-muted-foreground' }
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

export function WidgetCard({ widget, onCopyEmbed, onDelete, selectionMode, isSelected, onToggleSelect }: WidgetCardProps) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const open = () => navigate(`/widgets/${widget.id}`)
  const handleClick = selectionMode && onToggleSelect ? onToggleSelect : open

  const handleCopy = async () => {
    await onCopyEmbed(widget)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const meta = statusMeta(widget.status)
  const domainCount = widget.allowedDomains.length
  const firstDomain = widget.allowedDomains[0]

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      className={cn(
        "group flex items-center gap-3 rounded-lg border bg-card p-4 cursor-pointer outline-none transition-colors duration-150",
        isSelected
          ? "border-primary/50 bg-primary/5"
          : "border-border hover:border-primary/30 focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {selectionMode && onToggleSelect && (
        <SelectionCheckbox isSelected={!!isSelected} onToggle={onToggleSelect} />
      )}

      <Avatar className="size-10 shrink-0 rounded-lg">
        {widget.agent.avatar ? (
          <AvatarImage src={widget.agent.avatar} alt={widget.agent.name} className="object-cover" />
        ) : null}
        <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
          <LayoutDashboard className="size-5" />
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-foreground truncate">{widget.name}</h3>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn('size-1.5 rounded-full', meta.dot)} />
            {meta.label}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground truncate">
          <Bot className="size-3 shrink-0" />
          <span className="truncate">{widget.agent.name}</span>
          {domainCount > 0 && (
            <>
              <span className="text-border">·</span>
              <Globe2 className="size-3 shrink-0" />
              <span className="truncate">{firstDomain}</span>
              {domainCount > 1 && <span className="text-muted-foreground/60 shrink-0">+{domainCount - 1}</span>}
            </>
          )}
          <span className="text-border">·</span>
          <Clock className="size-3 shrink-0" />
          <span className="shrink-0">{timeAgo(widget.updatedAt)}</span>
        </div>
      </div>

      {!selectionMode && (
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors",
              "opacity-0 group-hover:opacity-100",
            )}
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCopy() }}>
              {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
              {copied ? 'Copied!' : 'Copy embed code'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                window.open(`/widget/demo?embed=true&widgetKey=${widget.publicKey}`, '_blank')
              }}
            >
              <Eye className="size-4" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => { e.stopPropagation(); onDelete(widget) }}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

export function WidgetCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      <Skeleton className="size-10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3.5 w-56" />
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, Check, Clock, Copy, Eye, Globe2, MoreVertical, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { WidgetSummary } from '@/lib/hooks/use-widgets'

interface WidgetCardProps {
  widget: WidgetSummary
  onCopyEmbed: (widget: WidgetSummary) => void
  onDelete: (widget: WidgetSummary) => void
  isSelected?: boolean
  onToggleSelect?: () => void
  showCheckbox?: boolean
}

const STATUS_VARIANT: Record<string, 'active' | 'pending' | 'archived'> = {
  active: 'active',
  paused: 'pending',
  draft: 'archived',
}

function statusVariant(status: string) {
  return STATUS_VARIANT[status] ?? 'archived'
}

function statusLabel(status: string) {
  if (status === 'active') return 'Live'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'Today'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function WidgetCard({ widget, onCopyEmbed, onDelete, isSelected, onToggleSelect, showCheckbox }: WidgetCardProps) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const open = () => navigate(`/widgets/${widget.id}`)

  const handleCopy = async () => {
    await onCopyEmbed(widget)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const domainCount = widget.allowedDomains.length

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          open()
        }
      }}
      className={cn(
        "group relative cursor-pointer p-0 outline-none transition-all duration-200",
        isSelected && "border-primary/60 bg-primary/5 ring-1 ring-primary/20",
        !isSelected && "hover:-translate-y-0.5 hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      <CardContent className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          {showCheckbox && (
            <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={!!isSelected}
                onCheckedChange={onToggleSelect}
                className="size-4"
              />
            </div>
          )}
          <Avatar className="size-11 rounded-xl">
            {widget.agent.avatar && <AvatarImage src={widget.agent.avatar} alt={widget.name} />}
            <AvatarFallback className="rounded-xl bg-primary/10 text-sm font-semibold text-primary">
              {widget.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-foreground">{widget.name}</h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {widget.agent.name}
            </p>
          </div>
          <span className={cn(
            'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium border shrink-0',
            widget.status === 'active' && 'bg-success/10 text-success border-success/30',
            widget.status === 'paused' && 'bg-warning/10 text-warning border-warning/30',
            widget.status === 'draft' && 'bg-muted text-muted-foreground border-border',
          )}>
            {widget.status === 'active' ? 'Live' : widget.status.charAt(0).toUpperCase() + widget.status.slice(1)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            <Bot className="size-3.5" />
            <span className="max-w-[180px] truncate">{widget.agent.name}</span>
          </span>
          {domainCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              <Globe2 className="size-3" />
              {domainCount}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="size-3" />
            {timeAgo(widget.updatedAt)}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
        </div>
      </CardContent>
    </Card>
  )
}

export function WidgetCardSkeleton() {
  return (
    <Card className="p-0">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="size-11 rounded-xl" />
          <div className="flex-1 space-y-2 pt-0.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-5 w-32 rounded-md" />
        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="size-7 rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
}

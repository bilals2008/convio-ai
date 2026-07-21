import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Archive, Bot, Check, Clock, Copy, Eye, Globe2, LayoutDashboard, MoreVertical } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { WidgetSummary } from '@/lib/hooks/use-widgets'

interface WidgetCardProps {
  widget: WidgetSummary
  onCopyEmbed: (widget: WidgetSummary) => void
  onArchive: (widget: WidgetSummary) => void
}

const STATUS_META: Record<string, { label: string; className: string; dot: string }> = {
  active: { label: 'Live', className: 'border-success/20 bg-success/10 text-success', dot: 'bg-success' },
  paused: { label: 'Paused', className: 'border-warning/20 bg-warning/10 text-warning', dot: 'bg-warning' },
  draft: { label: 'Draft', className: 'border-border bg-muted/40 text-muted-foreground', dot: 'bg-muted-foreground' },
  archived: { label: 'Archived', className: 'border-border bg-muted/40 text-muted-foreground', dot: 'bg-muted-foreground' },
}

function statusMeta(status: string) {
  return (
    STATUS_META[status] ?? {
      label: status.charAt(0).toUpperCase() + status.slice(1),
      className: 'border-border bg-muted/40 text-muted-foreground',
      dot: 'bg-muted-foreground',
    }
  )
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

function StatusBadge({ status }: { status: string }) {
  const meta = statusMeta(status)
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium',
        meta.className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  )
}

export function WidgetCard({ widget, onCopyEmbed, onArchive }: WidgetCardProps) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const open = () => navigate(`/widgets/${widget.id}`)

  const handleCopy = async () => {
    await onCopyEmbed(widget)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const domainCount = widget.allowedDomains.length
  const firstDomain = widget.allowedDomains[0]

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
      className="group [--card-spacing:0px] cursor-pointer rounded-xl border border-border bg-card p-0 outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <CardContent className="flex h-full flex-col gap-4 p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar className="size-11 rounded-xl">
            {widget.agent.avatar ? (
              <AvatarImage src={widget.agent.avatar} alt={widget.agent.name} className="object-cover" />
            ) : null}
            <AvatarFallback className="rounded-xl bg-primary/10 text-primary">
              <LayoutDashboard className="size-5" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-foreground">{widget.name}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Bot className="size-3 shrink-0" />
              <span className="truncate">{widget.agent.name}</span>
            </p>
          </div>
          <StatusBadge status={widget.status} />
        </div>

        {/* Domains row */}
        <div className="flex items-center gap-1.5">
          {domainCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              <Globe2 className="size-3.5" />
              <span className="max-w-[140px] truncate">{firstDomain}</span>
              {domainCount > 1 && (
                <span className="text-muted-foreground/70">+{domainCount - 1}</span>
              )}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground/70">
              <Globe2 className="size-3.5" />
              No domains
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="size-3" />
            Edited {timeAgo(widget.updatedAt)}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }), 'text-muted-foreground hover:text-foreground')}
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
                onClick={(e) => { e.stopPropagation(); onArchive(widget) }}
              >
                <Archive className="size-4" />
                Archive
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
    <Card className="[--card-spacing:0px] rounded-xl border border-border p-0">
      <CardContent className="flex flex-col gap-4 p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="size-11 rounded-xl" />
          <div className="flex-1 space-y-2 pt-0.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-5 w-36 rounded-md" />
        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="size-7 rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
}

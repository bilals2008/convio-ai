import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Archive, Bot, Check, Clock, Copy, Eye, Globe2, LayoutDashboard, MoreHorizontal, Pause, Play, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ProductCard } from '@/components/shared/product-card'
import type { WidgetSummary } from '@/lib/hooks/use-widgets'

interface WidgetCardProps {
  widget: WidgetSummary
  onCopyEmbed: (widget: WidgetSummary) => void
  onArchive: (widget: WidgetSummary) => void
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
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export function WidgetCard({ widget, onCopyEmbed, onArchive }: WidgetCardProps) {
  const navigate = useNavigate()
  const isLive = widget.status === 'active'
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await onCopyEmbed(widget)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ProductCard className="p-4 sm:p-5">
      {/* Top row: icon, name, badge + menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:size-10">
            <LayoutDashboard className="size-4 text-primary sm:size-5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{widget.name}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Edited {timeAgo(widget.updatedAt)}
            </p>
          </div>
        </div>

        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className={`h-5 px-1.5 text-[10px] capitalize leading-tight border-transparent ${isLive ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}`}>
              {widget.status}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            {isLive ? 'Widget is live and accepting conversations' : 'Widget is not accepting conversations'}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Info row: agent, domains, created */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground sm:mt-4 sm:gap-x-5">
        <Tooltip>
          <TooltipTrigger>
            <span className="flex items-center gap-1.5">
              <Bot className="size-3.5" />
              {widget.agent.name}
            </span>
          </TooltipTrigger>
          <TooltipContent>Connected agent</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <span className="flex items-center gap-1.5">
              <Globe2 className="size-3.5" />
              {widget.allowedDomains.length
                ? `${widget.allowedDomains.length} domain${widget.allowedDomains.length > 1 ? 's' : ''}`
                : 'No domains'}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {widget.allowedDomains.length
              ? widget.allowedDomains.join(', ')
              : 'No domains configured yet'}
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <span className="flex items-center gap-1.5">
              {isLive ? (
                <Play className="size-3.5 text-success" />
              ) : (
                <Pause className="size-3.5" />
              )}
              {isLive ? 'Active' : 'Paused'}
            </span>
          </TooltipTrigger>
          <TooltipContent>Widget availability</TooltipContent>
        </Tooltip>
        <span className="flex items-center gap-1.5">
          <Clock className="size-3.5" />
          {timeAgo(widget.createdAt)}
        </span>
      </div>

      {/* Divider */}
      <div className="my-3.5 border-t border-border sm:my-4" />

      {/* Actions — desktop: all inline */}
      <div className="hidden items-center gap-2 md:flex">
        <Tooltip>
          <TooltipTrigger render={<Button size="sm" onClick={() => navigate(`/widgets/${widget.id}`)} />}>
            <Pencil className="size-3.5" />
            Configure
          </TooltipTrigger>
          <TooltipContent>Edit widget settings</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" size="sm" onClick={handleCopy} />}>
            {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
            {copied ? 'Copied!' : 'Copy Embed'}
          </TooltipTrigger>
          <TooltipContent>Copy installation script</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" size="sm" onClick={() => navigate(`/widgets/${widget.id}?tab=preview`)} />}>
            <Eye className="size-3.5" />
            Preview
          </TooltipTrigger>
          <TooltipContent>Open live preview</TooltipContent>
        </Tooltip>

        <div className="flex-1" />

        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onArchive(widget)} />}>
            <Archive className="size-3.5" />
            Archive
          </TooltipTrigger>
          <TooltipContent>Move widget to archive</TooltipContent>
        </Tooltip>
      </div>

      {/* Actions — mobile: Configure + 3-dot menu */}
      <div className="flex items-center gap-2 md:hidden">
        <Button size="sm" className="flex-1" onClick={() => navigate(`/widgets/${widget.id}`)}>
          <Pencil className="size-3.5" />
          Configure
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="icon" className="size-8 shrink-0" />}>
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopy}>
              {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
              {copied ? 'Copied!' : 'Copy Embed'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/widgets/${widget.id}?tab=preview`)}>
              <Eye className="size-4" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onArchive(widget)}>
              <Archive className="size-4" />
              Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </ProductCard>
  )
}

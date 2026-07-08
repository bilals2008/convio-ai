import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MoreVertical, Pencil, Trash2, ExternalLink, Eye, MessageCircle } from 'lucide-react'

export interface Widget {
  id: string
  name: string
  botId: string
  botName?: string
  primaryColor?: string
  position?: 'bottom-right' | 'bottom-left'
  greeting?: string
  status: 'active' | 'inactive'
  conversations?: number
  updatedAt: string
  createdAt: string
}

interface WidgetCardProps {
  widget: Widget
  onDelete: (widget: Widget) => void
}

export function WidgetCard({ widget, onDelete }: WidgetCardProps) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const handleCopyEmbed = () => {
    const code = `<script src="https://cdn.convio.com/widget.js" data-widget-id="${widget.id}"></script>`
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="group relative p-5 transition-all hover:shadow-md hover:border-primary/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl shadow-sm"
            style={{ backgroundColor: `${widget.primaryColor || '#fb923c'}15` }}
          >
            <MessageCircle
              className="size-5"
              style={{ color: widget.primaryColor || '#fb923c' }}
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold truncate">{widget.name}</h3>
            <p className="text-xs text-muted-foreground truncate">
              {widget.botName || 'No bot linked'}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => navigate(`/widgets/${widget.id}/edit`)}>
              <Pencil className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(`/widget/demo?widget=${widget.id}`, '_blank')}>
              <ExternalLink className="mr-2 size-4" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyEmbed}>
              {copied ? 'Copied!' : 'Copy Embed Code'}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(widget)}
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: widget.primaryColor || '#fb923c' }}
          />
          <span className="capitalize">{(widget.position || 'bottom-right').replace('-', ' ')}</span>
        </div>
        <Badge
          variant={widget.status === 'active' ? 'default' : 'secondary'}
          className="text-[10px] px-1.5 py-0"
        >
          {widget.status}
        </Badge>
        {widget.conversations != null && (
          <span>{widget.conversations} conversations</span>
        )}
      </div>

      <div className="mt-3 pt-3 border-t flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          Updated {new Date(widget.updatedAt).toLocaleDateString()}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => navigate(`/widgets/${widget.id}/edit`)}
            >
              <Eye className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            View details
          </TooltipContent>
        </Tooltip>
      </div>
    </Card>
  )
}

interface WidgetDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  widgetName: string
  onConfirm: () => void
}

export function WidgetDeleteDialog({
  open,
  onOpenChange,
  widgetName,
  onConfirm,
}: WidgetDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Widget</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{widgetName}</strong>? This will remove the widget
            from your website. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

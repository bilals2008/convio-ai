import { useCallback, useState } from 'react'
import { ArrowLeft, Check, Code2, Copy, ExternalLink, Eye, EyeOff, MoreVertical, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { WidgetDetail } from '../types'
import { STATUS_INDICATOR } from '../constants'

interface WidgetHeaderProps {
  widget: WidgetDetail
  name: string
  isDirty: boolean
  copied: boolean
  position: string
  savePending: boolean
  showPreview?: boolean
  onTogglePreview?: () => void
  onSave: (status?: string) => void
  onCopyEmbed: () => void
  onDeleteOpen: () => void
  onBack: () => void
}

export function WidgetHeader({
  widget,
  name,
  isDirty,
  copied,
  position,
  savePending,
  showPreview = true,
  onTogglePreview,
  onSave,
  onCopyEmbed,
  onDeleteOpen,
  onBack,
}: WidgetHeaderProps) {
  const isLive = widget.status === 'active'
  const status = STATUS_INDICATOR[widget.status] ?? STATUS_INDICATOR.draft
  const [keyCopied, setKeyCopied] = useState(false)

  const copyKey = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(widget.publicKey)
      setKeyCopied(true)
      window.setTimeout(() => setKeyCopied(false), 1800)
    } catch {
      /* clipboard unavailable */
    }
  }, [widget.publicKey])

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground/70 hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Back to widgets
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5 min-w-0">
          {widget.agent.avatar ? (
            <img
              src={widget.agent.avatar}
              alt=""
              className="size-11 shrink-0 rounded-full object-cover ring-1 ring-border/30"
            />
          ) : (
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-semibold text-primary ring-1 ring-primary/10">
              {widget.agent.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 pt-0.5">
            <div className="flex items-center gap-2.5">
              <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
                {name}
              </h1>
              {isDirty && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/15 bg-warning/5 px-2 py-0.5 text-[10px] font-medium text-warning">
                  <span className="size-1.5 rounded-full bg-warning" />
                  Unsaved
                </span>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground/70">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium',
                  isLive
                    ? 'bg-success/8 text-success'
                    : widget.status === 'paused'
                      ? 'bg-warning/8 text-warning'
                      : 'bg-muted/50 text-muted-foreground',
                )}
              >
                <span className={cn('size-1.5 rounded-full', isLive && 'bg-success animate-pulse')} />
                {status.label}
              </span>
              <span className="text-muted-foreground/50">·</span>
              <span>{widget.agent.name}</span>
              <span className="text-muted-foreground/50">·</span>
              <button
                onClick={copyKey}
                className="group inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                {widget.publicKey.slice(0, 8)}
                {keyCopied ? (
                  <Check className="size-3 text-success" />
                ) : (
                  <Copy className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={onTogglePreview}
            className={cn('size-8', !showPreview && 'text-muted-foreground/40')}
            aria-label={showPreview ? 'Hide preview' : 'Show preview'}
          >
            {showPreview ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
          </Button>
          <Button variant="outline" size="sm" onClick={onCopyEmbed} className="h-8 text-xs gap-1.5">
            <Code2 className="size-3.5" />
            Get Code
          </Button>
          <Button size="sm" onClick={() => onSave()} disabled={!isDirty || savePending} className="h-8 text-xs gap-1.5">
            <Save className="size-3.5" />
            {savePending ? 'Saving...' : 'Save'}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground/60 hover:bg-muted/50 hover:text-foreground transition-colors">
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={onCopyEmbed}>
                {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                {copied ? 'Copied!' : 'Copy embed code'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  window.open(
                    `/widget/demo?embed=true&widgetKey=${widget.publicKey}&position=${position}&preview=true`,
                    '_blank',
                  )
                }
              >
                <ExternalLink className="size-3.5" />
                Live preview
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onDeleteOpen}>
                <Trash2 className="size-3.5" />
                Delete widget
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

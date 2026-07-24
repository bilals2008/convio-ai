import { useCallback, useState } from 'react'
import {
  ArrowLeft,
  Check,
  Code2,
  Copy,
  ExternalLink,
  MoreVertical,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
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
  onSave,
  onCopyEmbed,
  onDeleteOpen,
  onBack,
}: WidgetHeaderProps) {
  const isLive = widget.status === 'active'
  const status = STATUS_INDICATOR[widget.status] ?? STATUS_INDICATOR.draft
  const [keyCopied, setKeyCopied] = useState(false)

  const handlePublishToggle = useCallback(
    (checked: boolean) => onSave(checked ? 'active' : 'paused'),
    [onSave],
  )

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
    <header className="space-y-4">
      <div className="flex items-start gap-4">
        <button
          onClick={onBack}
          aria-label="Go back to widgets list"
          className="group mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:rounded-md"
        >
          <ArrowLeft
            className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
          Widgets
        </button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          {widget.agent.avatar ? (
            <img
              src={widget.agent.avatar}
              alt=""
              className="size-10 shrink-0 rounded-full object-cover ring-1 ring-foreground/10"
            />
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground ring-1 ring-foreground/10">
              {widget.agent.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 space-y-1.5">
            <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
              {name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
              <span
                className={cn(
                   'inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium',
                  isLive
                    ? 'bg-success/10 text-success'
                    : widget.status === 'paused'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {status.label}
              </span>

              <span className="h-3 w-px bg-border" aria-hidden="true" />

              <span className="inline-flex items-center gap-1">
                <span className="font-medium text-foreground">{widget.agent.name}</span>
              </span>

              <span className="h-3 w-px bg-border" aria-hidden="true" />

              <button
                onClick={copyKey}
                aria-label="Copy widget public key"
                className="group/key inline-flex items-center gap-1 rounded px-1 py-0.5 transition-colors duration-200 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground/80">
                  {widget.publicKey.slice(0, 8)}
                </span>
                {keyCopied ? (
                  <Check className="size-3 text-success" aria-hidden="true" />
                ) : (
                  <Copy className="size-3 text-muted-foreground/0 transition-colors group-hover/key:text-muted-foreground" aria-hidden="true" />
                )}
              </button>

              {isDirty && (
                <>
                  <span className="h-3 w-px bg-border" aria-hidden="true" />
                   <span className="inline-flex items-center gap-1 rounded border border-warning/20 bg-warning/5 px-2 py-0.5 text-[11px] font-medium text-warning" role="status">
                    <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" />
                    Unsaved
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCopyEmbed}
            aria-label="Get embed code"
          >
            <Code2 className="size-3.5" aria-hidden="true" />
            Get Code
          </Button>

          <span className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-1.5">
            <Switch
              size="sm"
              checked={isLive}
              onCheckedChange={handlePublishToggle}
              disabled={savePending}
              aria-label={isLive ? 'Pause widget' : 'Resume widget'}
            />
            <span className="text-xs font-medium text-muted-foreground select-none">
              {isLive ? 'Live' : 'Paused'}
            </span>
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label="More actions"
            >
              <MoreVertical className="size-4" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={onCopyEmbed}>
                {copied ? (
                  <Check className="size-4 text-success" aria-hidden="true" />
                ) : (
                  <Copy className="size-4" aria-hidden="true" />
                )}
                {copied ? 'Copied embed code' : 'Copy embed code'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  window.open(
                    `/widget/demo?embed=true&widgetKey=${widget.publicKey}&position=${position}&preview=true`,
                    '_blank',
                  )
                }
              >
                <ExternalLink className="size-4" aria-hidden="true" />
                Open live preview
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onDeleteOpen}>
                <Trash2 className="size-4" aria-hidden="true" />
                Delete widget
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

import { useState } from 'react'
import { Check, Code2, Copy, ExternalLink, Link2, Loader2, Share2, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ShareDialogProps {
  shareUrl?: string
  agentName?: string
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onCreate?: () => void
  onRemove?: () => void
  isCreating?: boolean
  isRemoving?: boolean
}

export function ShareDialog({
  shareUrl,
  agentName,
  children,
  open,
  onOpenChange,
  onCreate,
  onRemove,
  isCreating = false,
  isRemoving = false,
}: ShareDialogProps) {
  const [copied, setCopied] = useState<'link' | 'embed' | null>(null)

  const copy = (value: string, type: 'link' | 'embed') => {
    void navigator.clipboard.writeText(value)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleCopyLink = () => {
    if (shareUrl) copy(shareUrl, 'link')
  }

  const handleCopyEmbed = () => {
    if (shareUrl) copy(`<iframe src="${shareUrl}" width="400" height="600" frameborder="0"></iframe>`, 'embed')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && (
        <DialogTrigger
          render={<span />}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="w-[calc(100vw-2rem)] max-h-[85vh] gap-0 overflow-hidden p-0 sm:w-full sm:max-w-lg">
        <DialogHeader className="border-b bg-muted/20 p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Share2 className="size-5" />
            </div>
            <div className="min-w-0 space-y-1 pr-5 sm:pr-0">
              <DialogTitle className="text-base font-semibold">Share {agentName || 'agent'}</DialogTitle>
              <DialogDescription className="text-xs">
                Give people a direct link to chat with this agent.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {shareUrl ? (
          <div className="max-h-[calc(85vh-120px)] space-y-4 overflow-y-auto p-4 sm:p-5">
            <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-background text-primary">
                  <Link2 className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Public chat link</p>
                  <p className="text-xs text-muted-foreground">Anyone with this link can start a conversation.</p>
                </div>
                <Badge variant="secondary" className="ml-auto shrink-0 gap-1.5 border-0 bg-success/10 text-success">
                  <span className="size-1.5 rounded-full bg-success" />
                  Live
                </Badge>
              </div>
              <div className="flex min-w-0 items-center gap-2 overflow-hidden rounded-lg border border-border/60 bg-background p-2">
                <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap px-1 text-xs text-foreground">{shareUrl}</code>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={handleCopyLink}
                  aria-label="Copy public chat link"
                  className="shrink-0"
                >
                  {copied === 'link' ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3 sm:gap-2">
              <Button type="button" variant="outline" className="h-auto w-full justify-start gap-2 p-3 text-left" onClick={handleCopyLink}>
                <Copy className="size-4 shrink-0" />
                <span className="min-w-0">
                  <span className="block min-w-0 truncate text-xs font-medium">{copied === 'link' ? 'Copied' : 'Copy link'}</span>
                  <span className="block text-[10px] font-normal text-muted-foreground">Clipboard</span>
                </span>
              </Button>
              <Button type="button" variant="outline" className="h-auto w-full justify-start gap-2 p-3 text-left" onClick={handleCopyEmbed}>
                <Code2 className="size-4 shrink-0" />
                <span className="min-w-0">
                  <span className="block min-w-0 truncate text-xs font-medium">{copied === 'embed' ? 'Copied' : 'Embed'}</span>
                  <span className="block text-[10px] font-normal text-muted-foreground">Iframe code</span>
                </span>
              </Button>
              <Button type="button" variant="outline" className="h-auto w-full justify-start gap-2 p-3 text-left" onClick={() => window.open(shareUrl, '_blank')}>
                <ExternalLink className="size-4 shrink-0" />
                <span className="min-w-0">
                  <span className="block min-w-0 truncate text-xs font-medium">Preview</span>
                  <span className="block text-[10px] font-normal text-muted-foreground">New tab</span>
                </span>
              </Button>
            </div>

            {onRemove && (
              <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onRemove} disabled={isRemoving}>
                {isRemoving ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                Disable public link
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-y-auto p-4 sm:p-5">
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-center">
              <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-background text-muted-foreground">
                <Link2 className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium">No public link yet</p>
              <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                Create a shareable link so anyone can start chatting with {agentName || 'this agent'}.
              </p>
              {onCreate && (
                <Button type="button" className="mt-4" onClick={onCreate} disabled={isCreating}>
                  {isCreating ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />}
                  {isCreating ? 'Creating link…' : 'Create public link'}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

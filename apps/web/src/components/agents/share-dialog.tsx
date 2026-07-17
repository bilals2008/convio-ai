import { useState } from 'react'
import { Copy, Check, ExternalLink, Link, Code } from 'lucide-react'
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
  children: React.ReactNode
}

export function ShareDialog({ shareUrl, agentName, children }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenInNewTab = () => {
    if (shareUrl) window.open(shareUrl, '_blank')
  }

  const shareOptions = [
    {
      label: 'Copy Link',
      icon: copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />,
      onClick: handleCopy,
      description: copied ? 'Copied!' : 'Copy link to clipboard',
    },
    {
      label: 'Open',
      icon: <ExternalLink className="size-4" />,
      onClick: handleOpenInNewTab,
      description: 'Open in new tab',
    },
    {
      label: 'Embed',
      icon: <Code className="size-4" />,
      onClick: () => {
        if (shareUrl) {
          navigator.clipboard.writeText(`<iframe src="${shareUrl}" width="400" height="600" frameborder="0"></iframe>`)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }
      },
      description: 'Copy embed code',
    },
  ]

  return (
    <Dialog>
      <DialogTrigger
        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3">
          <DialogTitle className="text-base font-semibold flex items-center justify-between">
            Share {agentName || 'Agent'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Share this agent's chat link with anyone
          </DialogDescription>
        </DialogHeader>

        {shareUrl ? (
          <div className="px-5 pb-5 space-y-3">
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 p-3">
              <Link className="size-4 shrink-0 text-muted-foreground" />
              <code className="flex-1 truncate text-xs text-foreground">{shareUrl}</code>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 rounded-md bg-background border border-border/60 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {shareOptions.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={opt.onClick}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-muted/40 transition-colors"
                >
                  <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    {opt.icon}
                  </div>
                  <div>
                    <p className="text-xs font-medium">{opt.label}</p>
                    <p className="text-[10px] text-muted-foreground">{opt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-5 pb-5">
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-4 text-center">
              <Link className="size-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Enable <strong>Shareable Link</strong> in the Settings tab first
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

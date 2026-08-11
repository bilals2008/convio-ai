import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ActionLinkDialogProps {
  title: string
  description: string
  link: string
  onClose: () => void
}

export function ActionLinkDialog({ title, description, link, onClose }: ActionLinkDialogProps) {
  const copy = async () => {
    await navigator.clipboard.writeText(link)
    toast.success('Link copied to clipboard')
  }
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
          <code className="min-w-0 flex-1 truncate text-xs">{link}</code>
          <Button variant="outline" size="sm" onClick={copy}>Copy</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
import { useState } from 'react'
import { Loader2, Copy, Check, Eye, EyeOff } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ApiKeyCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (name: string) => void
  loading?: boolean
  createdKey?: { name: string; key: string } | null
}

export function ApiKeyCreateDialog({ open, onOpenChange, onSubmit, loading, createdKey }: ApiKeyCreateDialogProps) {
  const [name, setName] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit(name.trim())
    setName('')
  }

  const handleCopy = () => {
    if (createdKey?.key) {
      navigator.clipboard.writeText(createdKey.key)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setName('')
    setCopied(false)
  }

  if (createdKey) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Copy this key now. You won't be able to see it again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground mb-1">{createdKey.name}</p>
              <code className="text-sm font-mono break-all">{createdKey.key}</code>
            </div>
            <Button onClick={handleCopy} className="w-full" variant="outline">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? 'Copied!' : 'Copy Key'}
            </Button>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate API Key</DialogTitle>
          <DialogDescription>Create a new API key for programmatic access</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key-name">Name</Label>
            <Input
              id="key-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Production, CI/CD"
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              Generate Key
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

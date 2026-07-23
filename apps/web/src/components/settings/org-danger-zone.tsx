import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useRole } from '@/lib/hooks/useRole'

interface OrgDangerZoneProps {
  orgName: string
  onDelete: () => void
  loading?: boolean
}

export function OrgDangerZone({ orgName, onDelete, loading }: OrgDangerZoneProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const role = useRole()

  const handleDelete = () => {
    if (deleteConfirmText !== orgName) {
      setDeleteError(`Please type "${orgName}" to confirm`)
      return
    }
    setDeleteError('')
    onDelete()
    setDeleteOpen(false)
    setDeleteConfirmText('')
  }

  const handleCloseDialog = () => {
    setDeleteOpen(false)
    setDeleteConfirmText('')
    setDeleteError('')
  }

  if (role !== 'owner') return null

  return (
    <>
      <div className="rounded-xl border border-destructive/20 bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <Trash2 className="size-4 text-destructive" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Danger Zone</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
              Permanently delete this organization and all its data — bots, agents, conversations, and settings. This action cannot be undone.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            disabled={loading}
            className="shrink-0"
          >
            {loading && <Loader2 className="size-3.5 animate-spin" />}
            Delete Organization
          </Button>
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 className="size-4 text-destructive" />
              </span>
              Delete Organization
            </DialogTitle>
            <DialogDescription>
              Type <span className="font-medium text-foreground">"{orgName}"</span> to confirm. All bots, agents, conversations, and data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Input
              type="text"
              placeholder={`Type "${orgName}"`}
              value={deleteConfirmText}
              onChange={(e) => {
                setDeleteConfirmText(e.target.value)
                if (deleteError) setDeleteError('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && deleteConfirmText === orgName) {
                  handleDelete()
                }
              }}
              className={deleteError ? 'border-destructive focus-visible:ring-destructive/20' : ''}
              disabled={loading}
              autoFocus
            />
            {deleteError && (
              <p className="text-xs text-destructive">{deleteError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading || deleteConfirmText !== orgName}
            >
              {loading && <Loader2 className="size-3.5 animate-spin" />}
              Delete Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface KnowledgeDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kbName: string
  documentCount: number
  onConfirm: () => void
}

export function KnowledgeDeleteDialog({
  open,
  onOpenChange,
  kbName,
  documentCount,
  onConfirm,
}: KnowledgeDeleteDialogProps) {
  const [confirmText, setConfirmText] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = () => {
    if (confirmText !== kbName) {
      setError('Name does not match')
      return
    }
    setError('')
    onConfirm()
    setConfirmText('')
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            Delete Knowledge Base
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <span className="font-medium text-foreground">{kbName}</span> and{' '}
            <span className="font-medium text-foreground">{documentCount} document{documentCount !== 1 ? 's' : ''}</span>.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="confirm-delete-kb">
            Type <span className="font-medium text-foreground">{kbName}</span> to confirm
          </Label>
          <Input
            id="confirm-delete-kb"
            value={confirmText}
            onChange={(e) => { setConfirmText(e.target.value); setError('') }}
            placeholder={kbName}
            aria-invalid={!!error}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => { setConfirmText(''); setError('') }}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={confirmText !== kbName}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

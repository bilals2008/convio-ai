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

interface BotDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  botName: string
  onConfirm: () => void
}

export function BotDeleteDialog({
  open,
  onOpenChange,
  botName,
  onConfirm,
}: BotDeleteDialogProps) {
  const [confirmText, setConfirmText] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = () => {
    if (confirmText !== botName) {
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
            Delete Bot
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <span className="font-medium text-foreground">{botName}</span> and
            all its conversations. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="confirm-delete-bot">
            Type <span className="font-medium text-foreground">{botName}</span> to confirm
          </Label>
          <Input
            id="confirm-delete-bot"
            value={confirmText}
            onChange={(e) => { setConfirmText(e.target.value); setError('') }}
            placeholder={botName}
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
            disabled={confirmText !== botName}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            Delete Bot
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

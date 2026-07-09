import { z } from 'zod'
import { AlertTriangle, Loader2 } from 'lucide-react'
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
import { useState } from 'react'

const confirmSchema = z.string().min(1, 'Type agent name to confirm')

interface AgentDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agentName: string
  onConfirm: () => void
  isPending?: boolean
}

export function AgentDeleteDialog({
  open,
  onOpenChange,
  agentName,
  onConfirm,
  isPending,
}: AgentDeleteDialogProps) {
  const [confirmText, setConfirmText] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = () => {
    const result = confirmSchema.safeParse(confirmText)
    if (!result.success) {
      setError(result.error.errors[0].message)
      return
    }
    if (confirmText !== agentName) {
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
            Delete Agent
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the agent
            and remove it from all deployments.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="confirm-delete">
            Type <span className="font-medium text-foreground">{agentName}</span> to confirm
          </Label>
          <Input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value)
              setError('')
            }}
            placeholder={agentName}
            aria-invalid={!!error}
          />
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => {
            setConfirmText('')
            setError('')
          }}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={confirmText !== agentName || isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            {isPending && <Loader2 className="size-4 animate-spin mr-1" />}
            {isPending ? 'Deleting...' : 'Delete Agent'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

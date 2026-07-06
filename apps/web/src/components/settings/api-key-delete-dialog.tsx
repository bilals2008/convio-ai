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

interface ApiKeyDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  keyName: string
  onConfirm: () => void
  loading?: boolean
}

export function ApiKeyDeleteDialog({
  open,
  onOpenChange,
  keyName,
  onConfirm,
  loading,
}: ApiKeyDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            Revoke API Key
          </AlertDialogTitle>
          <AlertDialogDescription>
            Revoke <span className="font-medium text-foreground">{keyName}</span>? Any applications using this key will immediately lose access.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Revoke Key
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

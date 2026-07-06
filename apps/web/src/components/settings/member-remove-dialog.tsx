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

interface MemberRemoveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberName: string
  memberEmail: string
  onConfirm: () => void
  loading?: boolean
}

export function MemberRemoveDialog({
  open,
  onOpenChange,
  memberName,
  memberEmail,
  onConfirm,
  loading,
}: MemberRemoveDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            Remove Member
          </AlertDialogTitle>
          <AlertDialogDescription>
            Remove <span className="font-medium text-foreground">{memberName}</span> ({memberEmail}) from this organization?
            They will lose access to all resources immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

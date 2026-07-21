import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useDeleteAccount } from '@/lib/hooks/use-profile'

export function DangerZoneCard() {
  const navigate = useNavigate()
  const deleteAccount = useDeleteAccount()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteError, setDeleteError] = useState('')

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== 'delete my account') {
      setDeleteError('Please type "delete my account" to confirm')
      return
    }
    setDeleteError('')
    deleteAccount.mutate(undefined, {
      onSuccess: () => {
        toast.success('Account deleted')
        navigate('/login', { replace: true })
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete account')
      },
    })
  }

  return (
    <>
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="size-4" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            disabled={deleteAccount.isPending}
          >
            {deleteAccount.isPending && <Loader2 className="size-3.5 animate-spin" />}
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteOpen(false)
            setDeleteConfirmText('')
            setDeleteError('')
          }
        }}
        title="Delete Account"
        description='Type "delete my account" to confirm. All your data will be permanently deleted.'
        confirmText="Delete Account"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteAccount}
      />
    </>
  )
}

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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

  const handleCloseDialog = () => {
    setDeleteOpen(false)
    setDeleteConfirmText('')
    setDeleteError('')
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

      <Dialog open={deleteOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 className="size-4 text-destructive" />
              </span>
              Delete Account
            </DialogTitle>
            <DialogDescription>
              Type <span className="font-medium text-foreground">"delete my account"</span> to confirm. All your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Input
              type="text"
              placeholder='Type "delete my account"'
              value={deleteConfirmText}
              onChange={(e) => {
                setDeleteConfirmText(e.target.value)
                if (deleteError) setDeleteError('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && deleteConfirmText === 'delete my account') {
                  handleDeleteAccount()
                }
              }}
              className={deleteError ? 'border-destructive focus-visible:ring-destructive/20' : ''}
              disabled={deleteAccount.isPending}
              autoFocus
            />
            {deleteError && (
              <p className="text-xs text-destructive">{deleteError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={deleteAccount.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteAccount.isPending || deleteConfirmText !== 'delete my account'}
            >
              {deleteAccount.isPending && <Loader2 className="size-3.5 animate-spin" />}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

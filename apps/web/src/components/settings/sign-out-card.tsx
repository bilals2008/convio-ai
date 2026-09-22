import { useState } from 'react'
import { Loader2, LogOut, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { useAuth } from '@/lib/auth-context'
import { useSignOutAll } from '@/lib/hooks/use-security'

export function SignOutCard() {
  const { logout } = useAuth()
  const signOutAll = useSignOutAll()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const busy = logout.isPending || signOutAll.isPending

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="size-4" />
            Sign Out
          </CardTitle>
          <CardDescription>
            Sign out of this device only, or end every active session across all your devices.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {/* type="button" is required — this card renders inside the profile form,
              and a default submit button would save the form instead. */}
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => logout.mutate()}
          >
            {logout.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <LogOut className="size-3.5" />}
            Sign out
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={busy}
            onClick={() => setConfirmOpen(true)}
          >
            <ShieldAlert className="size-3.5" />
            Sign out of all devices
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out of all devices?</AlertDialogTitle>
            <AlertDialogDescription>
              This ends your session everywhere, including this device, and revokes all refresh
              tokens. You will need to sign in again on every device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={signOutAll.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={signOutAll.isPending}
              onClick={() => signOutAll.mutate()}
            >
              {signOutAll.isPending && <Loader2 className="size-3.5 animate-spin" />}
              Sign out everywhere
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

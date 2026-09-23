import { useState } from 'react'
import { Fingerprint, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  isPasskeySupported,
  useDeletePasskey,
  usePasskeys,
  useRegisterPasskey,
  useRenamePasskey,
  type Passkey,
} from '@/lib/hooks/use-passkeys'

function formatDate(iso?: string): string {
  if (!iso) return 'Never'
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function PasskeysCard() {
  const supported = isPasskeySupported()
  const { data: passkeys = [], isLoading, isError } = usePasskeys()
  const registerPasskey = useRegisterPasskey()
  const renamePasskey = useRenamePasskey()
  const deletePasskey = useDeletePasskey()

  const [renameTarget, setRenameTarget] = useState<Passkey | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Passkey | null>(null)

  function openRename(passkey: Passkey) {
    setRenameTarget(passkey)
    setRenameValue(passkey.friendly_name ?? '')
  }

  function submitRename(e: React.FormEvent) {
    e.preventDefault()
    if (!renameTarget) return
    const friendlyName = renameValue.trim()
    if (!friendlyName) return

    renamePasskey.mutate(
      { passkeyId: renameTarget.id, friendlyName },
      { onSuccess: () => setRenameTarget(null) }
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Fingerprint className="size-4" />
          </div>
          <div className="min-w-0 space-y-1">
            <CardTitle>Passkeys</CardTitle>
            <CardDescription>
              Sign in without a password using your device biometrics, PIN or a security key.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!supported ? (
          <p className="text-sm text-muted-foreground">
            This browser doesn't support passkeys. Try a recent version of Chrome, Safari, Edge or Firefox.
          </p>
        ) : isLoading ? (
          <div className="flex h-24 items-center justify-center">
            <Spinner />
          </div>
        ) : isError ? (
          <p className="text-sm text-muted-foreground">Could not load your passkeys.</p>
        ) : (
          <div className="space-y-4">
            {passkeys.length === 0 ? (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Fingerprint />
                  </EmptyMedia>
                  <EmptyTitle>No passkeys yet</EmptyTitle>
                  <EmptyDescription>
                    Add a passkey to sign in faster and protect your account from phishing.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                {passkeys.map((passkey) => (
                  <li key={passkey.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Fingerprint className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{passkey.friendly_name || 'Passkey'}</p>
                      <p className="text-xs text-muted-foreground">
                        Added {formatDate(passkey.created_at)} · Last used {formatDate(passkey.last_used_at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Rename ${passkey.friendly_name || 'passkey'}`}
                        onClick={() => openRename(passkey)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${passkey.friendly_name || 'passkey'}`}
                        onClick={() => setDeleteTarget(passkey)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <Button
              type="button"
              onClick={() => registerPasskey.mutate()}
              disabled={registerPasskey.isPending}
            >
              {registerPasskey.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
              Add passkey
            </Button>
          </div>
        )}
      </CardContent>

      <Dialog open={!!renameTarget} onOpenChange={(open) => { if (!open) setRenameTarget(null) }}>
        <DialogContent>
          <form onSubmit={submitRename}>
            <DialogHeader>
              <DialogTitle>Rename passkey</DialogTitle>
              <DialogDescription>
                Give this passkey a name so you can recognise it later.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="py-4">
              <Field>
                <FieldLabel htmlFor="passkey-name">Name</FieldLabel>
                <Input
                  id="passkey-name"
                  value={renameValue}
                  maxLength={120}
                  onChange={(e) => setRenameValue(e.target.value)}
                  placeholder="e.g. Work laptop"
                  autoFocus
                />
              </Field>
            </FieldGroup>
            <DialogFooter className="border-t-0 bg-transparent p-0 pt-4">
              <Button type="button" variant="outline" onClick={() => setRenameTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={renamePasskey.isPending || !renameValue.trim()}>
                {renamePasskey.isPending && <Loader2 className="size-3.5 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove passkey</AlertDialogTitle>
            <AlertDialogDescription>
              Remove <span className="font-medium text-foreground">{deleteTarget?.friendly_name || 'this passkey'}</span>?
              You will no longer be able to sign in with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deletePasskey.isPending}
              onClick={() => {
                if (!deleteTarget) return
                deletePasskey.mutate(
                  { passkeyId: deleteTarget.id },
                  { onSuccess: () => setDeleteTarget(null) }
                )
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

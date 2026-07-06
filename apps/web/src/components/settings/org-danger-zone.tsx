import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'

interface OrgDangerZoneProps {
  orgName: string
  onDelete: () => void
  loading?: boolean
}

export function OrgDangerZone({ orgName, onDelete, loading }: OrgDangerZoneProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [error, setError] = useState('')

  const handleDelete = () => {
    if (confirmText !== orgName) {
      setError('Organization name does not match')
      return
    }
    setError('')
    onDelete()
    setConfirmOpen(false)
    setConfirmText('')
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <AlertTriangle className="size-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>
          Permanently delete this organization and all its data. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="destructive"
          onClick={() => setConfirmOpen(true)}
          disabled={loading}
        >
          Delete Organization
        </Button>
      </CardContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => { if (!open) { setConfirmOpen(false); setConfirmText(''); setError('') } }}
        title="Delete Organization"
        description={`Type "${orgName}" to confirm deletion. All bots, agents, conversations, and data will be permanently deleted.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </Card>
  )
}

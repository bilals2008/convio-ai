import { useState } from 'react'
import { Loader2, Copy, Check } from 'lucide-react'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const inviteSchema = z.object({
  email: z.string().email('Valid email required'),
  role: z.enum(['admin', 'member']),
})

interface MemberInviteFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { email: string; role: 'admin' | 'member' }) => void
  loading?: boolean
  inviteLink?: string
}

export function MemberInviteForm({ open, onOpenChange, onSubmit, loading, inviteLink }: MemberInviteFormProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'member'>('member')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = inviteSchema.safeParse({ email, role })
    if (!result.success) {
      setError(result.error.errors[0].message)
      return
    }
    setError('')
    onSubmit(result.data)
    setEmail('')
    setRole('member')
  }

  const handleCopy = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>Send an invitation to join your organization</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              disabled={loading}
              aria-invalid={!!error}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as 'admin' | 'member')}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {inviteLink && (
            <div className="space-y-2">
              <Label>Invite Link</Label>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="flex-1" />
                <Button type="button" variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              Send Invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

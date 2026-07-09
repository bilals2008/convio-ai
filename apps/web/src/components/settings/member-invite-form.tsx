import { useState } from 'react'
import { Loader2, Copy, Check, Plus, X } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'

interface MemberEntry {
  email: string
  role: 'admin' | 'member'
}

interface MemberInviteFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { members: Array<{ email: string; role: string }> }) => void
  loading?: boolean
  inviteLink?: string
}

export function MemberInviteForm({ open, onOpenChange, onSubmit, loading, inviteLink }: MemberInviteFormProps) {
  const [members, setMembers] = useState<MemberEntry[]>([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'member'>('member')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const addMember = () => {
    const result = z.string().email().safeParse(email)
    if (!result.success) {
      setError('Valid email required')
      return
    }
    if (members.some((m) => m.email === email)) {
      setError('Email already added')
      return
    }
    setError('')
    setMembers([...members, { email, role }])
    setEmail('')
  }

  const removeMember = (idx: number) => {
    setMembers(members.filter((_, i) => i !== idx))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (members.length === 0) {
      setError('Add at least one member')
      return
    }
    setError('')
    onSubmit({ members })
    setMembers([])
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
          <DialogTitle>Invite Members</DialogTitle>
          <DialogDescription>Add team members to your organization</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addMember()
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as 'admin' | 'member')}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="button" variant="outline" size="icon" className="shrink-0 mb-0.5" onClick={addMember}>
              <Plus className="size-4" />
            </Button>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          {members.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {members.map((m, i) => (
                <Badge key={i} variant="secondary" className="gap-1.5 py-1">
                  <span>{m.email}</span>
                  <span className="text-[10px] text-muted-foreground">({m.role})</span>
                  <button
                    type="button"
                    onClick={() => removeMember(i)}
                    className="ml-0.5 hover:text-destructive"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

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
            <Button type="submit" disabled={loading || members.length === 0}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              Send {members.length > 1 ? `${members.length} Invites` : 'Invite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

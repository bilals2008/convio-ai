import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type MemberRole = 'owner' | 'admin' | 'member'

interface MemberRoleSelectProps {
  value: MemberRole
  onChange: (role: MemberRole) => void
  disabled?: boolean
  isOwner?: boolean
}

export function MemberRoleSelect({ value, onChange, disabled, isOwner }: MemberRoleSelectProps) {
  if (isOwner) {
    return (
      <span className="inline-flex h-8 items-center rounded-full bg-primary/10 px-2.5 text-xs font-medium text-primary">
        Owner
      </span>
    )
  }

  return (
    <Select value={value} onValueChange={(v) => onChange(v as MemberRole)} disabled={disabled}>
      <SelectTrigger className="h-8 w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="member">Member</SelectItem>
      </SelectContent>
    </Select>
  )
}

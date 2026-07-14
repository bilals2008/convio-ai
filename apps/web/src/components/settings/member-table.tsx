import { User, MoreVertical } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MemberRoleSelect } from './member-role-select'

type MemberRole = 'owner' | 'admin' | 'member'

interface Member {
  id: string
  userId: string
  name: string
  email: string
  role: MemberRole
  joinedAt: string
}

interface MemberTableProps {
  members: Member[]
  onRoleChange: (userId: string, role: MemberRole) => void
  onRemove: (userId: string) => void
  loading?: boolean
}

export function MemberTable({ members, onRoleChange, onRemove, loading }: MemberTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                  <User className="size-4 text-muted-foreground" />
                </div>
                <span className="font-medium">{member.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">{member.email}</TableCell>
            <TableCell className="align-middle">
              <MemberRoleSelect
                value={member.role}
                onChange={(role) => onRoleChange(member.userId, role)}
                disabled={loading || member.role === 'owner'}
                isOwner={member.role === 'owner'}
              />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(member.joinedAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              {member.role !== 'owner' && (
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onRemove(member.userId)}
                    >
                      Remove member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

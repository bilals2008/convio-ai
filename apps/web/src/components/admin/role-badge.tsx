import { Badge } from '@/components/ui/badge'

const roleVariantMap: Record<string, 'owner' | 'admin' | 'member' | 'viewer'> = {
  owner: 'owner',
  admin: 'admin',
  member: 'member',
  viewer: 'viewer',
}

interface RoleBadgeProps {
  role: string
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const variant = roleVariantMap[role.toLowerCase()] || 'default'
  return <Badge variant={variant}>{role}</Badge>
}

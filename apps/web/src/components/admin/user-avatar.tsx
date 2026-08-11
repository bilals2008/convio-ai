import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  name?: string | null
  email?: string | null
  avatar?: string | null
  size?: 'sm' | 'md'
}

export function UserAvatar({ name, email, avatar, size = 'md' }: UserAvatarProps) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : email?.slice(0, 2).toUpperCase() || '?'

  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <Avatar className={cn('shrink-0', size === 'sm' ? 'size-7' : 'size-8')}>
        <AvatarImage src={avatar || undefined} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{name || 'Unknown'}</p>
        {email && <p className="text-[11px] text-muted-foreground truncate">{email}</p>}
      </div>
    </div>
  )
}

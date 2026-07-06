import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  Brain,
  BookOpen,
  BarChart3,
  Plug,
  Settings,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Bot, label: 'Bots', href: '/bots' },
  { icon: Brain, label: 'Agents', href: '/agents' },
  { icon: MessageSquare, label: 'Conversations', href: '/conversations' },
  { icon: BookOpen, label: 'Knowledge', href: '/knowledge' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: Plug, label: 'Integrations', href: '/integrations' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="flex h-full w-[240px] flex-col border-r bg-card">
      <div className="flex items-center gap-2 px-4 py-4">
        <img src="/logo.png" alt="Convio" className="h-8 w-auto" />
        <span className="text-lg font-semibold">Convio</span>
      </div>

      <Separator />

      <ScrollArea className="flex-1 px-2 py-2">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <Separator />

      <div className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarImage src="" />
            <AvatarFallback>MU</AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate text-sm">
            <div className="font-medium">Muhammad</div>
            <div className="text-xs text-muted-foreground truncate">muhammad@example.com</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

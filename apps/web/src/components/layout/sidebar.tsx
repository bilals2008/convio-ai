import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart3,
  Brain,
  MessageSquare,
  MessageCircle,
  BookOpen,
  Settings,
  Users,
  Key,
  Terminal,
  Link as LinkIcon,
  ChevronLeft,
  LogOut,
  User,
  X,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarGroup, SidebarItem } from './sidebar-nav'
import { OrgSwitcher } from '@/components/shared/org-switcher'
import { useSidebar } from '@/lib/sidebar-context'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { collapsed, setCollapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || 'U'

  const handleProfileMenuSelect = (value: string | null) => {
    if (!value) return
    if (value === 'profile') navigate('/settings/profile')
    else if (value === 'settings') navigate('/settings/organization')
    else if (value === 'signout') {
      logout.mutate(undefined, {
        onSuccess: () => navigate('/login', { replace: true }),
      })
    }
  }

  useEffect(() => {
    if (pathname.startsWith('/settings')) {
      setCollapsed(true)
    }
  }, [pathname, setCollapsed])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen, setMobileOpen])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const sidebarContent = (
    <aside
      className={`
        flex h-full flex-col bg-card border-r
        ${collapsed ? 'w-[64px]' : 'w-[240px]'}
        transition-[width] duration-200 ease-in-out
      `}
      aria-label="Main navigation"
    >
      {/* Logo area */}
      <div className="flex items-center py-4 px-3 border-b border-border/50 gap-2">
        {!collapsed && (
          <img src="/logo.png" alt="Convio" className="h-7 w-auto shrink-0" />
        )}
        <div className={cn('flex-1 min-w-0', collapsed && 'hidden')}>
          <span className="text-[15px] font-semibold tracking-tight truncate block">Convio</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn('size-7 shrink-0 text-muted-foreground hover:text-foreground', collapsed && 'mx-auto')}
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          <ChevronLeft
            className={cn('size-4 transition-transform duration-200', collapsed && 'rotate-180')}
          />
        </Button>
      </div>

      {/* Org switcher */}
      <div className={cn('px-3 pt-3 pb-1', collapsed && 'px-2')}>
        <OrgSwitcher collapsed={collapsed} />
      </div>

      <ScrollArea className="flex-1">
        <nav className="flex flex-col px-2 py-2">
          <SidebarGroup label="Dashboard">
            <SidebarItem icon={LayoutDashboard} label="Overview" href="/dashboard" exact />
            <SidebarItem icon={BarChart3} label="Analytics" href="/dashboard/analytics" />
          </SidebarGroup>

          <SidebarGroup label="AI">
            <SidebarItem icon={Brain} label="Agents" href="/agents" />
          </SidebarGroup>

          <SidebarGroup label="Knowledge">
            <SidebarItem icon={BookOpen} label="Knowledge Base" href="/knowledge" />
          </SidebarGroup>

          <SidebarGroup label="Conversations">
            <SidebarItem icon={MessageSquare} label="Conversations" href="/conversations" />
            <SidebarItem icon={MessageCircle} label="Widgets" href="/widgets" />
          </SidebarGroup>

          <SidebarGroup label="Settings">
            <SidebarItem icon={Settings} label="Organization" href="/settings/organization" />
            <SidebarItem icon={Users} label="Team" href="/settings/team" />
            <SidebarItem icon={LayoutDashboard} label="Audit Logs" href="/settings/audit-logs" />
            <SidebarItem icon={LinkIcon} label="Deployments" href="/settings/deployments" />
            <SidebarItem icon={Key} label="API Keys" href="/settings/api-keys" />
            <SidebarItem icon={Terminal} label="Playground" href="/settings/playground" />
          </SidebarGroup>
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className="border-t border-border/50 p-2 mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted/60',
            collapsed && 'justify-center px-0'
          )}>
            <Avatar className="size-8 shrink-0">
              <AvatarImage src={user?.avatar || undefined} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 truncate text-left">
                <div className="text-sm font-medium truncate">{user?.name || 'User'}</div>
                <div className="text-[11px] text-muted-foreground truncate">{user?.email}</div>
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" side={collapsed ? 'right' : 'top'}>
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user?.name || 'User'}</span>
                  <span className="text-xs font-normal text-muted-foreground truncate">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings/profile')}>
              <User className="mr-2 size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings/organization')}>
              <Settings className="mr-2 size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                logout.mutate(undefined, {
                  onSuccess: () => navigate('/login', { replace: true }),
                })
              }}
            >
              <LogOut className="mr-2 size-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block shrink-0 h-full">{sidebarContent}</div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-y-0 left-0 w-[280px] z-50 animate-in slide-in-from-left duration-200">
            <div className="relative h-full">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 z-10"
                onClick={() => setMobileOpen(false)}
                aria-label="Close sidebar"
              >
                <X className="size-4" />
              </Button>
              {/* Mobile always expanded */}
              <aside className="flex h-full flex-col bg-card border-r w-[280px]">
                <div className="flex items-center h-14 px-4 border-b">
            <img src="/logo.png" alt="Convio" className="h-9 w-auto" />
                  <span className="ml-2 text-lg font-semibold">Convio</span>
                </div>

                <ScrollArea className="flex-1">
                  <nav className="flex flex-col px-3 py-2">
                    {mobileNavGroups.map((group) => (
                      <div key={group.label} className="space-y-1">
                        <h4 className="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {group.label}
                        </h4>
                        <div className="flex flex-col gap-0.5">
                          {group.items.map((item) => (
                            <Link
                              key={item.href}
                              to={item.href}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            >
                              <item.icon className="size-4 shrink-0" />
                              <span className="flex-1 truncate">{item.label}</span>
                              {item.badge != null && (
                                <span className="text-[10px] px-1.5 py-0 rounded-full bg-secondary text-secondary-foreground">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </nav>
                </ScrollArea>

                <div className="border-t p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarImage src={user?.avatar || undefined} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 truncate text-sm">
                      <div className="font-medium">{user?.name || 'User'}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const mobileNavGroups = [
  {
    label: 'Dashboard',
    items: [
      { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
      { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
    ],
  },
  {
    label: 'AI',
    items: [
      { icon: Brain, label: 'Agents', href: '/agents' },
    ],
  },
  {
    label: 'Knowledge',
    items: [
      { icon: BookOpen, label: 'Knowledge Base', href: '/knowledge' },
    ],
  },
  {
    label: 'Conversations',
    items: [
      { icon: MessageSquare, label: 'Conversations', href: '/conversations' },
      { icon: MessageCircle, label: 'Widgets', href: '/widgets' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { icon: Settings, label: 'Organization', href: '/settings/organization' },
      { icon: Users, label: 'Team', href: '/settings/team' },
      { icon: LayoutDashboard, label: 'Audit Logs', href: '/settings/audit-logs' },
      { icon: LinkIcon, label: 'Deployments', href: '/settings/deployments' },
      { icon: Key, label: 'API Keys', href: '/settings/api-keys' },
      { icon: Terminal, label: 'Playground', href: '/settings/playground' },
    ],
  },
]


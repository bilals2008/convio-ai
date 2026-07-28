import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart3,
  Brain,
  MessageSquare,
  MessageCircle,
  BookOpen,
  User,
  Globe,
  ChevronLeft,
  Shield,
  Building2,
  LogOut,
  Settings,
  X,
  CreditCard,
  Database,
  Plug,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { SidebarGroup, SidebarItem } from './sidebar-nav'
import { useSidebar } from '@/lib/sidebar-context'
import { useAuth } from '@/lib/auth-context'
import { useOrg } from '@/lib/org-context'
import { cn } from '@/lib/utils'

function useSettingsItems() {
  const { org } = useOrg()
  const role = org?.role
  const isAdmin = role === 'owner' || role === 'admin'
  const isOwner = role === 'owner'

  return [
    { icon: Building2, label: 'Organization', href: '/settings/organization', adminOnly: false },
    { icon: User, label: 'Profile', href: '/settings/profile', adminOnly: false },
    { icon: Shield, label: 'Provider Keys', href: '/settings/provider-keys', adminOnly: true },
    { icon: Plug, label: 'MCP Servers', href: '/settings/mcp-servers', adminOnly: true, badge: 'Beta' },
    { icon: CreditCard, label: 'Billing', href: '/settings/billing', adminOnly: false },
     { icon: Database, label: 'Data', href: '/settings/data', adminOnly: true },
  ].filter((item) => !item.adminOnly || (isAdmin && (!item.ownerOnly || isOwner)))
}

function SettingsGroup({ collapsed }: { collapsed: boolean }) {
  const settingsGeneral = useSettingsItems()

  if (collapsed) {
    return (
      <div className="space-y-0.5 mt-4">
        {settingsGeneral.map((item) => (
          <SidebarItem key={item.href} icon={item.icon} label={item.label} href={item.href} badge={item.badge} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-0.5 mt-4">
      <div className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
        Settings
      </div>
      <div className="flex flex-col gap-0.5">
        {settingsGeneral.map((item) => (
          <SidebarItem key={item.href} icon={item.icon} label={item.label} href={item.href} badge={item.badge} />
        ))}
      </div>
    </div>
  )
}

export function Sidebar() {
  const { collapsed, setCollapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const { org } = useOrg()

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || 'U'

  const avatarSrc = user?.avatar || org?.logo || undefined

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
      <Link to="/" className="flex items-center py-4 px-3 border-b border-border/50 gap-2 hover:opacity-80 transition-opacity">
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
      </Link>

      <ScrollArea className="flex-1 min-h-0">
        <nav className="flex flex-col px-2 py-2">
          <SidebarGroup label="Overview">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" exact />
            <SidebarItem icon={BarChart3} label="Analytics" href="/dashboard/analytics" />
          </SidebarGroup>

          <SidebarGroup label="AI">
            <SidebarItem icon={Brain} label="Agents" href="/agents" />
            <SidebarItem icon={BookOpen} label="Knowledge Base" href="/knowledge" />
          </SidebarGroup>

          <SidebarGroup label="Channels">
            <SidebarItem icon={MessageSquare} label="Conversations" href="/conversations" />
            <SidebarItem icon={MessageCircle} label="Widgets" href="/widgets" />
            <SidebarItem icon={Globe} label="Deployments" href="/settings/deployments" />
          </SidebarGroup>

          <SettingsGroup collapsed={collapsed} />

          </nav>
      </ScrollArea>

      {/* User section */}
      <div className="border-t border-border/50 p-2 mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-muted/60 outline-none',
              collapsed && 'justify-center px-0'
            )}
          >
            <Avatar className="size-8 shrink-0">
              <AvatarImage src={avatarSrc} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <>
                <div className="flex-1 truncate text-left">
                  <div className="text-sm font-medium truncate">{user?.name || 'User'}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{user?.email}</div>
                </div>
                <Settings className="size-4 text-muted-foreground shrink-0" />
              </>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent side={collapsed ? 'right' : 'top'} align="start" sideOffset={8}>
            <DropdownMenuItem onClick={() => navigate('/settings/profile')}>
              <User className="size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                logout.mutate(undefined, {
                  onSuccess: () => navigate('/login', { replace: true }),
                })
              }}
            >
              <LogOut className="size-4" />
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
          <div className="fixed inset-y-0 left-0 w-[280px] z-50 animate-in slide-in-from-left duration-200 flex flex-col">
            <div className="relative flex flex-col h-full">
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
              <aside className="flex flex-col h-full bg-card border-r w-[280px] overflow-hidden">
                <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center h-14 px-4 border-b shrink-0 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Convio" className="h-9 w-auto" />
                  <span className="ml-2 text-lg font-semibold">Convio</span>
                </Link>

                <ScrollArea className="flex-1 min-h-0">
                  <nav className="flex flex-col px-3 py-2">
                    {getMobileNavGroups(org?.role).map((group) => (
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

                <div className="border-t p-4 shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      onClick={() => setMobileOpen(false)}
                      className="flex w-full items-center gap-3 rounded-lg p-1 -m-1 transition-colors hover:bg-muted outline-none"
                    >
                      <Avatar className="size-8">
                        <AvatarImage src={avatarSrc} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 truncate text-sm text-left">
                        <div className="font-medium">{user?.name || 'User'}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {user?.email}
                        </div>
                      </div>
                <Settings className="size-4 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align="start" sideOffset={8}>
                      <DropdownMenuItem onClick={() => navigate('/settings/profile')}>
                        <User className="size-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => {
                          logout.mutate(undefined, {
                            onSuccess: () => navigate('/login', { replace: true }),
                          })
                        }}
                      >
                        <LogOut className="size-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function getMobileNavGroups(role?: string) {
  const isAdmin = role === 'owner' || role === 'admin'
  const isOwner = role === 'owner'
  const settingsItems = [
    { icon: Building2, label: 'Organization', href: '/settings/organization' },
    { icon: User, label: 'Profile', href: '/settings/profile' },
    ...(isAdmin ? [
      { icon: Shield, label: 'Provider Keys', href: '/settings/provider-keys' },
      { icon: Plug, label: 'MCP Servers', href: '/settings/mcp-servers', badge: 'Beta' },
       { icon: Database, label: 'Data', href: '/settings/data' },
     ] : []),
    { icon: CreditCard, label: 'Billing', href: '/settings/billing' },
  ]

  return [
    {
      label: 'Overview',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
      ],
    },
    {
      label: 'AI',
      items: [
        { icon: Brain, label: 'Agents', href: '/agents' },
        { icon: BookOpen, label: 'Knowledge Base', href: '/knowledge' },
      ],
    },
    {
      label: 'Channels',
      items: [
        { icon: MessageSquare, label: 'Conversations', href: '/conversations' },
        { icon: MessageCircle, label: 'Widgets', href: '/widgets' },
        { icon: Globe, label: 'Deployments', href: '/settings/deployments' },
      ],
    },
    {
      label: 'Settings',
      items: settingsItems,
    },
    {
      label: 'Feedback',
      items: [],
    },
  ]
}

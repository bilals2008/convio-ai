import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  ScrollText,
  Wand2,
  Bell,
  LifeBuoy,
  Link as LinkIcon,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { SidebarGroup, SidebarItem } from './sidebar-nav'
import { useSidebar } from '@/lib/sidebar-context'
import { useAuth } from '@/lib/auth-context'
import { useOrg } from '@/lib/org-context'
import { cn } from '@/lib/utils'

const accountMenuContentClass =
  'w-56 rounded-lg border border-border/70 p-1 shadow-md duration-150 ease-out data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 motion-reduce:animate-none motion-reduce:transition-none'
const accountMenuItemClass =
  'h-8 gap-2 rounded-md px-2 text-[13px] text-foreground/80 transition-colors duration-150 focus:bg-primary/10 focus:text-foreground focus:[&>svg]:text-primary motion-reduce:transition-none'
const accountMenuLabelClass =
  'px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'

export function Sidebar() {
  const { collapsed, setCollapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
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
      <div className={cn('flex items-center py-4 px-3 border-b border-border/50 gap-2', collapsed && 'justify-center')}>
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Convio" className="h-7 w-auto shrink-0" />
            <span className="text-[15px] font-semibold tracking-tight truncate block">Convio</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          <ChevronLeft
            className={cn('size-4 transition-transform duration-200', collapsed && 'rotate-180')}
          />
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <nav className="flex flex-col px-2 py-2">
          <SidebarGroup label="Overview">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" exact />
            <SidebarItem icon={BarChart3} label="Analytics" href="/dashboard/analytics" />
          </SidebarGroup>

          <SidebarGroup label="AI">
            <SidebarItem icon={Brain} label="Agents" href="/agents" />
            <SidebarItem icon={BookOpen} label="Knowledge Base" href="/knowledge" />
            <SidebarItem icon={Plug} label="MCP Servers" href="/mcp-servers" badge="Beta" />
          </SidebarGroup>

          <SidebarGroup label="Channels">
            <SidebarItem icon={MessageSquare} label="Conversations" href="/conversations" />
            <SidebarItem icon={MessageCircle} label="Widgets" href="/widgets" />
            <SidebarItem icon={Globe} label="Deployments" href="/settings/deployments" />
            <SidebarItem icon={Shield} label="Provider Keys" href="/settings/provider-keys" />
          </SidebarGroup>

          <SidebarGroup label="Integrations">
            <SidebarItem icon={LinkIcon} label="Composio" href="/settings/composio" badge="Soon" />
          </SidebarGroup>

          <SidebarGroup label="Support">
            <SidebarItem icon={LifeBuoy} label="Support Tickets" href="/support" />
          </SidebarGroup>

          </nav>
      </ScrollArea>

      {/* User section */}
      <div className="border-t border-border/50 p-2 mt-auto">
        <div className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground/70', collapsed && 'justify-center px-0')}>
          <Wand2 className="size-4 shrink-0 text-muted-foreground/60" />
          {!collapsed && (
            <>
              <span className="flex-1 truncate text-left">Ask AI</span>
              <Badge variant="beta" className="text-[10px] px-1.5 py-0 h-4 leading-none">
                Soon
              </Badge>
            </>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={collapsed ? 'Open account settings' : 'Open account menu'}
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
          <DropdownMenuContent
            side={collapsed ? 'right' : 'top'}
            align={collapsed ? 'center' : 'start'}
            sideOffset={10}
            className={accountMenuContentClass}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className={accountMenuLabelClass}>Account</DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <DropdownMenuItem
                  onClick={() => navigate('/settings/profile')}
                  className={accountMenuItemClass}
                >
                  <User />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate('/settings/organization')}
                  className={accountMenuItemClass}
                >
                  <Building2 />
                  <span>Organization</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate('/settings/billing')}
                  className={accountMenuItemClass}
                >
                  <CreditCard />
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate('/settings/notifications')}
                  className={accountMenuItemClass}
                >
                  <Bell />
                  <span>Notifications</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuGroup>
            {(org?.role === 'owner' || org?.role === 'admin') && (
              <DropdownMenuGroup>
                <DropdownMenuLabel className={accountMenuLabelClass}>Workspace</DropdownMenuLabel>
                <div className="flex flex-col gap-0.5">
                  <DropdownMenuItem
                    onClick={() => navigate('/settings/data')}
                    className={accountMenuItemClass}
                  >
                    <Database />
                    <span>Data</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate('/settings/audit-logs')}
                    className={accountMenuItemClass}
                  >
                    <ScrollText />
                    <span>Audit Logs</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuGroup>
            )}
            <DropdownMenuSeparator className="mx-1 my-1.5 bg-border/70" />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                logout.mutate(undefined, {
                  onSuccess: () => navigate('/login', { replace: true }),
                })
              }}
              className="h-8 gap-2 rounded-md px-2 text-[13px] transition-colors duration-150 focus:bg-destructive/10 focus:text-destructive motion-reduce:transition-none"
            >
              <LogOut />
              <span>Sign out</span>
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
                  <div className="flex items-center gap-3 rounded-lg p-1 text-sm text-muted-foreground/70">
                    <Wand2 className="size-4 shrink-0 text-muted-foreground/60" />
                    <span className="flex-1 truncate">Ask AI</span>
                    <Badge variant="beta" className="text-[10px] px-1.5 py-0 h-4 leading-none">
                      Soon
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="Open account menu"
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
                    <DropdownMenuContent
                      side="top"
                      align="start"
                      sideOffset={10}
                      className={accountMenuContentClass}
                    >
                      <div onClick={() => setMobileOpen(false)}>
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className={accountMenuLabelClass}>Account</DropdownMenuLabel>
                          <div className="flex flex-col gap-0.5">
                            <DropdownMenuItem
                              onClick={() => navigate('/settings/profile')}
                              className={accountMenuItemClass}
                            >
                              <User />
                              <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate('/settings/organization')}
                              className={accountMenuItemClass}
                            >
                              <Building2 />
                              <span>Organization</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate('/settings/billing')}
                              className={accountMenuItemClass}
                            >
                              <CreditCard />
                              <span>Billing</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate('/settings/notifications')}
                              className={accountMenuItemClass}
                            >
                              <Bell />
                              <span>Notifications</span>
                            </DropdownMenuItem>
                          </div>
                        </DropdownMenuGroup>
                        {(org?.role === 'owner' || org?.role === 'admin') && (
                          <DropdownMenuGroup>
                            <DropdownMenuLabel className={accountMenuLabelClass}>Workspace</DropdownMenuLabel>
                            <div className="flex flex-col gap-0.5">
                              <DropdownMenuItem
                                onClick={() => navigate('/settings/data')}
                                className={accountMenuItemClass}
                              >
                                <Database />
                                <span>Data</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => navigate('/settings/audit-logs')}
                                className={accountMenuItemClass}
                              >
                                <ScrollText />
                                <span>Audit Logs</span>
                              </DropdownMenuItem>
                            </div>
                          </DropdownMenuGroup>
                        )}
                      </div>
                      <DropdownMenuSeparator className="mx-1 my-1.5 bg-border/70" />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => {
                          logout.mutate(undefined, {
                            onSuccess: () => navigate('/login', { replace: true }),
                          })
                        }}
                        className="h-8 gap-2 rounded-md px-2 text-[13px] transition-colors duration-150 focus:bg-destructive/10 focus:text-destructive motion-reduce:transition-none"
                      >
                        <LogOut />
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

function getMobileNavGroups(role?: string) {
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
        { icon: Plug, label: 'MCP Servers', href: '/mcp-servers', badge: 'Beta' },
      ],
    },
    {
      label: 'Channels',
      items: [
        { icon: MessageSquare, label: 'Conversations', href: '/conversations' },
        { icon: MessageCircle, label: 'Widgets', href: '/widgets' },
        { icon: Globe, label: 'Deployments', href: '/settings/deployments' },
        { icon: Shield, label: 'Provider Keys', href: '/settings/provider-keys' },
      ],
    },
    {
      label: 'Integrations',
      items: [
        { icon: LinkIcon, label: 'Composio', href: '/settings/composio', badge: 'Soon' },
      ],
    },
    {
      label: 'Support',
      items: [
        { icon: LifeBuoy, label: 'Support Tickets', href: '/support' },
      ],
    },
  ]
}

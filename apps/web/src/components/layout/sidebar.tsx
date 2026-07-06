import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart3,
  Bot,
  Brain,
  MessageSquare,
  MessageCircle,
  BookOpen,
  FileText,
  Settings,
  Users,
  Key,
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarGroup, SidebarItem } from './sidebar-nav'
import { useSidebar } from '@/lib/sidebar-context'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar()

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
      <div className="flex items-center h-14 px-3 border-b">
        {!collapsed && (
          <>
            <img src="/logo.png" alt="Convio" className="h-7 w-auto" />
            <span className="ml-2 text-lg font-semibold truncate">Convio</span>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn('ml-auto size-8 shrink-0', collapsed && 'mx-auto ml-0')}
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          <ChevronLeft
            className={cn('size-4 transition-transform duration-200', collapsed && 'rotate-180')}
          />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <nav className="flex flex-col px-2 py-2">
          <SidebarGroup label="Dashboard">
            <SidebarItem icon={LayoutDashboard} label="Overview" href="/dashboard" exact />
            <SidebarItem icon={BarChart3} label="Analytics" href="/dashboard/analytics" />
          </SidebarGroup>

          <SidebarGroup label="AI">
            <SidebarItem icon={Brain} label="Agents" href="/agents" />
            <SidebarItem icon={Bot} label="Chatbots" href="/chatbots" />
          </SidebarGroup>

          <SidebarGroup label="Knowledge">
            <SidebarItem icon={BookOpen} label="Knowledge Base" href="/knowledge" />
            <SidebarItem icon={FileText} label="Documents" href="/knowledge/documents" />
          </SidebarGroup>

          <SidebarGroup label="Conversations">
            <SidebarItem icon={MessageSquare} label="Conversations" href="/conversations" badge={12} />
            <SidebarItem icon={MessageCircle} label="Widgets" href="/widgets" />
            <SidebarItem icon={MessageCircle} label="Widget Demo" href="/widget/demo" />
          </SidebarGroup>

          <SidebarGroup label="Settings">
            <SidebarItem icon={Settings} label="Organization" href="/settings/organization" />
            <SidebarItem icon={Users} label="Team" href="/settings/team" />
            <SidebarItem icon={LinkIcon} label="Integrations" href="/settings/integrations" />
            <SidebarItem icon={Key} label="API Keys" href="/settings/api-keys" />
          </SidebarGroup>
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className="border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full h-auto justify-start gap-3 px-2 py-1.5 hover:bg-muted',
                collapsed && 'justify-center px-0'
              )}
            >
              <Avatar className="size-8 shrink-0">
                <AvatarImage src="" />
                <AvatarFallback className="text-xs">MU</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 truncate text-left text-sm">
                  <div className="font-medium truncate">Muhammad</div>
                  <div className="text-xs text-muted-foreground truncate">muhammad@example.com</div>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" side={collapsed ? 'right' : 'top'}>
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>Muhammad</span>
                <span className="text-xs font-normal text-muted-foreground">muhammad@example.com</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 size-4" />
              Logout
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
                  <img src="/logo.png" alt="Convio" className="h-7 w-auto" />
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
                      <AvatarImage src="" />
                      <AvatarFallback className="text-xs">MU</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 truncate text-sm">
                      <div className="font-medium">Muhammad</div>
                      <div className="text-xs text-muted-foreground truncate">
                        muhammad@example.com
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
      { icon: Bot, label: 'Chatbots', href: '/chatbots' },
    ],
  },
  {
    label: 'Knowledge',
    items: [
      { icon: BookOpen, label: 'Knowledge Base', href: '/knowledge' },
      { icon: FileText, label: 'Documents', href: '/knowledge/documents' },
    ],
  },
  {
    label: 'Conversations',
    items: [
      { icon: MessageSquare, label: 'Conversations', href: '/conversations', badge: 12 },
      { icon: MessageCircle, label: 'Widgets', href: '/widgets' },
      { icon: MessageCircle, label: 'Widget Demo', href: '/widget/demo' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { icon: Settings, label: 'Organization', href: '/settings/organization' },
      { icon: Users, label: 'Team', href: '/settings/team' },
      { icon: LinkIcon, label: 'Integrations', href: '/settings/integrations' },
      { icon: Key, label: 'API Keys', href: '/settings/api-keys' },
    ],
  },
]


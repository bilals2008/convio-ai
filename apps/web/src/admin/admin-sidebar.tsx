import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ArrowLeft,
  LogOut,
  Settings,
  X,
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
import { SidebarGroup, SidebarItem } from '@/components/layout/sidebar-nav'
import { useSidebar } from '@/lib/sidebar-context'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import { useAdminNav } from './navigation/use-admin-nav'

export function AdminSidebar() {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const navGroups = useAdminNav()

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || 'A'

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileOpen) setMobileOpen(false)
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
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const sidebarContent = (
    <aside
      className={cn(
        'flex h-full flex-col bg-card border-r',
        collapsed ? 'w-[64px]' : 'w-[240px]',
        'transition-[width] duration-200 ease-in-out'
      )}
      aria-label="Admin navigation"
    >
      {/* Logo + collapse */}
      <div className="flex items-center py-4 px-3 border-b border-border/50 gap-2">
        <Link to="/admin" className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity">
          {!collapsed && <img src="/logo.png" alt="Convio" className="h-7 w-auto shrink-0" />}
          <div className={cn('flex-1 min-w-0', collapsed && 'hidden')}>
            <span className="text-[15px] font-semibold tracking-tight truncate block">Admin</span>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className={cn('size-7 shrink-0 text-muted-foreground hover:text-foreground', collapsed && 'mx-auto')}
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={cn('size-4 transition-transform duration-200', collapsed && 'rotate-180')} />
        </Button>
      </div>

      {/* Back to app */}
      <div className="px-2 pt-2">
        <Link
          to="/dashboard"
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors',
            collapsed && 'justify-center px-2'
          )}
        >
          <ArrowLeft className="size-3.5 shrink-0" />
          {!collapsed && <span>Back to App</span>}
        </Link>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <nav className="flex flex-col px-2 py-2">
          {navGroups.map((group) => (
            <SidebarGroup key={group.group} label={group.group}>
              {group.items.map((item) => (
                <SidebarItem key={item.href} icon={item.icon} label={item.label} href={item.href} exact={item.exact} badge={item.badge} />
              ))}
            </SidebarGroup>
          ))}
        </nav>
      </ScrollArea>

      {/* User */}
      <div className="border-t border-border/50 p-2 mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-muted/60 outline-none',
              collapsed && 'justify-center px-0'
            )}
          >
            <Avatar className="size-8 shrink-0">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <>
                <div className="flex-1 truncate text-left">
                  <div className="text-sm font-medium truncate">{user?.name || 'Admin'}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{user?.email}</div>
                </div>
                <Settings className="size-4 text-muted-foreground shrink-0" />
              </>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent side={collapsed ? 'right' : 'top'} align="start" sideOffset={8}>
            <DropdownMenuItem onClick={() => navigate('/settings/profile')}>
              <Settings className="size-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="size-4" /> Back to App
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => logout.mutate(undefined, { onSuccess: () => navigate('/login', { replace: true }) })}>
              <LogOut className="size-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )

  return (
    <>
      <div className="hidden lg:block shrink-0 h-full">{sidebarContent}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-hidden />
          <div className="fixed inset-y-0 left-0 w-[280px] z-50 animate-in slide-in-from-left duration-200">
            <div className="relative flex flex-col h-full bg-card">
              <Button variant="ghost" size="icon" className="absolute top-3 right-3 z-10" onClick={() => setMobileOpen(false)}>
                <X className="size-4" />
              </Button>
              <div className="flex flex-col h-full">
                <div className="flex items-center h-14 px-4 border-b shrink-0 gap-2">
                  <img src="/logo.png" alt="Convio" className="h-9 w-auto" />
                  <span className="text-lg font-semibold">Admin</span>
                </div>
                <div className="px-3 pt-2">
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                    <ArrowLeft className="size-3.5" /> Back to App
                  </Link>
                </div>
                <ScrollArea className="flex-1">
                  <nav className="flex flex-col px-3 py-2">
                    {navGroups.map((group) => (
                      <div key={group.group} className="space-y-1">
                        <h4 className="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {group.group}
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
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </nav>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

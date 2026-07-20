import { useState, useEffect } from 'react'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { Menu, X, Search, Moon, Sun, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useTheme } from 'next-themes'
import { DocsSidebar } from './docs-sidebar'
import { DocsToc } from './docs-toc'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { useOrg } from '@/lib/org-context'

export function DocsLayout() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { org, isLoading: orgLoading } = useOrg()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { pathname } = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  if (authLoading || orgLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const role = org?.role
  if (role !== 'owner' && role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <header className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b bg-background/80 backdrop-blur-lg px-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden shrink-0"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="size-4" />
        </Button>

        <a href="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.png" alt="Convio" className="h-5 w-auto" />
          <span className="text-sm font-semibold font-heading">Convio</span>
        </a>

        <Separator orientation="vertical" className="h-5" />

        <span className="text-xs font-medium text-muted-foreground hidden sm:block">
          Docs
        </span>

        <div className="flex-1" />

        <div className="relative hidden md:block max-w-xs w-full">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search docs..."
            className="h-8 pl-7 text-xs"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
        </Button>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-y-0 left-0 w-[280px] z-50 flex flex-col bg-card border-r animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between h-14 px-4 border-b shrink-0">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Convio" className="h-5 w-auto" />
                <span className="text-sm font-semibold font-heading">Convio Docs</span>
              </div>
              <Button variant="ghost" size="icon" className="size-8" onClick={() => setSidebarOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 min-h-0">
              <DocsSidebar />
            </ScrollArea>
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-[1440px]">
        {/* Desktop left sidebar */}
        <aside className="hidden lg:flex flex-col w-[240px] shrink-0 border-r bg-card h-[calc(100vh-56px)] sticky top-14">
          <ScrollArea className="flex-1 min-h-0">
            <DocsSidebar />
          </ScrollArea>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-[820px] px-5 py-8 md:py-12 md:px-8 lg:px-10">
            <Outlet />
          </div>
        </main>

        {/* Right sidebar - TOC */}
        <aside className="hidden xl:flex flex-col w-[220px] shrink-0 border-l bg-card h-[calc(100vh-56px)] sticky top-14">
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-4 pt-6 pb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60 mb-3">
                On This Page
              </p>
              <DocsToc />
            </div>
          </ScrollArea>
        </aside>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ScrollArea } from '@/components/ui/scroll-area'
import { HelpTopbar } from './help-topbar'
import { HelpSidebar } from './help-sidebar'
import { HelpToc } from './help-toc'
import { DocPromoCard } from '@/components/docs/doc-promo-card'

export function HelpLayout() {
  const { pathname } = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  return (
    <div className="min-h-screen bg-background">
      <HelpTopbar
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        menuOpen={sidebarOpen}
      />

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
                <span className="text-sm font-semibold font-heading">Help Center</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex size-7 items-center justify-center rounded-md hover:bg-muted transition-colors"
                aria-label="Close sidebar"
              >
                <span className="sr-only">Close</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <ScrollArea className="flex-1 min-h-0">
              <HelpSidebar />
            </ScrollArea>
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-[1440px]">
        {/* Desktop left sidebar */}
        <aside className="hidden lg:flex flex-col w-[240px] shrink-0 border-r border-border bg-card h-[calc(100vh-56px)] sticky top-14">
          <ScrollArea className="flex-1 min-h-0">
            <HelpSidebar />
          </ScrollArea>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-[820px] px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10 lg:py-12">
            <Outlet />
          </div>
        </main>

        {/* Right sidebar — TOC + Promo */}
        <aside className="hidden xl:flex flex-col w-[220px] shrink-0 border-l border-border h-[calc(100vh-56px)] sticky top-14">
          <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-6 pb-4">
            <HelpToc />
          </div>
          <div className="px-4 pb-4 shrink-0">
            <DocPromoCard />
          </div>
        </aside>
      </div>
    </div>
  )
}

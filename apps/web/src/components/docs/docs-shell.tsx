import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowUpRight, LifeBuoy, ListTree } from 'lucide-react'
import { DocsSidebar } from '@/components/docs/docs-sidebar'
import { DocsToc } from '@/components/docs/docs-toc'
import { DocsTopbar } from '@/components/docs/docs-topbar'
import { Button, buttonVariants } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import type { DocHeading } from '@/lib/docs/content'
import { cn } from '@/lib/utils'

/** Both rails clear the 4rem topbar and own the rest of the viewport. */
const RAIL = 'sticky top-16 h-[calc(100dvh-4rem)]'

/** Pinned to the foot of the TOC rail: the headings scroll, this never leaves. */
function DocsHelpCard() {
  return (
    <div className="shrink-0 border-t border-border/70 px-1 py-4">
      <p className="flex items-center gap-2 text-[13px] font-medium">
        <LifeBuoy className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
        Need a hand?
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        Migrating an existing agent, or need a plan that fits your volume?
      </p>
      <Link
        to="/contact"
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-3 w-full justify-between')}
      >
        Talk to our team
        <ArrowUpRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>
  )
}

/**
 * The sidebar is flush with the left viewport edge and divided from the body by a
 * hairline — the shape every docs reader expects — so the page has one fixed left
 * edge instead of a column that drifts with the viewport. Only the body and the TOC
 * are centred, in whatever space is left after the rail.
 */
export function DocsShell({
  toc = [],
  sidebar = true,
  children,
}: {
  toc?: DocHeading[]
  sidebar?: boolean
  children: ReactNode
}) {
  const [navOpen, setNavOpen] = useState(false)
  const [tocOpen, setTocOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const hasToc = toc.length > 0

  // The app has no scroll restoration, so navigating from mid-page left the reader at
  // the old scroll offset — the new page opened at its bottom and looked broken.
  // Keyed on pathname only, so in-page hash jumps are untouched.
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Owned here rather than in DocsSearch: the shortcut has to fire from anywhere on the
  // page, and the topbar trigger is the only thing that should read or write it.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setSearchOpen((value) => !value)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="docs-shell min-h-screen bg-background">
      <DocsTopbar
        onOpenNav={() => setNavOpen(true)}
        searchOpen={searchOpen}
        onSearchOpenChange={setSearchOpen}
      />

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="w-80 gap-0 p-0">
          <SheetTitle className="sr-only">Documentation navigation</SheetTitle>
          <DocsSidebar onNavigate={() => setNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex w-full">
        {sidebar && (
          <aside className={cn(RAIL, 'hidden w-[17rem] shrink-0 border-r border-border lg:block')}>
            <DocsSidebar />
          </aside>
        )}

        <div className="min-w-0 flex-1">
          <div
            className={cn(
              'grid w-full max-w-[52rem] gap-x-10 px-4 sm:px-6',
              // TOC pages stay centred (content + rail read as one block); the index
              // hugs the sidebar so the landing column starts at the left edge.
              hasToc
                ? 'mx-auto xl:max-w-[66rem] xl:grid-cols-[minmax(0,46rem)_14rem]'
                : 'mr-auto',
            )}
          >
            <main className="min-w-0 py-8 sm:py-10">
              {hasToc && (
                <div className="mb-4 flex justify-end xl:hidden">
                  <Popover open={tocOpen} onOpenChange={setTocOpen}>
                    <PopoverTrigger render={<Button variant="outline" size="sm" />}>
                      <ListTree data-icon="inline-start" />
                      On this page
                    </PopoverTrigger>
                    <PopoverContent align="end" className="max-h-[70dvh] w-72 overflow-y-auto">
                      <PopoverTitle className="sr-only">On this page</PopoverTitle>
                      <DocsToc headings={toc} onNavigate={() => setTocOpen(false)} />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
              {children}
            </main>

            {hasToc && (
              <aside className={cn(RAIL, 'hidden flex-col xl:flex')}>
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <DocsToc headings={toc} />
                </div>
                <DocsHelpCard />
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

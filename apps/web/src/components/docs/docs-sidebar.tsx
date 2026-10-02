import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { docSections, type DocPage, type DocSection } from '@/lib/docs/nav'
import { prefetchDoc } from '@/lib/docs/content'

/**
 * Exact match on a trailing-slash-normalised pathname. A prefix match marked the
 * docs index active on every page, because everything lives under /docs/.
 */
function isActive(pathname: string, slug: string): boolean {
  const current = pathname.replace(/\/+$/, '')
  return current === (slug ? `/docs/${slug}` : '/docs')
}

const ITEM_BASE =
  'group relative flex items-center gap-2.5 rounded-md py-1.5 pl-2.5 pr-2 text-[13px] leading-5 outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/60'

const ITEM_IDLE = 'font-medium text-muted-foreground hover:bg-accent/60 hover:text-foreground'
const ITEM_ACTIVE = 'bg-accent/70 font-medium text-foreground'

function NavItem({
  page,
  depth,
  pathname,
  onNavigate,
}: {
  page: DocPage
  depth: number
  pathname: string
  onNavigate?: () => void
}) {
  const active = isActive(pathname, page.slug)
  const Icon = page.icon

  return (
    <li>
      <Link
        to={page.slug ? `/docs/${page.slug}` : '/docs'}
        onClick={onNavigate}
        onMouseEnter={() => prefetchDoc(page.slug)}
        onFocus={() => prefetchDoc(page.slug)}
        aria-current={active ? 'page' : undefined}
        className={cn(ITEM_BASE, active ? ITEM_ACTIVE : ITEM_IDLE)}
      >
        {active && (
          <span
            aria-hidden="true"
            className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary"
          />
        )}
        {/* Icons belong to the top level only — a nested rail that repeats one icon
            per row turns depth into noise. */}
        {depth === 0 && (
          <Icon
            aria-hidden="true"
            className={cn(
              'size-4 shrink-0 transition-colors duration-150',
              active ? 'text-primary' : 'text-muted-foreground/80 group-hover:text-foreground',
            )}
          />
        )}
        <span className="min-w-0 flex-1 truncate">{page.title}</span>
        {page.badge && (
          <Badge variant="soon" className="h-4 shrink-0 px-1.5 py-0 leading-none">
            Soon
          </Badge>
        )}
      </Link>

      {page.children && page.children.length > 0 && (
        // The hairline is the depth cue; the nesting needs no extra per-level padding.
        <ul className="mt-0.5 ml-3.5 flex flex-col gap-0.5 border-l border-border/70">
          {page.children.map((child) => (
            <NavItem
              key={child.slug}
              page={child}
              depth={depth + 1}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function NavSection({
  section,
  pathname,
  onNavigate,
}: {
  section: DocSection
  pathname: string
  onNavigate?: () => void
}) {
  // All sections start expanded and toggle freely. The earlier version refused to
  // collapse the section holding the active page, which read as a broken accordion.
  const [open, setOpen] = useState(true)

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/section"
    >
      <CollapsibleTrigger
        className={cn(
          // pl matches ITEM_BASE so the label lines up with the item text below it.
          'flex w-full items-center gap-2 rounded-md py-1.5 pr-2 pl-2.5 text-left outline-none',
          'text-muted-foreground transition-colors duration-150 hover:text-foreground',
          'focus-visible:ring-2 focus-visible:ring-ring/60',
          // Base UI puts data-open/data-closed on the root (data-panel-open is only on
          // the trigger itself), so the group selector must key off [open].
          'group-data-[open]/section:text-foreground',
        )}
      >
        <span className="font-heading text-[13px] font-bold tracking-[0.01em] text-foreground">
          {section.title}
        </span>
        {/* The caret belongs at the end of the row — leading with it makes the label
            look like a tree node instead of a section heading. */}
        <ChevronRight
          aria-hidden="true"
          className="ml-auto size-[15px] shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-data-[open]/section:rotate-90"
        />
      </CollapsibleTrigger>

      {/* grid-template-rows animates 0fr → 1fr, so the panel collapses to its own height
          without a measured pixel value. */}
      <CollapsibleContent className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-200 ease-out data-[ending-style]:grid-rows-[0fr] data-[starting-style]:grid-rows-[0fr]">
        <ul className="mt-1 flex flex-col gap-0.5 overflow-hidden">
          {section.pages.map((page) => (
            <NavItem
              key={page.slug}
              page={page}
              depth={0}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}

/** The nav is the only zone left, so the whole rail scrolls. */
export function DocsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation()

  return (
    <nav aria-label="Documentation" className="h-full overflow-y-auto px-3 py-5">
      <div className="flex flex-col gap-6">
        {docSections.map((section) => (
          <NavSection
            key={section.title}
            section={section}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </nav>
  )
}

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { DocHeading } from '@/lib/docs/content'

/**
 * Anchors land below the 4rem topbar; this is the band the observer uses to decide which
 * heading is "current", so the offset and the anchor clearance stay in step. Intersection
 * Observer accepts only px and percent — a rem value throws a DOMException.
 */
const BAND = '-80px 0px -70% 0px'

export function DocsToc({
  headings,
  onNavigate,
}: {
  headings: DocHeading[]
  onNavigate?: () => void
}) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null)

  useEffect(() => {
    const targets = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null)
    if (targets.length === 0) return

    // The band can straddle two headings; the earlier one in document order wins.
    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        const current = targets.find((target) => visible.has(target.id))
        if (current) setActiveId(current.id)
      },
      { rootMargin: BAND }
    )

    for (const target of targets) observer.observe(target)
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav aria-label="On this page" className="flex flex-col py-8">
      <p className="mb-3 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">On this page</p>
      {/* Every item carries its own rule, so the list reads as one continuous hairline
          and the active item just recolours its own segment. A border on <ul> would
          be hidden: `-ml-px` puts each item's rule exactly on top of it. */}
      <ul className="flex flex-col">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={onNavigate}
              aria-current={activeId === heading.id ? 'location' : undefined}
              className={cn(
                '-ml-px block border-l-2 py-1.5 pr-2 text-[13px] leading-snug transition-colors duration-200 ease-out',
                heading.level === 2 ? 'pl-3.5' : 'pl-6 text-xs',
                activeId === heading.id
                  ? 'border-primary font-medium text-primary'
                  : 'border-muted-foreground/30 text-muted-foreground hover:text-foreground'
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

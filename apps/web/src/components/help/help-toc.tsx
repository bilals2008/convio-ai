import { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'

interface TocItem {
  id: string
  text: string
  level: 2 | 3
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function useHeadings(): TocItem[] {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const observerRef = useRef<MutationObserver | null>(null)

  const collect = useCallback(() => {
    const main = document.querySelector('main')
    if (!main) return

    const elements = main.querySelectorAll('h2, h3')
    const items: TocItem[] = []
    const idCount = new Map<string, number>()

    elements.forEach((el) => {
      const text = el.textContent?.trim() ?? ''
      if (!text) return

      if (!el.id) {
        el.id = slugify(text)
      }

      const count = idCount.get(el.id) ?? 0
      idCount.set(el.id, count + 1)
      if (count > 0) {
        el.id = `${el.id}-${count}`
      }

      items.push({
        id: el.id,
        text,
        level: el.tagName === 'H2' ? 2 : 3,
      })
    })

    setHeadings(items)
  }, [])

  useEffect(() => {
    collect()

    observerRef.current = new MutationObserver(collect)
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [collect])

  return headings
}

function useActiveId(headings: TocItem[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (headings.length === 0) return

    const visible = new Set<string>()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visible.add(entry.target.id)
          } else {
            visible.delete(entry.target.id)
          }
        })

        if (visible.size > 0) {
          const first = headings.find((h) => visible.has(h.id))
          if (first) setActiveId(first.id)
        }
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observerRef.current?.observe(el)
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [headings])

  return activeId
}

export function HelpToc() {
  const headings = useHeadings()
  const activeId = useActiveId(headings)

  if (headings.length === 0) return null

  return (
    <nav aria-label="Table of contents">
      <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        On this page
      </h4>
      <ul className="space-y-1">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: heading.level === 3 ? '12px' : '0' }}
          >
            <a
              href={`#${heading.id}`}
              className={cn(
                'block text-[12.5px] leading-snug py-1.5 px-2 -mx-2 rounded-md transition-colors',
                heading.level === 3 && 'text-muted-foreground',
                activeId === heading.id
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
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

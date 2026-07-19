import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TocItem {
  id: string
  text: string
  level: number
}

export function DocsToc() {
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const headings = document.querySelectorAll<HTMLHeadingElement>(
      '[data-doc-heading]'
    )
    const tocItems: TocItem[] = Array.from(headings).map((h) => ({
      id: h.id || h.textContent?.toLowerCase().replace(/\s+/g, '-') || '',
      text: h.textContent || '',
      level: parseInt(h.tagName.replace('H', ''), 10),
    }))
    setItems(tocItems)

    if (tocItems.length > 0 && !activeId) {
      setActiveId(tocItems[0].id)
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px' }
    )

    const headings = document.querySelectorAll<HTMLHeadingElement>(
      '[data-doc-heading]'
    )
    headings.forEach((h) => observer.observe(h))

    return () => observer.disconnect()
  }, [])

  if (items.length === 0) {
    return (
      <div className="space-y-1.5">
        {['Overview', 'Features', 'Setup', 'Configuration'].map((item) => (
          <div
            key={item}
            className="px-2 py-1 text-xs text-muted-foreground/40 cursor-default"
          >
            {item}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={cn(
            'block px-2 py-1 text-xs transition-colors rounded',
            activeId === item.id
              ? 'text-primary font-medium'
              : 'text-muted-foreground/60 hover:text-foreground',
            item.level === 3 && 'pl-5'
          )}
          onClick={(e) => {
            e.preventDefault()
            const el = document.getElementById(item.id)
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' })
              setActiveId(item.id)
            }
          }}
        >
          {item.text}
        </a>
      ))}
    </div>
  )
}

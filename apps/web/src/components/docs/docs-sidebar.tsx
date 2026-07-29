import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { docSections } from './docs-nav'
import { cn } from '@/lib/utils'

export function DocsSidebar() {
  const { pathname } = useLocation()
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    docSections.forEach((section) => {
      const hasActive = section.items.some((item) => item.href === pathname)
      if (hasActive) initial.add(section.title)
    })
    if (initial.size === 0) initial.add('Getting Started')
    return initial
  })

  useEffect(() => {
    docSections.forEach((section) => {
      const hasActive = section.items.some((item) => item.href === pathname)
      if (hasActive) {
        setExpanded((prev) => new Set([...prev, section.title]))
      }
    })
  }, [pathname])

  const toggle = (title: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  return (
    <nav className="flex flex-col px-3 py-4 gap-0.5 overflow-y-auto h-full">
      {docSections.map((section) => {
        const isOpen = expanded.has(section.title)
        const hasActive = section.items.some((item) => item.href === pathname)
        return (
          <div key={section.title} className="mb-1">
            <button
              onClick={() => toggle(section.title)}
              className={cn(
                'flex w-full items-center justify-between px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors rounded-md',
                hasActive ? 'text-primary' : 'text-muted-foreground/60 hover:text-muted-foreground'
              )}
            >
              <span>{section.title}</span>
              <ChevronRight
                className={cn(
                  'size-3 transition-transform duration-200',
                  isOpen && 'rotate-90'
                )}
              />
            </button>
            {isOpen && (
              <div className="space-y-0.5 mt-0.5 ml-0.5">
                {section.items.map((item) => {
                  const active = pathname === item.href
                  if (item.soon) {
                    return (
                      <span
                        key={item.href}
                        className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground/50 cursor-not-allowed select-none"
                      >
                        <span className="truncate">{item.title}</span>
                        <span className="ml-auto shrink-0 rounded border border-warning/30 bg-warning/10 px-1 py-px text-[9px] font-semibold uppercase tracking-wider text-warning">
                          Soon
                        </span>
                      </span>
                    )
                  }
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      <span className="truncate">{item.title}</span>
                      {item.beta && (
                        <span className="ml-auto shrink-0 rounded bg-warning/15 px-1 py-px text-[9px] font-semibold uppercase tracking-wider text-warning">
                          Beta
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}

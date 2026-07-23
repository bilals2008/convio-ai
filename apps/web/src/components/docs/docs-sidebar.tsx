import { Link, useLocation } from 'react-router-dom'
import { docSections } from './docs-nav'
import { cn } from '@/lib/utils'

export function DocsSidebar() {
  const { pathname } = useLocation()

  return (
    <nav className="flex flex-col px-2 py-4 gap-1">
      {docSections.map((section) => (
        <div key={section.title} className="mb-4">
          <h4 className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">
            {section.title}
          </h4>
          <div className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )}
                >
                  {item.logo ? (
                    <img src={item.logo} alt={item.title} className="h-4 shrink-0 object-contain" />
                  ) : (
                    <>
                      <item.icon className={cn('size-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground/60')} />
                      <span className="truncate">{item.title}</span>
                    </>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}

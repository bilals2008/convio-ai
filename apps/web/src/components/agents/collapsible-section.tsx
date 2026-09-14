import { useState, type ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsibleSectionProps {
  title: string
  icon: ReactNode
  /** Optional chip rendered next to the title (e.g. "Pro", counts) */
  badge?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  disabled?: boolean
}

/**
 * Accordion section used across the Agent Builder sidebar.
 * Header row (icon + heading + plus/minus toggle) collapses the body with a
 * smooth height + fade transition. The + icon rotates into a × when open.
 */
export function CollapsibleSection({
  title,
  icon,
  badge,
  children,
  defaultOpen = true,
  disabled,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-lg border border-border/50">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        aria-expanded={open}
        className={cn(
          'flex w-full items-center gap-2 px-4 py-3 text-left transition-colors',
          !disabled && 'hover:bg-muted/40',
        )}
      >
        <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10">
          {icon}
        </div>
        <span className="flex-1 truncate text-sm font-medium">{title}</span>
        {badge}
        <Plus
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out',
            open && 'rotate-45 text-foreground',
          )}
        />
      </button>

      {/* Grid-rows animation: 0fr → 1fr collapses/expands without measuring heights */}
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              'space-y-3 px-4 pb-4 transition-opacity duration-200',
              open ? 'opacity-100' : 'opacity-0',
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

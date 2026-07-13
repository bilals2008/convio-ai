import { NavLink } from 'react-router-dom'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/lib/sidebar-context'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import type { ComponentProps } from 'react'

interface SidebarItemProps {
  icon: LucideIcon
  label: string
  href: string
  badge?: string | number
  exact?: boolean
}

export function SidebarItem({ icon: Icon, label, href, badge, exact }: SidebarItemProps) {
  const { collapsed } = useSidebar()

  const link = (
    <NavLink
      to={href}
      end={exact}
      className={({ isActive }) =>
        cn(
          'group/item flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-primary/8 text-primary'
            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
          collapsed && 'justify-center px-2'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              'size-4 shrink-0 transition-colors duration-150',
              isActive ? 'text-primary' : 'text-muted-foreground/40 group-hover/item:text-muted-foreground/70'
            )}
          />
          {!collapsed && (
            <>
              <span className="flex-1 truncate">{label}</span>
              {badge != null && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 leading-none">
                  {badge}
                </Badge>
              )}
            </>
          )}
        </>
      )}
    </NavLink>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          {label}
          {badge != null && <span className="ml-1 text-muted-foreground">({badge})</span>}
        </TooltipContent>
      </Tooltip>
    )
  }

  return link
}

interface SidebarGroupProps extends ComponentProps<'div'> {
  label: string
}

export function SidebarGroup({ label, children, className, ...props }: SidebarGroupProps) {
  const { collapsed } = useSidebar()

  if (collapsed) {
    return (
      <div className={cn('space-y-0.5 first:mt-0 mt-4', className)} {...props}>
        <div className="flex flex-col gap-0.5">{children}</div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-0.5 first:mt-0 mt-4', className)} {...props}>
      <div className="px-3 pt-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
        {label}
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

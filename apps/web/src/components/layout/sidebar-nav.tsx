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
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          collapsed && 'justify-center px-2'
        )
      }
    >
      <Icon className="size-4 shrink-0" />
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

  return (
    <div className={cn('space-y-1', className)} {...props}>
      {!collapsed && (
        <h4 className="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </h4>
      )}
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

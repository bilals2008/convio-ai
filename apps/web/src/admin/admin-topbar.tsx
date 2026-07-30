import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/lib/sidebar-context'

const breadcrumbLabels: Record<string, string> = {
  admin: 'Admin',
  users: 'Users',
  organizations: 'Organizations',
  analytics: 'Analytics',
  agents: 'Agents',
  system: 'System Health',
  moderation: 'Moderation',
  'audit-logs': 'Audit Logs',
  billing: 'Billing',
  providers: 'Providers',
  announcements: 'Announcements',
}

export function AdminTopbar() {
  const location = useLocation()
  const { toggleMobile } = useSidebar()
  const segments = location.pathname.split('/').filter(Boolean)

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border/50 px-4 md:px-6 shrink-0">
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-muted-foreground hover:text-foreground lg:hidden"
        onClick={toggleMobile}
        aria-label="Toggle navigation"
      >
        <Menu className="size-4" />
      </Button>

      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
        {segments.map((segment, i) => {
          const label = breadcrumbLabels[segment] || segment
          const isLast = i === segments.length - 1

          return (
            <span key={segment} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="size-3.5 text-muted-foreground/50" />}
              {isLast ? (
                <span className="font-medium text-foreground">{label}</span>
              ) : (
                <span className="text-muted-foreground">{label}</span>
              )}
            </span>
          )
        })}
      </nav>
    </header>
  )
}

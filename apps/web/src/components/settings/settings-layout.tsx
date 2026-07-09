import { NavLink, Outlet } from 'react-router-dom'
import { Settings, Users, Link, Key, Terminal, Shield, ScrollText, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageContainer } from '@/components/shared/page-container'

const navItems = [
  { icon: Settings, label: 'Organization', href: '/settings/organization' },
  { icon: Users, label: 'Team Members', href: '/settings/team' },
  { icon: ScrollText, label: 'Audit Logs', href: '/settings/audit-logs' },
  { icon: Building2, label: 'SSO', href: '/settings/sso' },
  { icon: Link, label: 'Deployments', href: '/settings/deployments' },
  { icon: Key, label: 'API Keys', href: '/settings/api-keys' },
  { icon: Shield, label: 'Provider Keys', href: '/settings/provider-keys' },
  { icon: Terminal, label: 'Playground', href: '/settings/playground' },
]

export function SettingsLayout() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-6 md:flex-row">
        <nav className="flex md:flex-col gap-1 md:w-56 shrink-0 overflow-x-auto md:overflow-visible">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </PageContainer>
  )
}

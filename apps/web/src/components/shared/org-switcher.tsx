import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useOrg } from '@/lib/org-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export function OrgSwitcher({ collapsed }: { collapsed: boolean }) {
  const { org, orgs, setOrgId } = useOrg()
  const navigate = useNavigate()

  if (!org) return null

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="mx-auto flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-bold overflow-hidden">
          {org.logo ? (
            <img src={org.logo} alt={org.name} className="size-full object-cover" />
          ) : (
            org.name.slice(0, 2).toUpperCase()
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right" className="w-56">
          {orgs.map((o) => (
              <DropdownMenuItem
                key={o.id}
                onClick={() => setOrgId(o.id)}
                className="flex items-center gap-2"
              >
                <div className="flex size-6 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-bold overflow-hidden">
                  {o.logo ? (
                    <img src={o.logo} alt={o.name} className="size-full object-cover" />
                  ) : (
                    o.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <span className="flex-1 truncate">{o.name}</span>
                {o.id === org.id && <Check className="size-3.5 text-primary" />}
              </DropdownMenuItem>
            ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/settings/organization')}>
            <Plus className="mr-2 size-4" />
            Create Organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/60">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary overflow-hidden">
          {org.logo ? (
            <img src={org.logo} alt={org.name} className="size-full object-cover" />
          ) : (
            org.name.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="flex-1 truncate text-left">
          <div className="text-sm font-medium truncate">{org.name}</div>
          <div className="text-[11px] text-muted-foreground truncate">{org.role}</div>
        </div>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {orgs.map((o) => (
          <DropdownMenuItem
            key={o.id}
            onClick={() => setOrgId(o.id)}
            className="flex items-center gap-2"
          >
            <div className={cn(
              'flex size-6 shrink-0 items-center justify-center rounded text-[10px] font-bold overflow-hidden',
              o.id === org.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            )}>
              {o.logo ? (
                <img src={o.logo} alt={o.name} className="size-full object-cover" />
              ) : (
                o.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="flex-1 truncate">
              <div className="text-sm font-medium truncate">{o.name}</div>
              {o.role && <div className="text-[11px] text-muted-foreground">{o.role}</div>}
            </div>
            {o.id === org.id && <Check className="size-3.5 text-primary shrink-0" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/settings/organization')}>
          <Plus className="mr-2 size-4" />
          Create Organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

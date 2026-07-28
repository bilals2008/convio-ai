import { Search, Bell, Moon, Sun, Menu, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from 'next-themes'
import { Separator } from '@/components/ui/separator'
import { useSidebar } from '@/lib/sidebar-context'
import { usePlan } from '@/lib/hooks/use-billing'
import { Badge } from '@/components/ui/badge'

export function Header() {
  const { theme, setTheme } = useTheme()
  const { toggleMobile } = useSidebar()
  const { data: plan } = usePlan()

  const isOnTrial = plan?.isTrial && plan?.trialEndsAt
  const daysLeft = isOnTrial
    ? Math.ceil((new Date(plan.trialEndsAt!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <header className="flex h-14 items-center gap-3 border-b bg-card px-4">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={toggleMobile}
        aria-label="Open sidebar"
      >
        <Menu className="size-4" />
      </Button>

      <div className="flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-8" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isOnTrial && daysLeft !== null && (
          <Badge variant={daysLeft <= 3 ? 'destructive' : 'active'}>
            <Clock className="size-3" />
            {daysLeft === 0 ? 'Trial ends today' : `${daysLeft}d left`}
          </Badge>
        )}
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </div>
    </header>
  )
}
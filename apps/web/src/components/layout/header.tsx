import { Search, Bell, Moon, Sun, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from 'next-themes'
import { Separator } from '@/components/ui/separator'
import { useSidebar } from '@/lib/sidebar-context'

export function Header() {
  const { theme, setTheme } = useTheme()
  const { toggleMobile } = useSidebar()

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

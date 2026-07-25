import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Moon, Sun, ArrowRight, Search, ChevronDown, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href?: string
  children?: { label: string; href: string; description?: string }[]
}

const navItems: NavItem[] = [
  {
    label: 'Platform',
    children: [
      { label: 'AI Agents', href: '/docs/ai-agents', description: 'Create and configure intelligent agents' },
      { label: 'Knowledge Bases', href: '/docs/knowledge-bases', description: 'RAG-powered document search' },
      { label: 'Channels', href: '/docs/channels', description: 'WhatsApp, Telegram, Discord, Slack' },
      { label: 'Widgets', href: '/docs/web-widget', description: 'Embeddable chat widget' },
    ],
  },
  { label: 'Guides', href: '/docs' },
  { label: 'API Reference', href: '/docs/api-overview' },
  { label: 'Integrations', href: '/docs/channels' },
  { label: 'Changelog', href: '/docs' },
]

interface HelpTopbarProps {
  onMenuToggle?: () => void
  menuOpen?: boolean
}

export function HelpTopbar({ onMenuToggle, menuOpen }: HelpTopbarProps) {
  const { theme, setTheme } = useTheme()
  const { pathname } = useLocation()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('help-search')?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-6 px-4 lg:px-6">
        {/* Logo */}
        <Link to="/docs" className="flex items-center gap-2.5 shrink-0">
          <img src="/logo.png" alt="Convio" className="h-6 w-auto" />
          <span className="text-[15px] font-bold font-heading tracking-tight hidden sm:block">Convio</span>
        </Link>

        {/* Nav links — desktop */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.children && setOpenDropdown(item.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              {item.href ? (
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors',
                    pathname === item.href
                      ? 'text-foreground bg-muted/60'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  className={cn(
                    'flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors',
                    'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  )}
                >
                  {item.label}
                  <ChevronDown className={cn('size-3 transition-transform', openDropdown === item.label && 'rotate-180')} />
                </button>
              )}

              {/* Dropdown */}
              {item.children && openDropdown === item.label && (
                <div className="absolute top-full left-0 pt-1.5 w-64 z-50">
                  <div className="rounded-xl border border-border bg-card shadow-lg shadow-black/5 p-1.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        className="flex flex-col gap-0.5 rounded-lg px-3 py-2.5 hover:bg-muted/60 transition-colors"
                        onClick={() => setOpenDropdown(null)}
                      >
                        <span className="text-[13px] font-medium text-foreground">{child.label}</span>
                        {child.description && (
                          <span className="text-[11px] text-muted-foreground leading-tight">{child.description}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Search */}
        <div className="flex-1 max-w-md mx-auto hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-muted-foreground transition-colors" />
            <input
              id="help-search"
              type="text"
              placeholder="Search docs..."
              className="w-full h-9 pl-9 pr-14 rounded-lg border border-border bg-muted/40 text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 focus:bg-muted/60 focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground/60">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            <Sun className="size-[15px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-[15px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Link to="/dashboard" className="hidden sm:block">
            <Button size="sm" className="h-8 text-[13px] px-3.5 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
              Go to Dashboard
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 lg:hidden"
            onClick={onMenuToggle}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>
    </header>
  )
}

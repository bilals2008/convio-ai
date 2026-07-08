import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, LogOut, LayoutDashboard, User, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from 'next-themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Channels', href: '#channels' },
  { label: 'Pricing', href: '#pricing' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  useEffect(() => {
    function tick() {
      setScrolled(window.scrollY > window.innerHeight * 0.7)
    }
    window.addEventListener('scroll', tick, { passive: true })
    tick()
    return () => window.removeEventListener('scroll', tick)
  }, [])

  return (
    <>
      {/* Solid navbar — fades in after scrolling past hero */}
      <header
        className={`fixed top-0 inset-x-0 z-[200] transition-all duration-300 ${
          scrolled
            ? 'opacity-100 pointer-events-auto translate-y-0'
            : 'opacity-0 pointer-events-none -translate-y-2'
        }`}
      >
        <div className="bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="mx-auto flex h-14 max-w-[1160px] items-center justify-between px-5 md:px-10">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src="/logo.png" alt="Convio" className="h-6 w-auto" />
              <span className="text-base font-bold font-heading">Convio</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-border bg-card/60 hover:bg-card transition-colors cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
              </button>

              {!isLoading && isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-8 h-8 rounded-full overflow-hidden border border-border bg-primary/10 flex items-center justify-center cursor-pointer outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user?.name || 'User'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="size-4 text-primary" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                        <LayoutDashboard className="size-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => logout.mutate()}
                      className="flex items-center gap-2 cursor-pointer text-destructive"
                    >
                      <LogOut className="size-4" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : !isLoading ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Log In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm" className="glow-primary-sm">Get Started</Button>
                  </Link>
                </div>
              ) : null}

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </Button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur px-5 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-3 border-t border-border">
              {!isLoading && !isAuthenticated && (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full">Log In</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
              {!isLoading && isAuthenticated && (
                <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Dashboard</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  )
}

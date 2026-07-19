import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, LogOut, LayoutDashboard, User, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from 'next-themes'
import { DirectionHover } from './direction-hover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navLinks = [
  { label: 'Channels', href: '#channels' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Docs', href: '/docs' },
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
    <header className="fixed top-0 inset-x-0 z-[200]">
      <div
        className={`transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled
            ? 'bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 border-b border-border'
            : 'bg-background/40 backdrop-blur-sm'
        }`}
      >
        <div className="mx-auto flex h-14 max-w-[1160px] items-center justify-between px-5 md:px-10">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="Convio" className="h-6 w-auto" />
            <span className="text-base font-bold font-heading">Convio</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const inner = (
                <>
                  <span className="absolute inset-0 rounded-md bg-primary/0 ring-1 ring-transparent transition-[background-color,box-shadow] duration-300 ease-out group-hover:bg-primary/10 group-hover:ring-primary/15" />
                  <span className="relative z-10 flex items-center">
                    <DirectionHover title={link.label} fontSize={13} />
                  </span>
                </>
              )
              const cls = "group relative rounded-md px-3 py-1.5 text-[13px] font-medium transition-[transform] duration-200 ease-out hover:-translate-y-[1px]"
              return link.href.startsWith('/') ? (
                <Link key={link.href} to={link.href} className={cls}>{inner}</Link>
              ) : (
                <a key={link.href} href={link.href} className={cls}>{inner}</a>
              )
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative grid h-8 w-8 place-items-center rounded-full border border-border bg-card/60 transition-colors hover:bg-card active:scale-[0.96] cursor-pointer before:absolute before:-inset-1 before:content-['']"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme === 'dark' ? 'sun' : 'moon'}
                  initial={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
                  transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                  className="absolute grid place-items-center"
                >
                  {theme === 'dark' ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                </motion.span>
              </AnimatePresence>
            </button>

            {!isLoading && isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="relative grid h-8 w-8 place-items-center rounded-full overflow-hidden border border-border bg-primary/10 outline-1 outline-black/10 dark:outline-white/10 cursor-pointer outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.96] before:absolute before:-inset-1 before:content-['']">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user?.name || 'User'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="size-4 text-primary" />
                    )}
                  </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      <Link to="/dashboard" className="flex items-center gap-2 w-full">
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
                  <Button variant="ghost" size="default">Log In</Button>
                </Link>
                <Link to="/signup">
                  <Button size="default" className="glow-primary-sm">Get Started</Button>
                </Link>
              </div>
            ) : null}

            <Button
              variant="ghost"
              size="icon"
              className="relative md:hidden before:absolute before:-inset-1 before:content-[''] active:scale-[0.96]"
              onClick={() => setIsOpen(!isOpen)}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isOpen ? 'close' : 'menu'}
                  initial={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
                  transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                  className="absolute grid place-items-center"
                >
                  {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                </motion.span>
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur px-5 py-4 space-y-3">
          {navLinks.map((link) => {
            const cls = "block text-sm font-medium text-muted-foreground hover:text-foreground"
            const inner = <DirectionHover title={link.label} fontSize={14} hoverColor="var(--foreground)" />
            return link.href.startsWith('/') ? (
              <Link key={link.href} to={link.href} className={cls} onClick={() => setIsOpen(false)}>{inner}</Link>
            ) : (
              <a key={link.href} href={link.href} className={cls} onClick={() => setIsOpen(false)}>{inner}</a>
            )
          })}
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
  )
}

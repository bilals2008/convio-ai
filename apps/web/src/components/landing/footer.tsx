import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'
import { DirectionHover } from './direction-hover'
import { ArrowUp } from 'lucide-react'

const linkGroups = [
  {
    title: 'Product',
    links: [
      { label: 'Channels', href: '#channels' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Get Started', href: '/signup' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Log In', href: '/login' },
      { label: 'Sign Up', href: '/signup' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'System Status', href: '/status' },
    ],
  },
]

const socialLinks = [
  {
    href: 'https://github.com/bilals2008',
    label: 'GitHub',
    icon: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/github/default.svg',
    invert: true,
  },
  {
    href: 'https://www.linkedin.com/in/muhammad-bilal-hassan-327209414/',
    label: 'LinkedIn',
    icon: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/linkedin/default.svg',
    invert: false,
  },
  {
    href: 'https://x.com/MBilal7555',
    label: 'X',
    icon: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/x/default.svg',
    invert: true,
  },
]

export function Footer() {
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 520)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <footer className="relative overflow-hidden border-t border-border bg-card/30">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        />

        <div className="mx-auto max-w-[1160px] px-5 md:px-10 py-8 md:py-10">
          <div className="grid gap-6 md:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
            <div>
              <Link to="/" className="flex items-center gap-2">
                <img src="/logo.png" alt="Convio" className="h-7 w-auto" />
                <span className="font-heading text-lg font-bold tracking-tight">Convio</span>
              </Link>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                One AI agent for every customer channel.
              </p>
            </div>

            {linkGroups.map((group) => (
              <div key={group.title}>
                <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">
                  {group.title}
                </h3>
                <ul className="mt-3 space-y-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      {link.href.startsWith('/') ? (
                        <Link
                          to={link.href}
                          className="inline-flex text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <DirectionHover
                            title={link.label}
                            fontSize={14}
                            textColor="var(--muted-foreground)"
                            hoverColor="var(--foreground)"
                          />
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="inline-flex text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <DirectionHover
                            title={link.label}
                            fontSize={14}
                            textColor="var(--muted-foreground)"
                            hoverColor="var(--foreground)"
                          />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Separator className="my-5" />

          <div className="flex flex-col-reverse items-center gap-5 sm:flex-row sm:justify-between">
            <div className="flex flex-col items-center gap-1 sm:items-start">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Convio. All rights reserved.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-lg border border-border bg-background/40 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"
                >
                  <img
                    src={social.icon}
                    alt={social.label}
                    className={`size-5${social.invert ? ' dark:invert' : ''}`}
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`fixed bottom-5 right-5 z-50 grid size-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_34px_var(--color-primary)/0.22] transition-all duration-300 hover:-translate-y-1 hover:bg-primary/90 ${
          showTop
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-3 opacity-0'
        }`}
      >
        <ArrowUp className="size-5" />
      </button>
    </>
  )
}

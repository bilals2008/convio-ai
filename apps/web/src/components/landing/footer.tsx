import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'
import { DirectionHover } from './direction-hover'
import { useLenis } from './motion'
import { ArrowUp, Globe } from 'lucide-react'

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
  {
    href: 'https://mbilalhassan.vercel.app/',
    label: 'Portfolio',
    lucideIcon: Globe,
  },
]

export function Footer() {
  const [showTop, setShowTop] = useState(false)
  const lenis = useLenis()

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 520)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1 })
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <footer className="relative overflow-hidden border-t border-border bg-card/30">
        <div className="mx-auto max-w-[1160px] px-5 md:px-10 py-10 md:py-12">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))] md:gap-6">
            <div className="col-span-2 sm:col-span-3 md:col-span-1">
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
                <ul className="mt-1 space-y-1">
                  {group.links.map((link) => {
                    const className =
                      'inline-flex items-center py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground'
                    const content = (
                      <DirectionHover
                        title={link.label}
                        fontSize={14}
                        textColor="var(--muted-foreground)"
                        hoverColor="var(--foreground)"
                      />
                    )
                    return (
                      <li key={link.href}>
                        {link.href.startsWith('/') ? (
                          <Link to={link.href} className={className}>
                            {content}
                          </Link>
                        ) : (
                          <a href={link.href} className={className}>
                            {content}
                          </a>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="flex flex-col-reverse items-center gap-5 sm:flex-row sm:justify-between">
            <p className="text-center text-sm text-muted-foreground sm:text-left">
              © {new Date().getFullYear()} Convio. All rights reserved.
            </p>

            <div className="flex items-center gap-2.5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="flex size-10 items-center justify-center rounded-lg border border-border bg-background/40 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground sm:size-9"
                >
                  {social.lucideIcon ? (
                    <social.lucideIcon className="size-5" />
                  ) : (
                    <img
                      src={social.icon}
                      alt={social.label}
                      className={`size-5${social.invert ? ' dark:invert' : ''}`}
                    />
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom-left so it never collides with the bottom-right chat launcher. */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`fixed bottom-5 left-5 z-50 grid size-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:-translate-y-1 hover:bg-primary/90 ${
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

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'
import { DirectionHover } from './direction-hover'
import { ArrowUp } from 'lucide-react'

const footerLinks = [
  { label: 'Channels', href: '#channels' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Live Demo', href: '/widget/demo' },
  { label: 'Log In', href: '/login' },
  { label: 'Get Started', href: '/signup' },
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
      <footer className="relative border-t border-border bg-card/30">
        <div className="mx-auto max-w-[1160px] px-5 md:px-10 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-1">
                <img src="/logo.png" alt="Convio" className="h-7 w-auto" />
                <span className="text-lg font-bold font-heading">Convio</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                One AI agent for every customer channel.
              </p>
            </div>

            <nav className="flex flex-wrap items-center gap-x-7 gap-y-3">
              {footerLinks.map((link) =>
                link.href.startsWith('/') ? (
                  <Link key={link.href} to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex">
                    <DirectionHover title={link.label} fontSize={14} hoverColor="var(--foreground)" />
                  </Link>
                ) : (
                  <a key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex">
                    <DirectionHover title={link.label} fontSize={14} hoverColor="var(--foreground)" />
                  </a>
                )
              )}
            </nav>
          </div>

          <Separator className="my-5" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Convio. All rights reserved.
            </p>

            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-accent"
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

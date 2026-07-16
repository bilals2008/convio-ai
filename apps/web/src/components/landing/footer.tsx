import { Link } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'
import { DirectionHover } from './direction-hover'

const footerLinks = [
  { label: 'Channels', href: '#channels' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Live Demo', href: '/widget/demo' },
  { label: 'Log In', href: '/login' },
  { label: 'Get Started', href: '/signup' },
]

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-card/30">
      <div className="mx-auto max-w-[1160px] px-5 md:px-10 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
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

        <Separator className="my-8" />

        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Convio. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

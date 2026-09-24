import { isValidElement, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

// Brand icon URLs from theSVG (see thesvg skill). Fine to hotlink for
// end-user-facing UI.
const ICON_BASE = 'https://thesvg.org/icons'

// Slugs without a mono variant — render these as plain images (they ship
// brand-colored, visible on any background).
const ICON_NO_MONO = new Set(['linkedin'])

const PLATFORMS: { match: RegExp; slug: string; name: string }[] = [
  { match: /(^|\.)github\.com$/i, slug: 'github', name: 'GitHub' },
  { match: /(^|\.)linkedin\.com$/i, slug: 'linkedin', name: 'LinkedIn' },
  { match: /(^|\.)(x|twitter)\.com$/i, slug: 'x', name: 'X' },
  { match: /(^|\.)youtube\.com$|^youtu\.be$/i, slug: 'youtube', name: 'YouTube' },
  { match: /(^|\.)(discord\.com|discord\.gg)$/i, slug: 'discord', name: 'Discord' },
  { match: /(^|\.)instagram\.com$/i, slug: 'instagram', name: 'Instagram' },
  { match: /(^|\.)facebook\.com$/i, slug: 'facebook', name: 'Facebook' },
  { match: /(^|\.)(t\.me|telegram\.org)$/i, slug: 'telegram', name: 'Telegram' },
  { match: /(^|\.)medium\.com$/i, slug: 'medium', name: 'Medium' },
  { match: /(^|\.)figma\.com$/i, slug: 'figma', name: 'Figma' },
  { match: /(^|\.)behance\.net$/i, slug: 'behance', name: 'Behance' },
  { match: /(^|\.)dribbble\.com$/i, slug: 'dribbble', name: 'Dribbble' },
  { match: /(^|\.)spotify\.com$/i, slug: 'spotify', name: 'Spotify' },
  { match: /(^|\.)twitch\.tv$/i, slug: 'twitch', name: 'Twitch' },
  { match: /(^|\.)reddit\.com$/i, slug: 'reddit', name: 'Reddit' },
  { match: /(^|\.)whatsapp\.com$/i, slug: 'whatsapp', name: 'WhatsApp' },
  { match: /(^|\.)stackoverflow\.com$/i, slug: 'stack-overflow', name: 'Stack Overflow' },
  { match: /(^|\.)dev\.to$/i, slug: 'devdotto', name: 'dev.to' },
  { match: /(^|\.)tiktok\.com$/i, slug: 'tiktok', name: 'TikTok' },
  { match: /(^|\.)pinterest\.[a-z]+$/i, slug: 'pinterest', name: 'Pinterest' },
]

function getPlatform(href: string) {
  try {
    const host = new URL(href).hostname
    return PLATFORMS.find((p) => p.match.test(host))
  } catch {
    return undefined
  }
}

function nodeToString(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeToString).join('')
  if (isValidElement(node)) return nodeToString((node.props as { children?: ReactNode }).children)
  return ''
}

// "https://www.python.org/downloads/" -> "python.org/downloads"
function prettyUrl(url: string): string {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')
    let path = u.pathname.replace(/\/$/, '')
    if (path.length > 24) path = path.slice(0, 24) + '…'
    return `${host}${path}${u.search ? '…' : ''}`
  } catch {
    return url
  }
}

// mono is a single-color mark; rendered via CSS mask so it inherits the link
// color instead of defaulting to black (invisible on dark bubbles).
function BrandIcon({ slug }: { slug: string }) {
  if (ICON_NO_MONO.has(slug)) {
    return (
      <img
        src={`${ICON_BASE}/${slug}/default.svg`}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="inline-block size-4 shrink-0"
      />
    )
  }
  const icon = `${ICON_BASE}/${slug}/mono.svg`
  return (
    <span
      aria-hidden="true"
      className="inline-block size-4 shrink-0"
      style={{
        backgroundColor: 'currentColor',
        WebkitMask: `url(${icon}) center / contain no-repeat`,
        mask: `url(${icon}) center / contain no-repeat`,
      }}
    />
  )
}

function WidgetLink({ href, children }: { href?: string; children?: ReactNode }) {
  if (!href) return <a>{children}</a>
  const platform = getPlatform(href)
  const text = nodeToString(children).trim()
  // A bare URL (autolinked) gets a clean host+path label; real [text](url)
  // links keep their author-provided text.
  const isBareUrl = text === href || text === href.replace(/\/$/, '')

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={href}
      className="inline-flex items-center gap-1 align-baseline break-words font-medium text-[hsl(var(--widget-primary))] underline underline-offset-4 hover:opacity-80"
    >
      {platform ? (
        <BrandIcon slug={platform.slug} />
      ) : (
        <Globe className="size-4 shrink-0 opacity-80" />
      )}
      <span className="break-words">{isBareUrl ? prettyUrl(href) : children}</span>
    </a>
  )
}

const markdownComponents = {
  h1: ({ children }: { children?: ReactNode }) => (
    <h1 className="mb-2 mt-4 text-base font-semibold leading-snug first:mt-0">{children}</h1>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="mb-2 mt-4 text-[15px] font-semibold leading-snug first:mt-0">{children}</h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="mb-1.5 mt-3 text-sm font-semibold leading-snug first:mt-0">{children}</h3>
  ),
  h4: ({ children }: { children?: ReactNode }) => (
    <h4 className="mb-1 mt-3 text-[13px] font-semibold leading-snug first:mt-0">{children}</h4>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="my-2 break-words leading-relaxed first:mt-0 last:mb-0">{children}</p>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="my-2 list-disc space-y-1 pl-5 marker:text-[hsl(var(--widget-muted-foreground))]">{children}</ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="my-2 list-decimal space-y-1 pl-5 marker:text-[hsl(var(--widget-muted-foreground))]">{children}</ol>
  ),
  li: ({ children }: { children?: ReactNode }) => (
    <li className="break-words pl-0.5 leading-relaxed">{children}</li>
  ),
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="my-3 border-l-2 border-[hsl(var(--widget-primary))] pl-3 text-[hsl(var(--widget-muted-foreground))]">{children}</blockquote>
  ),
  hr: () => <hr className="my-3 border-[hsl(var(--widget-border))]" />,
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  table: ({ children }: { children?: ReactNode }) => (
    <div className="my-3 max-w-full overflow-x-auto">
      <table className="w-full border-collapse text-left text-[12px]">{children}</table>
    </div>
  ),
  th: ({ children }: { children?: ReactNode }) => (
    <th className="border border-[hsl(var(--widget-border))] bg-[hsl(var(--widget-bg))] px-2 py-1.5 font-semibold">{children}</th>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td className="border border-[hsl(var(--widget-border))] px-2 py-1.5 align-top">{children}</td>
  ),
  pre: ({ children }: { children?: ReactNode }) => (
    <pre className="my-2 max-w-full overflow-x-auto rounded-md border border-[hsl(var(--widget-border))] bg-[hsl(var(--widget-bg))] p-3 text-[12px] leading-relaxed">{children}</pre>
  ),
  code: ({ children, className }: { children?: ReactNode; className?: string }) => (
    <code
      className={cn(
        'break-words rounded bg-[hsl(var(--widget-primary)_/_0.15)] px-1 py-0.5 text-[12px]',
        className,
      )}
    >
      {children}
    </code>
  ),
  a: WidgetLink,
}

export function WidgetMarkdown({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn('min-w-0 text-[13px] leading-relaxed text-[hsl(var(--widget-text))] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  )
}

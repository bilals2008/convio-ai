import { isValidElement, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

// Brand icon URLs from theSVG (see thesvg skill). Fine to hotlink for
// end-user-facing UI.
const ICON_BASE = 'https://thesvg.org/icons'

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
        <img
          src={`${ICON_BASE}/${platform.slug}/default.svg`}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="inline-block size-3.5 shrink-0 rounded-[2px]"
        />
      ) : (
        <Globe className="size-3.5 shrink-0 opacity-80" />
      )}
      <span className="break-words">{isBareUrl ? prettyUrl(href) : children}</span>
    </a>
  )
}

export function WidgetMarkdown({ content, className }: { content: string; className?: string }) {
  return (
    <div
      className={cn(
        'prose prose-sm prose-invert max-w-none prose-p:my-1.5 prose-p:leading-relaxed',
        'prose-headings:mb-1 prose-headings:mt-3 prose-headings:font-semibold prose-h1:text-[15px] prose-h2:text-[14px] prose-h3:text-[13px] prose-h4:text-[13px] prose-h1:first:mt-0 prose-h2:first:mt-0 prose-h3:first:mt-0 prose-h4:first:mt-0',
        'prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-li:leading-relaxed prose-li:marker:text-[hsl(var(--widget-muted-foreground))]',
        'prose-strong:font-semibold prose-a:no-underline',
        'prose-code:bg-[hsl(var(--widget-primary)_/_0.15)] prose-code:px-1 prose-code:rounded prose-code:text-[12px] prose-pre:bg-[hsl(var(--widget-bg))] prose-pre:border prose-pre:border-[hsl(var(--widget-border))]',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: WidgetLink }}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
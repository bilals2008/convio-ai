import { isValidElement, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, Copy, ExternalLink } from 'lucide-react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { buttonVariants } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  value: string
  label: string
  className?: string
}

function CopyButton({ value, label, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      /* clipboard may be unavailable */
    }
    setCopied(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => setCopied(false), 1600)
  }, [value])

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Copied' : label}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon-xs" }),
          'text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95',
          className
        )}
      >
        <span className="relative flex size-3.5 items-center justify-center">
          <Copy
            className={cn(
              'absolute size-3.5 transition-all duration-200 ease-out',
              copied ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
            )}
          />
          <Check
            className={cn(
              'absolute size-3.5 text-success transition-all duration-200 ease-out',
              copied ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
            )}
          />
        </span>
      </TooltipTrigger>
      <TooltipContent>{copied ? 'Copied' : label}</TooltipContent>
    </Tooltip>
  )
}

function nodeToString(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeToString).join('')
  if (isValidElement(node)) {
    return nodeToString((node.props as { children?: ReactNode }).children)
  }
  return ''
}

function CodeBlock({
  language,
  rawValue,
  children,
}: {
  language?: string
  rawValue: string
  children: ReactNode
}) {
  return (
    <div className="my-3 overflow-hidden rounded-md border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-1.5">
        <span className="text-xs font-medium text-muted-foreground">{language || 'Code'}</span>
        <CopyButton value={rawValue} label="Copy code" />
      </div>
      <pre className="overflow-x-auto p-3 text-xs leading-5 text-foreground"><code className="hljs bg-transparent p-0">{children}</code></pre>
    </div>
  )
}

// Turn a bare URL into a compact, readable label (host + trimmed path),
// e.g. "https://www.python.org/downloads/" -> "python.org/downloads".
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

const markdownComponents: Components = {
  h1: ({ children }) => <h1 className="mb-3 mt-5 text-xl font-semibold tracking-tight first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 mt-5 text-lg font-semibold tracking-tight first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 mt-4 text-base font-semibold first:mt-0">{children}</h3>,
  p: ({ children }) => <p className="my-2 leading-6 first:mt-0 last:mb-0">{children}</p>,
  a: ({ children, href }) => {
    const text = nodeToString(children).trim()
    // A "bare" URL is one whose visible text is just the href itself
    // (autolinked). Those get a clean label + icon; real [text](url) links
    // keep their author-provided text.
    const isBareUrl = !!href && (text === href || text === href.replace(/\/$/, ''))
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        title={href}
        className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 break-words"
      >
        {isBareUrl ? (
          <span className="inline-flex items-baseline gap-0.5">
            {prettyUrl(href!)}
            <ExternalLink className="size-3 shrink-0 self-center opacity-70" />
          </span>
        ) : (
          children
        )}
      </a>
    )
  },
  ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5 marker:text-muted-foreground">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5 marker:text-muted-foreground">{children}</ol>,
  li: ({ children }) => <li className="pl-1 leading-6">{children}</li>,
  blockquote: ({ children }) => <blockquote className="my-3 border-l-2 border-primary/50 pl-3 italic text-muted-foreground">{children}</blockquote>,
  hr: () => <hr className="my-4 border-border" />,
  table: ({ children }) => <table className="my-3 w-full border-collapse text-left text-sm">{children}</table>,
  th: ({ children }) => <th className="border border-border bg-muted/50 px-2 py-1.5 font-medium">{children}</th>,
  td: ({ children }) => <td className="border border-border px-2 py-1.5 align-top">{children}</td>,
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children }) => {
    // rehype-highlight adds "hljs language-xxx" classes to fenced code blocks.
    const classes = className || ''
    const isBlock = /\bhljs\b/.test(classes) || /\blanguage-/.test(classes)
    if (isBlock) {
      const language = classes.match(/language-([\w-]+)/)?.[1]
      const rawValue = nodeToString(children).replace(/\n$/, '')
      return <CodeBlock language={language} rawValue={rawValue}>{children}</CodeBlock>
    }
    return <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em] text-foreground">{children}</code>
  },
}

export interface AiResponseProps {
  content: string
  isStreaming?: boolean
  className?: string
  showActions?: boolean
}

export function AiResponse({ content, isStreaming = false, className, showActions = true }: AiResponseProps) {
  const [revealed, setRevealed] = useState(false)
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearLongPress = useCallback(() => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current)
      longPressRef.current = null
    }
  }, [])

  const handlePointerDown = useCallback(() => {
    clearLongPress()
    longPressRef.current = window.setTimeout(() => setRevealed(true), 450)
  }, [clearLongPress])

  useEffect(() => () => clearLongPress(), [clearLongPress])

  return (
    <div
      className={cn('group/response min-w-0 text-sm text-foreground', className)}
      onPointerDown={handlePointerDown}
      onPointerUp={clearLongPress}
      onPointerLeave={clearLongPress}
      onPointerCancel={clearLongPress}
    >
      {showActions && content && !isStreaming && (
        <div
          className={cn(
            'mb-1 flex justify-end transition-opacity duration-200',
            revealed
              ? 'opacity-100'
              : 'opacity-0 group-hover/response:opacity-100 focus-within:opacity-100'
          )}
        >
          <CopyButton value={content} label="Copy response" />
        </div>
      )}
      <div className="overflow-x-auto">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
          components={markdownComponents}
        >{content}</ReactMarkdown>
        {isStreaming && <span aria-label="Generating" className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-primary align-middle" />}
      </div>
    </div>
  )
}

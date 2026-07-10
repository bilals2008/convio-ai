import { useCallback, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  value: string
  label: string
  className?: string
}

function CopyButton({ value, label, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }, [value])

  return (
    <Button type="button" variant="ghost" size="xs" onClick={handleCopy} className={cn('gap-1.5 text-muted-foreground hover:text-foreground', className)} aria-label={label}>
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      <span>{copied ? 'Copied' : label}</span>
    </Button>
  )
}

function CodeBlock({ language, value }: { language?: string; value: string }) {
  return (
    <div className="my-3 overflow-hidden rounded-md border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-1.5">
        <span className="text-xs font-medium text-muted-foreground">{language || 'Code'}</span>
        <CopyButton value={value} label="Copy code" />
      </div>
      <pre className="overflow-x-auto p-3 text-xs leading-5 text-foreground"><code>{value}</code></pre>
    </div>
  )
}

const markdownComponents: Components = {
  h1: ({ children }) => <h1 className="mb-3 mt-5 text-xl font-semibold tracking-tight first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 mt-5 text-lg font-semibold tracking-tight first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 mt-4 text-base font-semibold first:mt-0">{children}</h3>,
  p: ({ children }) => <p className="my-2 leading-6 first:mt-0 last:mb-0">{children}</p>,
  a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">{children}</a>,
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
    const value = String(children).replace(/\n$/, '')
    const language = className?.replace('language-', '')
    if (language) return <CodeBlock language={language} value={value} />
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
  return (
    <div className={cn('group/response min-w-0 text-sm text-foreground', className)}>
      <div className="overflow-x-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{content}</ReactMarkdown>
        {isStreaming && <span aria-label="Generating" className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-primary align-middle" />}
      </div>
      {showActions && content && !isStreaming && <div className="mt-2 opacity-0 transition-opacity group-hover/response:opacity-100 focus-within:opacity-100"><CopyButton value={content} label="Copy response" /></div>}
    </div>
  )
}

import type { ReactNode } from 'react'
import hljs from 'highlight.js/lib/core'
import xml from 'highlight.js/lib/languages/xml'
import plaintext from 'highlight.js/lib/languages/plaintext'
import { cn } from '@/lib/utils'
import { CopyButton } from './copy-button'

hljs.registerLanguage('xml', xml)
hljs.registerLanguage('plaintext', plaintext)

interface CodeBlockProps {
  code: string
  language?: string
  icon?: ReactNode
  className?: string
}

const GRAMMARS: Record<string, string> = { html: 'xml' }

export function CodeBlock({ code, language, icon, className }: CodeBlockProps) {
  const grammar = language ? (GRAMMARS[language] ?? language) : 'plaintext'
  const html = hljs.highlight(code, { language: grammar, ignoreIllegals: true }).value

  return (
    <div className={cn('rounded-lg bg-muted p-4 font-mono text-sm', className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        {language && (
          <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {icon}
            {language}
          </span>
        )}
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  )
}
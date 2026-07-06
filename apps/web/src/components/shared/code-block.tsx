import { cn } from '@/lib/utils'
import { CopyButton } from './copy-button'

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  return (
    <div className={cn('relative rounded-lg bg-muted p-4 font-mono text-sm', className)}>
      <div className="flex items-center justify-between mb-2">
        {language && (
          <span className="text-xs text-muted-foreground uppercase">{language}</span>
        )}
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  )
}

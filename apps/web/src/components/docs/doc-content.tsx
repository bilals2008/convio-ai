import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { DocFeedback } from './doc-feedback'

interface DocContentProps {
  children: ReactNode
  className?: string
}

export function DocContent({ children, className }: DocContentProps) {
  return (
    <div className={cn(
      'max-w-[680px] text-[13px] leading-[1.6] text-muted-foreground',
      '[&>*:first-child]:mt-0',
      // Headings
      '[&>h1]:font-heading [&>h1]:text-2xl sm:[&>h1]:text-[28px] [&>h1]:font-semibold [&>h1]:tracking-[-0.02em] [&>h1]:leading-tight [&>h1]:text-foreground [&>h1]:mb-2',
      '[&>h2]:font-heading [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:tracking-[-0.01em] [&>h2]:leading-snug [&>h2]:text-foreground [&>h2]:mt-10 [&>h2]:mb-3',
      '[&>h3]:font-heading [&>h3]:text-[15px] [&>h3]:font-semibold [&>h3]:tracking-[-0.01em] [&>h3]:leading-snug [&>h3]:text-foreground [&>h3]:mt-6 [&>h3]:mb-2',
      // Paragraphs
      '[&>p]:mt-3',
      // Links
      '[&>a]:text-primary [&>a]:underline [&>a]:underline-offset-2 [&>a]:decoration-primary/40 [&>a]:transition-colors [&>a:hover]:decoration-primary',
      // Lists
      '[&>ul]:mt-3 [&>ul]:pl-4 [&>ul]:list-disc [&>ol]:mt-3 [&>ol]:pl-4 [&>ol]:list-decimal',
      '[&>li]:mt-1 [&>li]:pl-1',
      // Code
      '[&>code]:text-[12px] [&>code]:font-mono [&>code]:bg-muted [&>code]:border [&>code]:border-border/60 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-foreground/80',
      '[&>pre]:mt-4 [&>pre]:bg-muted [&>pre]:border [&>pre]:border-border/60 [&>pre]:rounded-lg [&>pre]:p-4 [&>pre]:overflow-x-auto',
      '[&>pre>code]:bg-transparent [&>pre>code]:border-0 [&>pre>code]:p-0 [&>pre>code]:text-[12px]',
      // Blockquote
      '[&>blockquote]:mt-4 [&>blockquote]:border-l-2 [&>blockquote]:border-primary/40 [&>blockquote]:pl-4 [&>blockquote]:text-muted-foreground/80',
      // HR
      '[&>hr]:my-8 [&>hr]:border-0 [&>hr]:border-t [&>hr]:border-border/40',
      className
    )}>
      {children}
      <DocFeedback />
    </div>
  )
}

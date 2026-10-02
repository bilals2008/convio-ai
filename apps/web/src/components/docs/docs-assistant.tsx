import { useEffect, useRef, useState, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowUp, Bot, Check, Copy, Maximize2, MessageSquareText, Minimize2, RefreshCw, ThumbsDown, ThumbsUp, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { CodeBlock } from '@/components/shared/code-block'
import { useDocsAssistant, useDocsAssistantStatus, type DocsAssistantMessage } from '@/lib/hooks/use-docs-assistant'
import type { DocsAssistantSource } from '@/lib/api/docs-assistant'
import { useSubmitDocFeedback, useDocFeedback } from '@/lib/hooks/use-doc-feedback'
import { useOrg } from '@/lib/org-context'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

function AssistantFeedback({ slug }: { slug: string }) {
  const { orgId } = useOrg()
  const { data: feedback } = useDocFeedback(orgId, slug)
  const submitFeedback = useSubmitDocFeedback(orgId ?? undefined, slug)

  const vote = (helpful: boolean) => {
    submitFeedback.mutate({ helpful }, {
      onError: () => toast.error('Could not submit feedback. Please try again.'),
    })
  }

  const myVote = feedback?.myVote?.helpful

  return (
    <div className="flex items-center gap-1">
      <span className="mr-1 text-[11px] text-muted-foreground">Helpful?</span>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="This answer was helpful"
        aria-pressed={myVote === true}
        disabled={submitFeedback.isPending || !orgId}
        onClick={() => vote(true)}
        className={cn(myVote === true && 'bg-primary/10 text-primary')}
      >
        <ThumbsUp className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="This answer was not helpful"
        aria-pressed={myVote === false}
        disabled={submitFeedback.isPending || !orgId}
        onClick={() => vote(false)}
        className={cn(myVote === false && 'bg-destructive/10 text-destructive')}
      >
        <ThumbsDown className="size-3.5" />
      </Button>
    </div>
  )
}

function CopyAnswerButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error('Could not copy the answer.')
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label={copied ? 'Answer copied' : 'Copy answer'}
      onClick={() => void copy()}
      className="transition-all duration-200"
    >
      <span aria-live="polite">
        {copied ? <Check className="size-3.5 animate-in zoom-in-50 duration-200" /> : <Copy className="size-3.5" />}
      </span>
    </Button>
  )
}

function FeedbackForSources({ sources }: { sources: DocsAssistantSource[] }) {
  const primarySource = sources[0]
  if (!primarySource) return null
  return <AssistantFeedback slug={primarySource.slug} />
}


const SUGGESTIONS = [
  'Help me set up my first AI agent',
  'Which channel should I connect first?',
  'How can I improve my agent’s answers?',
  'Explain my plan limits and usage',
]

function SourceLink({ source }: { source: DocsAssistantSource }) {
  const target = source.url || '/docs'
  const label = source.heading ? `${source.title} — ${source.heading}` : source.title
  return (
    <a
      href={target}
      className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
    >
      <span className="flex size-4 shrink-0 items-center justify-center rounded bg-muted font-mono text-[10px]">
        {source.index}
      </span>
      <span className="truncate">{label}</span>
    </a>
  )
}

function AssistantMarkdown({ children }: { children: string }) {
  const components: Components = {
    a: ({ href, children }) => {
      const isInternal = href?.startsWith('/')
      if (isInternal) {
        return <a href={href} className="font-medium text-primary underline underline-offset-2">{children}</a>
      }
      return <a href={href} target="_blank" rel="noreferrer" className="font-medium text-primary underline underline-offset-2">{children}</a>
    },
    p: ({ children }) => <p className="my-2 text-[13px] leading-6 first:mt-0 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-4 text-[13px] leading-6">{children}</ul>,
    ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-4 text-[13px] leading-6">{children}</ol>,
    li: ({ children }) => <li>{children}</li>,
    h1: ({ children }) => <p className="mt-3 text-sm font-semibold">{children}</p>,
    h2: ({ children }) => <p className="mt-3 text-sm font-semibold">{children}</p>,
    h3: ({ children }) => <p className="mt-3 text-[13px] font-semibold">{children}</p>,
    code: ({ children }) => (
      <code className="rounded bg-muted px-1 py-0.5 font-mono text-[12px]">{children}</code>
    ),
    pre: ({ children }) => {
      const child = Array.isArray(children) ? children[0] : children
      if (child && typeof child === 'object' && 'props' in child) {
        const { className, children: code } = (child as { props: { className?: string; children?: ReactNode } }).props
        return <CodeBlock code={String(code).replace(/\n$/, '')} language={/language-(\w+)/.exec(className ?? '')?.[1]} className="my-2" />
      }
      return <pre className="my-2 overflow-x-auto">{children}</pre>
    },
    blockquote: ({ children }) => (
      <blockquote className="my-2 border-l-2 border-border pl-3 text-[13px] text-muted-foreground">{children}</blockquote>
    ),
  }

  return (
    <div className="text-foreground">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}

function AssistantBubble({
  message,
  isLast,
  isStreaming,
  onRegenerate,
}: {
  message: DocsAssistantMessage
  isLast: boolean
  isStreaming: boolean
  onRegenerate: () => void
}) {
  const showCursor = message.status === 'streaming' && isStreaming
  const hasContent = message.content.trim().length > 0
  const showActions = isLast && message.status !== 'streaming' && hasContent

  return (
    <div className="text-[13px]">
      {hasContent || showCursor ? (
        <>
          <AssistantMarkdown>{message.content || (showCursor ? ' ' : '')}</AssistantMarkdown>
          {showCursor && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-primary align-middle" />}
        </>
      ) : (
        <p role="status" className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex gap-1" aria-hidden="true">
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:120ms]" />
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:240ms]" />
          </span>
          Working on your answer
        </p>
      )}

      {message.status === 'done' && hasContent && message.sources && message.sources.length > 0 && (
        <details className="group mt-3">
          <summary className="w-fit cursor-pointer list-none text-[11px] font-medium text-muted-foreground hover:text-foreground">
            Sources ({message.sources.length})
          </summary>
          <div className="mt-1 space-y-0.5 border-l border-border pl-1">
            {message.sources.map((source) => (
              <SourceLink key={`${source.slug}-${source.index}`} source={source} />
            ))}
          </div>
        </details>
      )}

      {showActions && (
        <div className="mt-3 flex items-center gap-1">
          <CopyAnswerButton content={message.content} />
          <Button variant="ghost" size="icon-xs" aria-label="Regenerate" onClick={onRegenerate}>
            <RefreshCw className="size-3.5" />
          </Button>
          {message.sources && message.sources.length > 0 && (
            <>
              <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
              <FeedbackForSources sources={message.sources} />
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function DocsAssistant({
  renderTrigger,
}: {
  renderTrigger?: (open: () => void) => ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [input, setInput] = useState('')

  const { messages, isStreaming, error, ask, stop, retry, reset } = useDocsAssistant()
  const { data: status } = useDocsAssistantStatus()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, isStreaming])

  const send = (text?: string) => {
    const value = (text ?? input).trim()
    if (!value || isStreaming) return
    setInput('')
    void ask(value)
  }

  return (
    <>
      {renderTrigger ? renderTrigger(() => setOpen(true)) : (
        <Button
          variant="outline"
          className="h-auto w-full justify-start gap-2.5 py-2.5 sm:py-3"
          onClick={() => setOpen(true)}
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-8">
            <MessageSquareText className="size-3.5 sm:size-4" />
          </span>
          <span className="text-left">
            <span className="block text-xs font-medium sm:text-sm">Ask Convio Assistant</span>
            <span className="block text-[10px] text-muted-foreground sm:text-xs">Get answers from Convio docs</span>
          </span>
        </Button>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className={cn(
            'gap-0 p-0 transition-[max-width]',
            expanded ? 'data-[side=right]:sm:max-w-[840px]' : 'data-[side=right]:sm:max-w-[420px]',
          )}
          showCloseButton={false}
        >
          <SheetTitle className="sr-only">Docs assistant</SheetTitle>

          <div className="flex shrink-0 items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Bot className="size-4" />
              Assistant
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" aria-label="Expand" onClick={() => setExpanded((e) => !e)}>
                {expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              </Button>
              <SheetClose render={<Button variant="ghost" size="icon" aria-label="Close" />}>
                <X className="size-4" />
              </SheetClose>
            </div>
          </div>

          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col">
                <div className="mt-8 space-y-1 text-center">
                  <p className="font-heading text-lg font-semibold tracking-tight">How can I help?</p>
                  <p className="text-[13px] leading-5 text-muted-foreground">
                    Ask me about setting up agents, channels, and getting more from Convio.
                  </p>
                </div>
                {status && !status.ready && (
                  <p className="mt-4 rounded-md border border-border bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
                    The assistant is still preparing its documentation index. Please try again shortly.
                  </p>
                )}
                <div className="mt-6 space-y-1.5">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      disabled={isStreaming}
                      onClick={() => send(suggestion)}
                      className="block w-full rounded-md border border-border/70 bg-card px-3 py-2 text-left text-[13px] leading-5 transition-colors hover:border-foreground/20 hover:bg-accent/40 disabled:pointer-events-none disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) =>
                  message.role === 'user' ? (
                    <div key={message.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl bg-muted px-3.5 py-2 text-[13px] leading-5">
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    <div key={message.id}>
                      <AssistantBubble
                        message={message}
                        isLast={index === messages.length - 1}
                        isStreaming={isStreaming}
                        onRegenerate={retry}
                      />
                      {message.status === 'error' && index === messages.length - 1 && (
                        <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                          <p>{error ?? 'Something went wrong.'}</p>
                          <Button variant="link" size="sm" className="mt-1 h-auto p-0" onClick={retry}>
                            Try again
                          </Button>
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          <div className="shrink-0 px-3 pb-3 pt-1">
            <p className="mb-2 px-1 text-[10px] leading-4 text-muted-foreground">
              AI can make mistakes. Verify important details in the linked docs.
            </p>
            <form
              className="rounded-xl border border-border p-2"
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                placeholder="Ask a question..."
                rows={1}
                className="max-h-32 w-full resize-none bg-transparent px-2 py-1 text-[13px] outline-none placeholder:text-muted-foreground"
              />
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={reset}
                  className="px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
                {isStreaming ? (
                  <Button size="icon" variant="secondary" className="rounded-full" aria-label="Stop" type="button" onClick={stop}>
                    <span className="size-2.5 rounded-[2px] bg-foreground" />
                  </Button>
                ) : (
                  <Button size="icon" className="rounded-full" aria-label="Send" type="submit" disabled={!input.trim()}>
                    <ArrowUp className="size-4" />
                  </Button>
                )}
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

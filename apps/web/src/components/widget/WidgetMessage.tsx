import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { WidgetMessage as WidgetMessageType } from '@/hooks/useWidget'
import { useWidgetState } from './WidgetState'
import { WidgetMarkdown } from './WidgetMarkdown'

interface WidgetMessageProps {
  message: WidgetMessageType
  /** @deprecated avatar now renders on every assistant message */
  showAvatar?: boolean
}

export function WidgetMessage({ message }: WidgetMessageProps) {
  const { agentAvatar, agentName } = useWidgetState()
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isUser = message.role === 'user'

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current)
  }, [])

  const initials = agentName
    ? agentName.split(' ').map((w) => w[0]).slice(0, 1).join('').toUpperCase()
    : 'A'

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('failed')
    }
    if (copyTimer.current) clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => {
      setCopyStatus('idle')
      copyTimer.current = null
    }, 1800)
  }

  return (
    <div
      className={cn(
        'convio-msg mb-3 flex animate-in slide-in-from-bottom-1 gap-2 fade-in duration-300',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="mt-0.5 shrink-0">
          {agentAvatar ? (
            <img
              src={agentAvatar}
              alt={agentName}
              className="size-7 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex size-7 items-center justify-center rounded-full"
              style={{
                background: `linear-gradient(135deg, hsl(var(--widget-header-start)), hsl(var(--widget-header-end)))`,
              }}
            >
              <span className="text-[9px] font-bold text-white">{initials}</span>
            </div>
          )}
        </div>
      )}
      <div className={cn('min-w-0 max-w-[85%]', isUser && 'flex flex-col items-end')}>
        <div
          className={cn(
            'w-fit max-w-full text-[13px] leading-relaxed',
            isUser
              ? 'rounded-2xl rounded-br-md px-3.5 py-2.5 text-white'
              : 'pt-1 text-[hsl(var(--widget-text))]',
          )}
          style={
            isUser
              ? {
                  background: `linear-gradient(135deg, hsl(var(--widget-primary)), color-mix(in srgb, hsl(var(--widget-primary)) 85%, black))`,
                }
              : undefined
          }
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <WidgetMarkdown content={message.content} />
          )}
        </div>
        {isUser ? (
          <time
            dateTime={message.timestamp.toISOString()}
            className="mt-1 px-1 text-[10px] leading-none text-[hsl(var(--widget-muted-foreground))]"
          >
            {formatRelativeTime(message.timestamp)}
          </time>
        ) : (
          <div className="mt-1 flex min-h-5 items-center">
            <button
              type="button"
              onClick={copyMessage}
              className="inline-flex min-h-6 items-center gap-1 rounded px-1.5 text-[10px] text-[hsl(var(--widget-muted-foreground))] transition-colors hover:bg-[hsl(var(--widget-muted))] hover:text-[hsl(var(--widget-text))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[hsl(var(--widget-primary))]"
              aria-label={copyStatus === 'copied' ? 'Response copied' : 'Copy response'}
              title={copyStatus === 'failed' ? 'Unable to copy response' : copyStatus === 'copied' ? 'Copied' : 'Copy response'}
            >
              {copyStatus === 'copied' ? <Check className="size-3" /> : <Copy className="size-3" />}
              <span aria-live="polite">
                {copyStatus === 'copied' ? 'Copied' : copyStatus === 'failed' ? 'Copy failed' : ''}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { Bot, User, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { TypingIndicator } from './typing-indicator'

type MessageRole = 'user' | 'assistant'

interface MessageItem {
  id: string
  role: MessageRole
  content: string
  createdAt: string
}

interface ChatPanelProps {
  messages: MessageItem[]
  streaming: boolean
  streamingContent?: string
  onSendMessage: (content: string) => Promise<void>
  onClear?: () => void
  placeholder?: string
  className?: string
  header?: React.ReactNode
  botName?: string
  botAvatar?: string
}

function BotAvatar({ name, avatar, size = 'sm' }: { name: string; avatar?: string; size?: 'sm' | 'lg' }) {
  const initial = name.charAt(0).toUpperCase()
  const sizeClasses = size === 'lg' ? 'size-10' : 'size-7'
  const textSize = size === 'lg' ? 'text-sm' : 'text-xs'

  if (avatar) {
    return (
      <div className={cn('rounded-full shrink-0 overflow-hidden', sizeClasses)}>
        <img src={avatar} alt={name} className="size-full object-cover" />
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-center rounded-full shrink-0 bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20', sizeClasses)}>
      <span className={cn('font-semibold text-primary', textSize)}>{initial}</span>
    </div>
  )
}

export function ChatPanel({
  messages,
  streaming,
  streamingContent,
  onSendMessage,
  onClear,
  placeholder = 'Type a message...',
  className,
  header,
  botName = 'Bot',
  botAvatar,
}: ChatPanelProps) {
  const [value, setValue] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  useEffect(() => {
    if (!streaming) {
      textareaRef.current?.focus()
    }
  }, [streaming])

  const handleSend = async () => {
    const trimmed = value.trim()
    if (!trimmed || streaming) return
    setValue('')
    await onSendMessage(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={cn('flex flex-col rounded-xl border bg-card overflow-hidden', className)}>
      {header && (
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
          {header}
          {onClear && messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-xs text-muted-foreground"
            >
              <Trash2 className="size-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[500px]">
        {messages.length === 0 && !streaming && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 text-muted-foreground">
            <BotAvatar name={botName} avatar={botAvatar} size="lg" />
            <p className="text-sm mt-3">Send a message to test</p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === 'user'
          return (
            <div key={msg.id} className={cn('flex gap-2', isUser ? 'flex-row-reverse' : 'flex-row')}>
              {isUser ? (
                <div className="flex size-7 items-center justify-center rounded-full shrink-0 bg-primary/10">
                  <User className="size-3.5 text-primary" />
                </div>
              ) : (
                <BotAvatar name={botName} avatar={botAvatar} />
              )}
              <div className={cn('max-w-[75%] space-y-1', isUser && 'items-end')}>
                <div className={cn('rounded-xl px-3 py-2 text-sm', isUser ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm')}>
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                </div>
                <div className={cn('text-[10px] text-muted-foreground', isUser && 'text-right')}>
                  {formatTime(msg.createdAt)}
                </div>
              </div>
            </div>
          )
        })}

        {streaming && (
          <div className="flex gap-2">
            <BotAvatar name={botName} avatar={botAvatar} />
            <div className="max-w-[75%]">
              <div className="rounded-xl rounded-tl-sm px-3 py-2 text-sm bg-muted">
                {streamingContent ? (
                  <>
                    <span className="whitespace-pre-wrap">{streamingContent}</span>
                    <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
                  </>
                ) : (
                  <TypingIndicator />
                )}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-end gap-2 border-t p-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={streaming}
          rows={1}
          className={cn(
            'flex-1 resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm',
            'placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
            'disabled:cursor-not-allowed disabled:opacity-50 min-h-[36px] max-h-[120px]'
          )}
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />
        <Button onClick={handleSend} disabled={!value.trim() || streaming} size="icon" className="shrink-0">
          {streaming ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          )}
        </Button>
      </div>
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { formatDate } from '@/lib/utils'
import { useWidgetState } from './WidgetState'
import { WidgetMessage } from './WidgetMessage'
import { WidgetTyping } from './WidgetTyping'
import type { WidgetMessage as WidgetMessageType } from '@/hooks/useWidget'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function groupMessagesByDate(messages: WidgetMessageType[]) {
  const groups: { date: string; messages: WidgetMessageType[] }[] = []
  for (const msg of messages) {
    const dateKey = formatDate(msg.timestamp)
    const last = groups[groups.length - 1]
    if (last && last.date === dateKey) {
      last.messages.push(msg)
    } else {
      groups.push({ date: dateKey, messages: [msg] })
    }
  }
  return groups
}

function shouldShowAvatar(messages: WidgetMessageType[], index: number): boolean {
  const msg = messages[index]
  if (msg.role === 'user') return false
  if (index === 0) return true
  return messages[index - 1].role !== 'assistant'
}

export function WidgetMessages() {
  const { messages, isTyping, streamingContent, agentName, agentAvatar } = useWidgetState()
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevLength = useRef(messages.length)
  const prevStreamingLength = useRef(0)

  useEffect(() => {
    const isNewMessage = messages.length > prevLength.current
    prevLength.current = messages.length
    bottomRef.current?.scrollIntoView({
      behavior: isNewMessage ? 'smooth' : 'auto',
    })
  }, [messages])

  useEffect(() => {
    if (streamingContent.length > prevStreamingLength.current) {
      prevStreamingLength.current = streamingContent.length
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [streamingContent])

  useEffect(() => {
    if (isTyping) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isTyping])

  const initials = agentName
    ? agentName.split(' ').map((w) => w[0]).slice(0, 1).join('').toUpperCase()
    : 'A'

  const groups = groupMessagesByDate(messages)

  return (
    <div
      ref={scrollRef}
      className="convio-messages flex-1 overflow-y-auto px-3 py-2 mt-3"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'hsl(var(--widget-muted)) transparent',
      }}
    >
      {groups.map((group) => (
        <div key={group.date}>
          {group.messages.map((msg, i) => (
            <WidgetMessage
              key={msg.id}
              message={msg}
              showAvatar={shouldShowAvatar(group.messages, i)}
            />
          ))}
        </div>
      ))}
      {streamingContent ? (
        <div className="convio-msg flex gap-2 mb-3 animate-in fade-in duration-300 justify-start">
          <div className="mt-1 shrink-0">
            {agentAvatar ? (
              <img src={agentAvatar} alt={agentName} className="size-7 rounded-full object-cover" />
            ) : (
              <div
                className="size-7 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, hsl(var(--widget-header-start)), hsl(var(--widget-header-end)))`,
                }}
              >
                <span className="text-[9px] font-bold text-white">{initials}</span>
              </div>
            )}
          </div>
          <div
            className="group relative max-w-[88%] px-3.5 py-2.5 text-[13px] leading-relaxed rounded-2xl rounded-bl-md text-[hsl(var(--widget-text))] bg-[hsl(var(--widget-prompt-bg))]"
          >
            <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-code:bg-[hsl(var(--widget-primary)_/_0.15)] prose-code:px-1 prose-code:rounded prose-code:text-[12px] prose-pre:bg-[hsl(var(--widget-bg))] prose-pre:border prose-pre:border-[hsl(var(--widget-border))] prose-a:text-[hsl(var(--widget-primary))]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingContent}</ReactMarkdown>
            </div>
            <span className="inline-block w-1.5 h-4 ml-0.5 bg-[hsl(var(--widget-primary))] animate-pulse align-text-bottom" />
          </div>
        </div>
      ) : isTyping && <WidgetTyping />}
      <div ref={bottomRef} />
    </div>
  )
}

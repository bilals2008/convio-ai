import { useEffect, useRef } from 'react'
import { formatDate } from '@/lib/utils'
import { useWidgetState } from './WidgetState'
import { WidgetMessage } from './WidgetMessage'
import { WidgetTyping } from './WidgetTyping'
import type { WidgetMessage as WidgetMessageType } from '@/hooks/useWidget'

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
      className="convio-messages flex-1 overflow-y-auto px-3 py-2"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'hsl(var(--widget-muted)) transparent',
      }}
    >
      {groups.map((group) => (
        <div key={group.date}>
          <div className="flex items-center justify-center my-4">
            <span className="text-[10px] font-medium text-[hsl(var(--widget-muted-foreground))]/60 tracking-wide bg-[hsl(var(--widget-muted))] px-3 py-1 rounded-full">
              {group.date}
            </span>
          </div>
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
            className="group relative max-w-[88%] px-3.5 py-2.5 text-[13px] leading-relaxed rounded-2xl rounded-bl-md text-[hsl(var(--widget-text))] bg-[hsl(var(--widget-muted))]"
          >
            <p className="whitespace-pre-wrap break-words">
              {streamingContent}
              <span className="inline-block w-1.5 h-4 ml-0.5 bg-[hsl(var(--widget-primary))] animate-pulse align-text-bottom" />
            </p>
          </div>
        </div>
      ) : isTyping && <WidgetTyping />}
      <div ref={bottomRef} />
    </div>
  )
}

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
  const { messages, isTyping } = useWidgetState()
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevLength = useRef(messages.length)

  useEffect(() => {
    const isNewMessage = messages.length > prevLength.current
    prevLength.current = messages.length
    bottomRef.current?.scrollIntoView({
      behavior: isNewMessage ? 'smooth' : 'auto',
    })
  }, [messages])

  useEffect(() => {
    if (isTyping) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isTyping])

  const groups = groupMessagesByDate(messages)

  return (
    <div
      ref={scrollRef}
      className="convio-messages flex-1 overflow-y-auto px-4 py-3"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'transparent transparent',
      }}
    >
      {groups.map((group) => (
        <div key={group.date}>
          <div className="flex items-center justify-center my-4">
            <span className="text-[10px] font-medium text-[hsl(var(--widget-muted-foreground))]/60 tracking-wide">
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
      {isTyping && <WidgetTyping />}
      <div ref={bottomRef} />
    </div>
  )
}

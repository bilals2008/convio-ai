import { useState, useRef, useCallback, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWidgetState } from './WidgetState'

export function WidgetInput() {
  const { onSendMessage, isTyping } = useWidgetState()
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`
  }, [])

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || isTyping) return
    onSendMessage(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [value, isTyping, onSendMessage])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const canSend = value.trim() && !isTyping

  return (
    <div className="convio-input shrink-0 border-t border-[hsl(var(--widget-border))] bg-[hsl(var(--widget-bg))] p-3">
      <div className="flex items-end gap-2">
        <div className="flex-1 rounded-xl border border-[hsl(var(--widget-border))] bg-[hsl(var(--widget-bg))] px-3.5 py-2 transition-all duration-200 focus-within:border-[hsl(var(--widget-primary)_/_0.5)] focus-within:ring-2 focus-within:ring-[hsl(var(--widget-primary)_/_0.1)]">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              adjustHeight()
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isTyping}
            rows={1}
            className="w-full resize-none bg-transparent py-0 text-[13px] leading-relaxed text-[hsl(var(--widget-text))] placeholder:text-[hsl(var(--widget-muted-foreground))]/50 outline-none disabled:opacity-40"
          />
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full transition-all duration-200',
            canSend
              ? 'text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
              : 'bg-[hsl(var(--widget-muted))] text-[hsl(var(--widget-muted-foreground))] cursor-not-allowed'
          )}
          style={
            canSend
              ? {
                  background: `linear-gradient(135deg, hsl(var(--widget-primary)), color-mix(in srgb, hsl(var(--widget-primary)) 80%, black))`,
                }
              : undefined
          }
        >
          <Send className={cn('size-4 transition-transform', canSend && '-rotate-45')} />
        </button>
      </div>
      <p className="text-center text-[10px] text-[hsl(var(--widget-muted-foreground))]/40 mt-2 font-medium">
        Powered by Convio
      </p>
    </div>
  )
}

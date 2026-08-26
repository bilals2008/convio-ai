import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from 'react'
import { Send, Smile } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWidgetState } from './WidgetState'

const EMOJIS = [
  '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊',
  '😋', '😎', '😍', '🥰', '😘', '😗', '😙', '😚', '🙂', '🤗',
  '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥',
  '😮', '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝',
  '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁',
  '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩',
  '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡',
  '😠', '🤬', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌',
  '👐', '🤲', '🤝', '🙏', '✌️', '🤞', '🫶', '❤️', '💔', '💕',
  '🔥', '⭐', '✨', '💯', '🎉', '🎊', '🥳', '🎈', '💪', '🤷',
  '💀', '👀', '🗣️', '💬', '💭', '😶‍🌫️', '🫡', '🫠', '🫢', '🫣',
]

export function WidgetInput() {
  const { onSendMessage, isTyping, placeholderText, showPoweredBy } = useWidgetState()
  const [value, setValue] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emojiRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`
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

  const insertEmoji = useCallback((emoji: string) => {
    setValue((prev) => prev + emoji)
    setShowEmoji(false)
    textareaRef.current?.focus()
  }, [])

  const canSend = value.trim() && !isTyping

  return (
    <div className="convio-input shrink-0 border-t border-[hsl(var(--widget-border))] bg-[hsl(var(--widget-footer-bg))] sm:rounded-b-2xl">
      <div className="p-2.5">
        <div
          className="flex items-end gap-1 rounded-sm border border-[hsl(var(--widget-border))] bg-[hsl(var(--widget-input-bg))] p-1 transition-all duration-200 focus-within:border-[hsl(var(--widget-primary)_/_0.5)]"
        >
          <div className="relative" ref={emojiRef}>
            <button
              type="button"
              onClick={() => setShowEmoji((v) => !v)}
              className="flex size-7 shrink-0 items-center justify-center rounded text-[hsl(var(--widget-muted-foreground))] hover:text-[hsl(var(--widget-primary))] hover:bg-[hsl(var(--widget-primary)_/_0.08)] transition-colors"
              aria-label="Emoji"
            >
              <Smile className="size-4" />
            </button>
            {showEmoji && (
              <div className="absolute bottom-full left-0 mb-2 z-50 w-[280px] max-h-[200px] overflow-y-auto rounded border border-[hsl(var(--widget-border))] bg-[hsl(var(--widget-bg))] p-2 shadow-xl">
                <div className="grid grid-cols-8 gap-0.5">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => insertEmoji(emoji)}
                      className="flex size-8 items-center justify-center rounded text-lg hover:bg-[hsl(var(--widget-muted))] transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              adjustHeight()
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText || "Enter your message..."}
            disabled={isTyping}
            rows={1}
            className="min-h-[28px] w-full flex-1 resize-none bg-transparent py-1.5 text-[13px] leading-relaxed text-[hsl(var(--widget-text))] placeholder:text-[hsl(var(--widget-muted-foreground))]/50 outline-none disabled:opacity-40"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              'mb-0.5 flex size-7 shrink-0 items-center justify-center rounded transition-all duration-200',
              canSend
                ? 'text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
                : 'bg-[hsl(var(--widget-muted))] text-[hsl(var(--widget-muted-foreground))] cursor-not-allowed'
            )}
            style={
              canSend
                ? {
                    background: `hsl(var(--widget-send-btn))`,
                  }
                : undefined
            }
          >
            <Send className={cn('size-3.5 transition-transform', canSend && '-rotate-45')} />
          </button>
        </div>
      </div>
      {showPoweredBy !== false && (
        <p className="text-center text-[10px] text-[hsl(var(--widget-muted-foreground))]/40 pb-2.5 font-medium">
          Powered by{' '}
          <a
            href="https://convio-blush.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Convio
          </a>
        </p>
      )}
    </div>
  )
}

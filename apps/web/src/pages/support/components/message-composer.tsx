import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface MessageComposerProps {
  disabled?: boolean
  disabledPlaceholder?: string
  onSend: (content: string) => void
  onTyping: () => void
}

export function MessageComposer({ disabled, disabledPlaceholder, onSend, onTyping }: MessageComposerProps) {
  const [value, setValue] = useState('')
  const canSend = !disabled && value.trim().length > 0

  function handleSend() {
    if (!canSend) return
    onSend(value.trim())
    setValue('')
  }

  if (disabled) {
    return (
      <div className="border-t px-4 py-3 text-center text-sm text-muted-foreground">
        {disabledPlaceholder ?? 'This conversation is closed.'}
      </div>
    )
  }

  return (
    <div className="border-t bg-card/50 p-3 sm:p-4">
      <div className="flex items-end gap-2">
        <Textarea
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            onTyping()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Write a reply…"
          rows={1}
          aria-label="Message"
          className="min-h-10 max-h-40 resize-none rounded-xl py-2.5"
        />

        <Button
          type="button"
          size="icon"
          className="shrink-0 rounded-xl"
          aria-label="Send message"
          disabled={!canSend}
          onClick={handleSend}
        >
          <Send className="size-4" />
        </Button>
      </div>
      <p className="mt-1.5 hidden px-1 text-[11px] text-muted-foreground sm:block">
        Enter to send · Shift + Enter for a new line
      </p>
    </div>
  )
}

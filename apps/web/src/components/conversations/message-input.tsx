import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  onSend: (message: string) => void
  onInputChange?: () => void
  loading?: boolean
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({
  onSend,
  onInputChange,
  loading,
  disabled,
  placeholder = 'Type a message...',
}: MessageInputProps) {
  const [value, setValue] = useState('')

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || loading || disabled) return
    onSend(trimmed)
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    onInputChange?.()
  }

  return (
    <div className="flex items-end gap-2 px-4 py-3">
      <textarea
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || loading}
        rows={1}
        aria-label="Message input"
        className={cn(
          'flex-1 resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm',
          'placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          'disabled:cursor-not-allowed disabled:opacity-50 min-h-[40px] max-h-[120px]'
        )}
      />
      <Button
        onClick={handleSend}
        disabled={!value.trim() || loading || disabled}
        size="icon"
        className="shrink-0"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
      </Button>
    </div>
  )
}

import { useState } from 'react'
import { ArrowUp, Loader2 } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/ui/input-group'

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

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-3 pt-1 sm:px-6">
      <InputGroup>
        <InputGroupTextarea
          placeholder={placeholder}
          className="min-h-[44px] px-3.5 py-3"
          rows={1}
          value={value}
          disabled={disabled || loading}
          aria-label="Message input"
          onChange={(e) => {
            setValue(e.target.value)
            onInputChange?.()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              handleSend()
            }
          }}
        />
        <InputGroupAddon align="block-end">
          {loading ? (
            <InputGroupButton
              type="button"
              size="icon-sm"
              variant="outline"
              disabled
              aria-label="Sending message"
              className="ml-auto"
            >
              <Loader2 className="animate-spin" />
            </InputGroupButton>
          ) : (
            <InputGroupButton
              size="icon-sm"
              variant="default"
              aria-label="Send message"
              className="ml-auto"
              disabled={!value.trim() || disabled}
              onClick={handleSend}
            >
              <ArrowUp />
            </InputGroupButton>
          )}
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

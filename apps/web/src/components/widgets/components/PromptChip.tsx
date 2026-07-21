import { useCallback, useEffect, useRef, useState } from 'react'
import { GripVertical, Pencil, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PromptItem } from '../types'

interface PromptChipProps {
  prompt: PromptItem
  onUpdate: (text: string) => void
  onRemove: () => void
  isOnly: boolean
}

export function PromptChip({ prompt, onUpdate, onRemove, isOnly }: PromptChipProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(prompt.text)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const commit = useCallback(() => {
    const trimmed = draft.trim()
    if (trimmed) onUpdate(trimmed)
    else setDraft(prompt.text)
    setEditing(false)
  }, [draft, onUpdate, prompt.text])

  return (
    <div
      role="listitem"
      className={cn(
        'group flex items-center gap-2 rounded-lg border border-border/70 bg-card px-3 py-2 text-sm',
        'transition-all duration-200 hover:border-border hover:bg-muted/30',
      )}
    >
      <GripVertical
        className="size-3.5 shrink-0 cursor-grab text-muted-foreground/40 transition-colors duration-200 group-hover:text-muted-foreground"
        aria-hidden="true"
      />
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') {
              setDraft(prompt.text)
              setEditing(false)
            }
          }}
          maxLength={60}
          aria-label="Edit prompt text"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none"
        />
      ) : (
        <span className="min-w-0 flex-1 truncate text-sm text-foreground">{prompt.text}</span>
      )}
      {!editing && (
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            onClick={() => {
              setDraft(prompt.text)
              setEditing(true)
            }}
            aria-label={`Edit prompt: ${prompt.text}`}
            className="rounded p-1 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Pencil className="size-3" aria-hidden="true" />
          </button>
          {!isOnly && (
            <button
              onClick={onRemove}
              aria-label={`Remove prompt: ${prompt.text}`}
              className="rounded p-1 text-muted-foreground transition-colors duration-150 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

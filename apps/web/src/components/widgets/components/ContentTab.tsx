import { MessageSquare, Plus } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SectionCard } from './SectionCard'
import { AutoGrowTextarea } from './AutoGrowTextarea'
import { PromptChip } from './PromptChip'
import { MAX_GREETING_LENGTH, MAX_PROMPTS } from '../constants'
import type { PromptItem } from '../types'

interface ContentTabProps {
  greeting: string
  onGreetingChange: (value: string) => void
  prompts: PromptItem[]
  onAddPrompt: () => void
  onUpdatePrompt: (id: string, text: string) => void
  onRemovePrompt: (id: string) => void
}

function InfoTrigger({ label }: { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        className="inline-flex size-4 cursor-help items-center justify-center rounded-full border border-border text-[9px] text-muted-foreground transition-colors duration-200 hover:border-foreground/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        aria-label={label}
      >
        ?
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function ContentTab({
  greeting,
  onGreetingChange,
  prompts,
  onAddPrompt,
  onUpdatePrompt,
  onRemovePrompt,
}: ContentTabProps) {
  return (
    <SectionCard
      icon={<MessageSquare className="size-3.5" aria-hidden="true" />}
      title="Conversation"
      description="Set the first thing visitors see when the widget opens."
    >
      <div className="space-y-7">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Label htmlFor="greeting" className="text-sm font-medium text-foreground">
              Greeting
            </Label>
            <InfoTrigger label="Shown before users send their first message" />
            <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground/70">
              {greeting.length}/{MAX_GREETING_LENGTH}
            </span>
          </div>
          <AutoGrowTextarea
            id="greeting"
            value={greeting}
            onChange={onGreetingChange}
            placeholder="Hi there! How can I help you today?"
            rows={2}
            maxLength={MAX_GREETING_LENGTH}
          />
          <p className="text-xs text-muted-foreground">
            This message appears before users send their first message.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-foreground">Starter prompts</Label>
            <InfoTrigger label="Suggested questions users can click" />
            <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-[10px] tabular-nums">
              {prompts.length}/{MAX_PROMPTS}
            </Badge>
          </div>

          {prompts.length > 0 ? (
            <div className="space-y-2" role="list" aria-label="Starter prompts list">
              {prompts.map((p) => (
                <PromptChip
                  key={p.id}
                  prompt={p}
                  onUpdate={(text) => onUpdatePrompt(p.id, text)}
                  onRemove={() => onRemovePrompt(p.id)}
                  isOnly={prompts.length === 1}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-center">
              <p className="text-xs text-muted-foreground">
                No prompts yet. Add up to {MAX_PROMPTS} quick suggestions for visitors.
              </p>
            </div>
          )}

          {prompts.length < MAX_PROMPTS && (
            <button
              onClick={onAddPrompt}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/70 py-2.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label="Add a new starter prompt"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Add prompt
            </button>
          )}
        </div>
      </div>
    </SectionCard>
  )
}

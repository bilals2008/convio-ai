import { useState, useMemo } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface ModelOption {
  id: string
  name: string
  provider?: string
}

interface ModelPickerProps {
  value: string
  models: ModelOption[]
  onSelect: (value: string) => void
  disabled?: boolean
}

const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google AI',
  groq: 'Groq',
  kie: 'KIE AI',
  openrouter: 'OpenRouter',
  opencode: 'OpenCode Zen',
  mistral: 'Mistral',
  together: 'Together',
  deepseek: 'DeepSeek',
  perplexity: 'Perplexity',
  local: 'Local',
}

export function ModelPicker({ value, models, onSelect, disabled }: ModelPickerProps) {
  const [open, setOpen] = useState(false)

  const selectedModel = useMemo(() => models.find((m) => m.id === value), [models, value])

  const groupedModels = useMemo(() => {
    const groups: Record<string, ModelOption[]> = {}
    for (const m of models) {
      const provider = m.provider || 'other'
      if (!groups[provider]) groups[provider] = []
      groups[provider].push(m)
    }
    return groups
  }, [models])

  const sortedProviders = Object.keys(groupedModels).sort()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-full justify-between h-9 font-normal"
        )}
      >
        {selectedModel ? (
          <span className="truncate">{selectedModel.name}</span>
        ) : (
          <span className="text-muted-foreground">Select a model</span>
        )}
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search models..." className="h-9" />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            {sortedProviders.map((provider, idx) => (
              <div key={provider}>
                {idx > 0 && <CommandSeparator />}
                <CommandGroup heading={PROVIDER_LABELS[provider] || provider}>
                  {groupedModels[provider].map((m) => (
                    <CommandItem
                      key={m.id}
                      value={`${m.name} ${m.id}`}
                      onSelect={() => {
                        onSelect(m.id)
                        setOpen(false)
                      }}
                      className="flex items-center gap-2 px-2 py-1.5 cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "size-4 shrink-0",
                          value === m.id ? "opacity-100 text-primary" : "opacity-0"
                        )}
                      />
                      <span className="flex-1 truncate text-sm">{m.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">
                        {m.id}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

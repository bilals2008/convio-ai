import { useState, useMemo } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface ModelOption {
  id: string
  name: string
}

interface ModelPickerProps {
  value: string
  models: ModelOption[]
  onSelect: (value: string) => void
  disabled?: boolean
}

export function ModelPicker({ value, models, onSelect, disabled }: ModelPickerProps) {
  const [open, setOpen] = useState(false)

  const selectedModel = useMemo(() => models.find((m) => m.id === value), [models, value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between h-9 font-normal"
        >
          {selectedModel ? (
            <span className="truncate">{selectedModel.name}</span>
          ) : (
            <span className="text-muted-foreground">Select a model</span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search models..." className="h-9" />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto p-1">
              {models.map((m) => (
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
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

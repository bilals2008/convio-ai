import { useQuery } from '@tanstack/react-query'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { chat as chatApi } from '@/lib/api'

interface Model {
  id: string
  name: string
  provider: string
}

interface AgentModelPickerProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function AgentModelPicker({ value, onChange, disabled }: AgentModelPickerProps) {
  const { data: models, isLoading } = useQuery<Model[]>({
    queryKey: ['models'],
    queryFn: async () => {
      const res = await chatApi.models()
      return (res.data.data || []) as Model[]
    },
    staleTime: 5 * 60 * 1000,
  })

  const groupedModels: Record<string, Model[]> = {}
  if (models) {
    for (const m of models) {
      if (!groupedModels[m.provider]) groupedModels[m.provider] = []
      groupedModels[m.provider].push(m)
    }
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isLoading}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isLoading ? 'Loading models...' : 'Select a model'} />
      </SelectTrigger>
      <SelectContent>
        {isLoading && (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            Loading models...
          </div>
        )}
        {!isLoading && Object.keys(groupedModels).length === 0 && (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No models available. Configure API keys in Settings.
          </div>
        )}
        {Object.entries(groupedModels).map(([provider, providerModels]) => (
          <SelectGroup key={provider}>
            <SelectLabel className="capitalize">{provider}</SelectLabel>
            {providerModels.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
            <SelectSeparator />
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}

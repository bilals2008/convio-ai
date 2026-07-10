import { useQuery } from "@tanstack/react-query"
import { chat as chatApi } from "@/lib/api"
import { ModelPicker } from "./model-picker-dialog"

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

const EMPTY_MODELS: Model[] = []

export function AgentModelPicker({ value, onChange, disabled }: AgentModelPickerProps) {
  const { data, isLoading, isError, error } = useQuery<Model[]>({
    queryKey: ["models"],
    queryFn: async () => {
      const res = await chatApi.models()
      return (res.data.data || []) as Model[]
    },
    staleTime: 5 * 60 * 1000,
  })

  const models = data ?? EMPTY_MODELS

  return (
    <ModelPicker
      value={value}
      models={models}
      onSelect={onChange}
      disabled={disabled}
      loading={isLoading}
      error={isError}
      errorMessage={error instanceof Error ? error.message : undefined}
    />
  )
}

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
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["models"],
    queryFn: async () => {
      const res = await chatApi.models()
      const items = (res.data.data || []) as Model[]
      return [...new Map(items.map((m) => [m.id, m])).values()]
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
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
      onRefresh={refetch}
      refreshing={isFetching}
    />
  )
}

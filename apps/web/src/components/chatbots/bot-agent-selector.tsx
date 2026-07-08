import { useQuery } from '@tanstack/react-query'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { agents as agentsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'

interface Agent {
  id: string
  name: string
  model: string
}

interface BotAgentSelectorProps {
  value: string
  onChange: (agentId: string) => void
  error?: string
  disabled?: boolean
}

export function BotAgentSelector({ value, onChange, error, disabled }: BotAgentSelectorProps) {
  const { orgId } = useOrg()
  const { data: agentsData, isLoading } = useQuery({
    queryKey: ['agents', orgId],
    queryFn: async () => {
      try {
        const res = await agentsApi.list(orgId!)
        return (res.data.data || []) as Agent[]
      } catch {
        return [] as Agent[]
      }
    },
    enabled: !!orgId,
  })

  const agents = agentsData || []
  const selectedAgent = agents.find((a) => a.id === value)

  return (
    <div className="space-y-2">
      <Label>Agent *</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled || isLoading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an agent..." />
        </SelectTrigger>
        <SelectContent>
          {agents.length === 0 && !isLoading && (
            <SelectItem value="none" disabled>No agents available</SelectItem>
          )}
          {agents.map((agent) => (
            <SelectItem key={agent.id} value={agent.id}>
              {agent.name} <span className="text-muted-foreground">({agent.model})</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

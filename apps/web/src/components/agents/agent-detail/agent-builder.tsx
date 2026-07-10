import { type Control } from 'react-hook-form'
import { AgentBasicInfo } from '@/components/agents/agent-basic-info'
import { AgentCapabilities, type Capability } from '@/components/agents/agent-capabilities'
import { AgentBehaviorSettings } from '@/components/agents/agent-behavior-settings'

interface ModelOption {
  id: string
  name: string
  provider?: string
}

interface AgentBuilderProps {
  control: Control
  capabilities: Capability[]
  onCapabilityToggle: (id: string, enabled: boolean) => void
  disabled?: boolean
  models?: ModelOption[]
  modelsLoading?: boolean
  modelsError?: boolean
  modelsErrorMessage?: string
}

export function AgentBuilder({
  control,
  capabilities,
  onCapabilityToggle,
  disabled,
  models,
  modelsLoading,
  modelsError,
  modelsErrorMessage,
}: AgentBuilderProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <AgentBasicInfo
          control={control}
          disabled={disabled}
        />

        <AgentBehaviorSettings
          control={control}
          disabled={disabled}
          models={models}
          modelsLoading={modelsLoading}
          modelsError={modelsError}
          modelsErrorMessage={modelsErrorMessage}
        />
      </div>

      <div className="space-y-6">
        <AgentCapabilities
          capabilities={capabilities}
          onToggle={onCapabilityToggle}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

import { AgentBasicInfo } from '@/components/agents/agent-basic-info'
import { AgentCapabilities, type Capability } from '@/components/agents/agent-capabilities'
import { AgentBehaviorSettings } from '@/components/agents/agent-behavior-settings'

interface ModelOption {
  id: string
  name: string
  provider?: string
}

interface AgentBuilderProps {
  name: string
  description: string
  model: string
  systemPrompt: string
  temperature: number
  toneOfVoice: string
  language: string
  capabilities: Capability[]
  models?: ModelOption[]
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onModelChange: (value: string) => void
  onSystemPromptChange: (value: string) => void
  onTemperatureChange: (value: number) => void
  onToneChange: (value: string) => void
  onLanguageChange: (value: string) => void
  onCapabilityToggle: (id: string, enabled: boolean) => void
  disabled?: boolean
}

export function AgentBuilder({
  name,
  description,
  model,
  systemPrompt,
  temperature,
  toneOfVoice,
  language,
  capabilities,
  models,
  onNameChange,
  onDescriptionChange,
  onModelChange,
  onSystemPromptChange,
  onTemperatureChange,
  onToneChange,
  onLanguageChange,
  onCapabilityToggle,
  disabled,
}: AgentBuilderProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <AgentBasicInfo
          name={name}
          description={description}
          onNameChange={onNameChange}
          onDescriptionChange={onDescriptionChange}
          disabled={disabled}
        />

        <AgentBehaviorSettings
          toneOfVoice={toneOfVoice}
          language={language}
          model={model}
          temperature={temperature}
          systemPrompt={systemPrompt}
          models={models}
          onToneChange={onToneChange}
          onLanguageChange={onLanguageChange}
          onModelChange={onModelChange}
          onTemperatureChange={onTemperatureChange}
          onSystemPromptChange={onSystemPromptChange}
          disabled={disabled}
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

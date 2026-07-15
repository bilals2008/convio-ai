import { type Control } from 'react-hook-form'
import { AgentBasicInfo } from '@/components/agents/agent-basic-info'
import { AgentCapabilities, type Capability } from '@/components/agents/agent-capabilities'
import { AgentBehaviorSettings } from '@/components/agents/agent-behavior-settings'
import { AgentToolPicker, builtInTools, type BuiltInTool } from '@/components/agents/agent-tool-picker'

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
  tools?: BuiltInTool[]
  onToolToggle?: (id: string, enabled: boolean) => void
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
  tools = builtInTools.map((t) => ({ ...t })),
  onToolToggle,
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

        {onToolToggle && (
          <div className="rounded-lg border border-border/50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex size-5 items-center justify-center rounded-md bg-primary/10">
                <svg className="size-3 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              </div>
              <span className="text-sm font-medium">Tools</span>
            </div>
            <AgentToolPicker
              tools={tools}
              onToggle={onToolToggle}
              disabled={disabled}
            />
          </div>
        )}
      </div>
    </div>
  )
}

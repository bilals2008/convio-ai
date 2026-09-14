import { type Control } from 'react-hook-form'
import { AgentBasicInfo } from '@/components/agents/agent-basic-info'
import { AgentCapabilities, type Capability } from '@/components/agents/agent-capabilities'
import { AgentBehaviorSettings } from '@/components/agents/agent-behavior-settings'
import { AgentToolPicker, builtInTools, type BuiltInTool } from '@/components/agents/agent-tool-picker'
import { AgentGuardrails, type AgentGuardrailsValue } from '@/components/agents/agent-guardrails'
import { AgentComposioToolkits, type ComposioToolkit } from '@/components/agents/agent-composio-toolkits'
import { COMPOSIO_ENABLED, COMPOSIO_LAUNCH_MESSAGE } from '@/lib/feature-flags'
import { CollapsibleSection } from '@/components/agents/collapsible-section'
import { Plug, Wrench, Boxes } from 'lucide-react'

interface ModelOption {
  id: string
  name: string
  provider?: string
}

interface McpServerOption {
  id: string
  name: string
  type: string
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
  toolsDisabled?: boolean
  mcpServers?: McpServerOption[]
  linkedMcpServerIds?: string[]
  onMcpServerToggle?: (serverId: string, checked: boolean) => void
  composioToolkits?: ComposioToolkit[]
  selectedComposioToolkits?: string[]
  onComposioToolkitToggle?: (slug: string, enabled: boolean) => void
  guardrails?: AgentGuardrailsValue
  onGuardrailsChange?: (value: AgentGuardrailsValue) => void
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
  toolsDisabled,
  mcpServers,
  linkedMcpServerIds = [],
  onMcpServerToggle,
  composioToolkits,
  selectedComposioToolkits,
  onComposioToolkitToggle,
  guardrails,
  onGuardrailsChange,
}: AgentBuilderProps) {
  const linkedMcpCount = mcpServers?.filter((s) => linkedMcpServerIds.includes(s.id)).length ?? 0
  const selectedComposioCount = selectedComposioToolkits?.length ?? 0

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

        {guardrails && onGuardrailsChange && (
          <AgentGuardrails value={guardrails} onChange={onGuardrailsChange} disabled={disabled} />
        )}
      </div>

      <div className="space-y-4">
        <CollapsibleSection
          title="Capabilities"
          icon={
            <svg className="size-3 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          }
        >
          <AgentCapabilities
            capabilities={capabilities}
            onToggle={onCapabilityToggle}
            disabled={disabled}
          />
        </CollapsibleSection>

        {onToolToggle && (
          <CollapsibleSection
            title="Tools"
            icon={<Wrench className="size-3 text-primary" />}
            badge={toolsDisabled ? (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">Pro</span>
            ) : undefined}
          >
            {toolsDisabled && (
              <p className="text-xs text-muted-foreground">Upgrade to Pro to enable tools</p>
            )}
            <AgentToolPicker
              tools={tools}
              onToggle={onToolToggle}
              disabled={disabled || toolsDisabled}
            />
          </CollapsibleSection>
        )}

        {/* Composio sits above MCP — connected apps are the primary integration.
            Gated behind Coming Soon until launch: the picker stays wired up,
            the section just shows a teaser until COMPOSIO_ENABLED flips. */}
        {composioToolkits && onComposioToolkitToggle && (
          <CollapsibleSection
            title="Composio Toolkits"
            icon={<Boxes className="size-3 text-primary" />}
            badge={
              !COMPOSIO_ENABLED ? (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Soon</span>
              ) : selectedComposioCount > 0 ? (
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  {selectedComposioCount}
                </span>
              ) : undefined
            }
          >
            {COMPOSIO_ENABLED ? (
              <AgentComposioToolkits
                selectedToolkits={selectedComposioToolkits || []}
                onToggle={onComposioToolkitToggle}
                disabled={disabled}
              />
            ) : (
              <p className="rounded-md border border-dashed px-3 py-3 text-xs text-muted-foreground">
                {COMPOSIO_LAUNCH_MESSAGE}
              </p>
            )}
          </CollapsibleSection>
        )}

        {mcpServers && mcpServers.length > 0 && onMcpServerToggle && (
          <CollapsibleSection
            title="MCP Servers"
            icon={<Plug className="size-3 text-primary" />}
            badge={linkedMcpCount > 0 ? (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                {linkedMcpCount}
              </span>
            ) : undefined}
          >
            <div className="space-y-1">
              {mcpServers.map((server) => {
                const checked = linkedMcpServerIds.includes(server.id)
                return (
                  <label
                    key={server.id}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => onMcpServerToggle(server.id, !checked)}
                      className="size-3.5 accent-primary"
                    />
                    <span className="text-xs">{server.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">({server.type})</span>
                  </label>
                )
              })}
            </div>
          </CollapsibleSection>
        )}
      </div>
    </div>
  )
}

import { useEffect } from "react"
import { useController, type Control } from "react-hook-form"
import { SlidersHorizontal } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ModelPicker } from "./model-picker-dialog"
import { ModelBadges } from "./model-badges"
import { getModelBadges, providerLabel } from "./model-meta"
import { getReasoningEfforts } from "./reasoning"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TemperatureSlider } from "./temperature-slider"

interface ModelOption {
  id: string
  name: string
  provider?: string
}

interface AgentBehaviorSettingsProps {
  control: Control
  disabled?: boolean
  models?: ModelOption[]
  modelsLoading?: boolean
  modelsError?: boolean
  modelsErrorMessage?: string
}

export function AgentBehaviorSettings({
  control,
  disabled,
  models = [],
  modelsLoading = false,
  modelsError = false,
  modelsErrorMessage,
}: AgentBehaviorSettingsProps) {
  const { field: modelField } = useController({ name: 'model', control })
  const { field: tempField } = useController({ name: 'temperature', control })
  const { field: promptField } = useController({ name: 'systemPrompt', control })
  const { field: reasoningField } = useController({ name: 'reasoningEffort', control })

  const selectedModel = models.find((m) => m.id === modelField.value)
  const selectedBadges = selectedModel ? getModelBadges(selectedModel) : []
  const reasoningOptions = selectedModel ? getReasoningEfforts(selectedModel) : null

  useEffect(() => {
    if (
      reasoningOptions &&
      !reasoningOptions.some((o) => o.value === reasoningField.value)
    ) {
      reasoningField.onChange(reasoningOptions[0].value)
    }
  }, [reasoningOptions, reasoningField.value, reasoningField.onChange])

  return (
    <div className="space-y-6">
      {/* Model picker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Model</Label>
          {selectedModel && (
            <span className="text-[11px] text-muted-foreground">
              {providerLabel(selectedModel.provider)}
            </span>
          )}
        </div>
        <ModelPicker
          value={modelField.value}
          models={models}
          onSelect={modelField.onChange}
          disabled={disabled}
          loading={modelsLoading}
          error={modelsError}
          errorMessage={modelsErrorMessage}
        />
        {selectedModel && (
          <ModelBadges badges={selectedBadges} className="px-0.5" />
        )}
      </div>

      <Separator />

      {/* System Prompt */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="system-prompt" className="text-xs font-medium">System Prompt</Label>
        </div>
        <Textarea
          id="system-prompt"
          placeholder="Define how your agent should behave, what it knows, and its constraints…"
          value={promptField.value}
          onChange={promptField.onChange}
          disabled={disabled}
          maxLength={2000}
          rows={8}
          className="resize-y"
        />
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <SlidersHorizontal className="size-3" />
            Guides the agent's personality and guardrails
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {promptField.value.length}/2000
          </span>
        </div>
      </div>

      <Separator />

      {/* Temperature + Reasoning — below prompt */}
      <div className="space-y-6">
        <TemperatureSlider
          value={tempField.value}
          onValueChange={tempField.onChange}
          disabled={disabled}
        />

        {reasoningOptions && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Reasoning Effort</Label>
            <Select value={reasoningField.value} onValueChange={reasoningField.onChange} disabled={disabled}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reasoningOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

    </div>
  )
}

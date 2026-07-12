import { useState, useEffect } from "react"
import { useController, type Control } from "react-hook-form"
import { Sparkles, SlidersHorizontal } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox"
import { ModelPicker } from "./model-picker-dialog"
import { PromptTemplatesModal } from "./prompt-templates-modal"
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

const toneOptions = [
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
]

const languageOptions = [
  { value: "english", label: "English" },
  { value: "urdu", label: "Urdu" },
  { value: "arabic", label: "Arabic" },
  { value: "hindi", label: "Hindi" },
]

export function AgentBehaviorSettings({
  control,
  disabled,
  models = [],
  modelsLoading = false,
  modelsError = false,
  modelsErrorMessage,
}: AgentBehaviorSettingsProps) {
  const { field: toneField } = useController({ name: 'toneOfVoice', control })
  const { field: langField } = useController({ name: 'language', control })
  const { field: modelField } = useController({ name: 'model', control })
  const { field: tempField } = useController({ name: 'temperature', control })
  const { field: promptField } = useController({ name: 'systemPrompt', control })
  const { field: reasoningField } = useController({ name: 'reasoningEffort', control })

  const [showTemplates, setShowTemplates] = useState(false)

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

      {/* Tone + Language as comboboxes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Tone</Label>
          <Combobox
            value={toneField.value}
            onValueChange={toneField.onChange}
            disabled={disabled}
          >
            <ComboboxInput placeholder="Select tone" className="h-9" />
            <ComboboxContent>
              <ComboboxList>
                {toneOptions.map((opt) => (
                  <ComboboxItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Language</Label>
          <Combobox
            value={langField.value}
            onValueChange={langField.onChange}
            disabled={disabled}
          >
            <ComboboxInput placeholder="Select language" className="h-9" />
            <ComboboxContent>
              <ComboboxList>
                {languageOptions.map((opt) => (
                  <ComboboxItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>

      <Separator />

      {/* System Prompt */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="system-prompt" className="text-xs font-medium">System Prompt</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowTemplates(true)}
            className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Sparkles className="size-3" />
            Templates
          </Button>
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

      <PromptTemplatesModal
        open={showTemplates}
        onOpenChange={setShowTemplates}
        onSelect={(prompt) => {
          promptField.onChange(prompt)
          setShowTemplates(false)
        }}
      />
    </div>
  )
}

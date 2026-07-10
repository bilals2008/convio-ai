import { useState, useEffect } from "react"
import { useController, type Control } from "react-hook-form"
import { Settings, Sparkles, SlidersHorizontal } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
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
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3.5">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Settings className="size-4" />
        </div>
        <h3 className="text-sm font-semibold">Behavior & Settings</h3>
      </div>

      <div className="space-y-6 p-5">
        {/* Model */}
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

        <div className="h-px bg-border/60" />

        {/* Controls */}
        <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Tone of Voice</Label>
            <Select value={toneField.value} onValueChange={toneField.onChange} disabled={disabled}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Language</Label>
            <Select value={langField.value} onValueChange={langField.onChange} disabled={disabled}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="urdu">Urdu</SelectItem>
                <SelectItem value="arabic">Arabic</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Temperature</Label>
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold tabular-nums text-foreground">
                {tempField.value.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[tempField.value]}
              onValueChange={(value) => tempField.onChange(value[0])}
              min={0}
              max={1}
              step={0.1}
              disabled={disabled}
            />
            <div className="flex justify-between text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <span>Deterministic</span>
              <span>Creative</span>
            </div>
          </div>

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

        <div className="h-px bg-border/60" />

        {/* System prompt */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="system-prompt" className="text-xs font-medium">
              System Prompt
            </Label>
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
            rows={12}
            className="resize-y"
          />
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <SlidersHorizontal className="size-3" />
              Guides the agent’s personality and guardrails
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {promptField.value.length}/2000
            </span>
          </div>
        </div>
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

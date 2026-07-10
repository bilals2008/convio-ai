import { useState, useEffect } from "react"
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
  toneOfVoice: string
  language: string
  model: string
  temperature: number
  systemPrompt: string
  reasoningEffort?: string
  models?: ModelOption[]
  onToneChange: (value: string) => void
  onLanguageChange: (value: string) => void
  onModelChange: (value: string) => void
  onTemperatureChange: (value: number) => void
  onSystemPromptChange: (value: string) => void
  onReasoningEffortChange?: (value: string) => void
  disabled?: boolean
  modelsLoading?: boolean
  modelsError?: boolean
  modelsErrorMessage?: string
}

export function AgentBehaviorSettings({
  toneOfVoice,
  language,
  model,
  temperature,
  systemPrompt,
  reasoningEffort = "medium",
  models = [],
  onToneChange,
  onLanguageChange,
  onModelChange,
  onTemperatureChange,
  onSystemPromptChange,
  onReasoningEffortChange,
  disabled,
  modelsLoading = false,
  modelsError = false,
  modelsErrorMessage,
}: AgentBehaviorSettingsProps) {
  const safeTemperature = temperature ?? 0.7
  const [showTemplates, setShowTemplates] = useState(false)

  const selectedModel = models.find((m) => m.id === model)
  const selectedBadges = selectedModel ? getModelBadges(selectedModel) : []
  const reasoningOptions = selectedModel ? getReasoningEfforts(selectedModel) : null

  useEffect(() => {
    if (
      reasoningOptions &&
      onReasoningEffortChange &&
      !reasoningOptions.some((o) => o.value === reasoningEffort)
    ) {
      onReasoningEffortChange(reasoningOptions[0].value)
    }
  }, [reasoningOptions, reasoningEffort, onReasoningEffortChange])

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
            value={model}
            models={models}
            onSelect={onModelChange}
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
            <Select value={toneOfVoice} onValueChange={(value) => onToneChange(value ?? "")} disabled={disabled}>
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
            <Select value={language} onValueChange={(value) => onLanguageChange(value ?? "")} disabled={disabled}>
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
                {safeTemperature.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[safeTemperature]}
              onValueChange={(value) => onTemperatureChange(Array.isArray(value) ? value[0] : value)}
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

          {reasoningOptions && onReasoningEffortChange && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Reasoning Effort</Label>
              <Select value={reasoningEffort} onValueChange={(value) => onReasoningEffortChange(value ?? "medium")} disabled={disabled}>
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
            value={systemPrompt}
            onChange={(e) => onSystemPromptChange(e.target.value)}
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
              {systemPrompt.length}/2000
            </span>
          </div>
        </div>
      </div>

      <PromptTemplatesModal
        open={showTemplates}
        onOpenChange={setShowTemplates}
        onSelect={(prompt) => {
          onSystemPromptChange(prompt)
          setShowTemplates(false)
        }}
      />
    </div>
  )
}

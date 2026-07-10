import { useState } from 'react'
import { Settings, Sparkles } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { ModelPicker } from './model-picker-dialog'
import { PromptTemplatesModal } from './prompt-templates-modal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  models?: ModelOption[]
  onToneChange: (value: string) => void
  onLanguageChange: (value: string) => void
  onModelChange: (value: string) => void
  onTemperatureChange: (value: number) => void
  onSystemPromptChange: (value: string) => void
  disabled?: boolean
}

export function AgentBehaviorSettings({
  toneOfVoice,
  language,
  model,
  temperature,
  systemPrompt,
  models = [],
  onToneChange,
  onLanguageChange,
  onModelChange,
  onTemperatureChange,
  onSystemPromptChange,
  disabled,
}: AgentBehaviorSettingsProps) {
  const safeTemperature = temperature ?? 0.7
  const [showTemplates, setShowTemplates] = useState(false)

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Settings className="size-4" />
          </div>
          <h3 className="font-semibold text-sm">Behavior & Settings</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 mb-6 md:grid-cols-2">
        <div className="flex flex-col gap-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Tone of Voice</Label>
            <Select value={toneOfVoice} onValueChange={(value) => onToneChange(value ?? '')} disabled={disabled}>
              <SelectTrigger>
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
            <Label className="text-xs font-medium">Model</Label>
            <ModelPicker
              value={model}
              models={models}
              onSelect={onModelChange}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Language</Label>
            <Select value={language} onValueChange={(value) => onLanguageChange(value ?? '')} disabled={disabled}>
              <SelectTrigger>
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
              onValueChange={(value) =>
                onTemperatureChange(Array.isArray(value) ? value[0] : value)
              }
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
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="system-prompt" className="text-xs font-medium">System Prompt (Optional)</Label>
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
          placeholder="Enter instructions for your agent behavior..."
          value={systemPrompt}
          onChange={(e) => onSystemPromptChange(e.target.value)}
          disabled={disabled}
          maxLength={2000}
          rows={5}
        />
        <div className="flex justify-between">
          {systemPrompt.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {systemPrompt.length} characters
            </span>
          )}
          <span className="text-xs text-muted-foreground ml-auto">{systemPrompt.length}/2000</span>
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

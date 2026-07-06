import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AgentSettingsProps {
  temperature: number
  maxTokens: number
  onTemperatureChange: (value: number) => void
  onMaxTokensChange: (value: number) => void
  disabled?: boolean
}

export function AgentSettings({
  temperature,
  maxTokens,
  onTemperatureChange,
  onMaxTokensChange,
  disabled,
}: AgentSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Temperature</Label>
          <span className="text-sm text-muted-foreground">{temperature}</span>
        </div>
        <Slider
          value={[temperature]}
          onValueChange={(value) => onTemperatureChange(value[0])}
          min={0}
          max={2}
          step={0.1}
          disabled={disabled}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Precise</span>
          <span>Balanced</span>
          <span>Creative</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="max-tokens">Max Tokens</Label>
        <Input
          id="max-tokens"
          type="number"
          min={100}
          max={8192}
          value={maxTokens}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10)
            if (!isNaN(val) && val >= 100 && val <= 8192) {
              onMaxTokensChange(val)
            }
          }}
          disabled={disabled}
          className="w-32"
        />
        <p className="text-xs text-muted-foreground">
          Maximum response length (100 - 8192 tokens)
        </p>
      </div>
    </div>
  )
}

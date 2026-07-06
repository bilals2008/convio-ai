import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const presetColors = [
  '#fb923c',
  '#3b82f6',
  '#10b981',
  '#8b5cf6',
  '#ef4444',
  '#06b6d4',
  '#f59e0b',
  '#ec4899',
]

interface BotAppearancePickerProps {
  color: string
  avatar: string
  onColorChange: (color: string) => void
  onAvatarChange: (avatar: string) => void
  disabled?: boolean
}

export function BotAppearancePicker({
  color,
  avatar,
  onColorChange,
  onAvatarChange,
  disabled,
}: BotAppearancePickerProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Widget Color</Label>
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {presetColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onColorChange(c)}
                disabled={disabled}
                className={cn(
                  'size-7 rounded-full transition-transform',
                  color === c ? 'ring-2 ring-ring ring-offset-2 scale-110' : 'hover:scale-110'
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <Input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            disabled={disabled}
            className="size-9 cursor-pointer p-0.5"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bot-avatar">Avatar URL</Label>
        <Input
          id="bot-avatar"
          type="url"
          placeholder="https://example.com/avatar.png"
          value={avatar}
          onChange={(e) => onAvatarChange(e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

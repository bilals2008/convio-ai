import { useState, useRef } from 'react'
import { Upload, ChevronDown, ChevronUp, Link, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface PresetAvatarPickerProps {
  value: string
  onChange: (url: string) => void
  disabled?: boolean
}

const presetCategories = [
  {
    label: 'AI Assistant',
    avatars: [
      'https://api.dicebear.com/7.x/bottts/svg?seed=Agent1&backgroundColor=b6e3f4',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Agent2&backgroundColor=c0aede',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Agent3&backgroundColor=d1d4f9',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Agent4&backgroundColor=ffd5dc',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Agent5&backgroundColor=b6f4c3',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Agent6&backgroundColor=f4e3b6',
    ],
  },
  {
    label: 'Support Agent',
    avatars: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Support1&backgroundColor=b6e3f4',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Support2&backgroundColor=c0aede',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Support3&backgroundColor=d1d4f9',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Support4&backgroundColor=ffd5dc',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Support5&backgroundColor=b6f4c3',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Support6&backgroundColor=f4e3b6',
    ],
  },
  {
    label: 'Business',
    avatars: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Biz1&backgroundColor=ffdfbf',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Biz2&backgroundColor=c0aede',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Biz3&backgroundColor=d1d4f9',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Biz4&backgroundColor=ffd5dc',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Biz5&backgroundColor=b6f4c3',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Biz6&backgroundColor=f4e3b6',
    ],
  },
  {
    label: 'Tutor',
    avatars: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Tutor1&backgroundColor=b6f4c3',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Tutor2&backgroundColor=c0aede',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Tutor3&backgroundColor=d1d4f9',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Tutor4&backgroundColor=ffd5dc',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Tutor5&backgroundColor=b6e3f4',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Tutor6&backgroundColor=f4e3b6',
    ],
  },
  {
    label: 'Researcher',
    avatars: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Research1&backgroundColor=c0aede',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Research2&backgroundColor=b6e3f4',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Research3&backgroundColor=d1d4f9',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Research4&backgroundColor=ffd5dc',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Research5&backgroundColor=b6f4c3',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Research6&backgroundColor=f4e3b6',
    ],
  },
  {
    label: 'Developer',
    avatars: [
      'https://api.dicebear.com/7.x/bottts/svg?seed=Dev1&backgroundColor=d1d4f9',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Dev2&backgroundColor=b6e3f4',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Dev3&backgroundColor=c0aede',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Dev4&backgroundColor=ffd5dc',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Dev5&backgroundColor=b6f4c3',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Dev6&backgroundColor=f4e3b6',
    ],
  },
]

export function PresetAvatarPicker({ value, onChange, disabled }: PresetAvatarPickerProps) {
  const [showUrl, setShowUrl] = useState(false)
  const [activeCategory, setActiveCategory] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      onChange(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium">Agent Avatar</Label>

      {/* Preview */}
      {value && (
        <div className="flex items-center gap-3">
          <img src={value} alt="Avatar" className="size-14 rounded-xl object-cover ring-1 ring-border/60" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange('')}
            disabled={disabled}
            className="text-destructive hover:text-destructive"
          >
            <X className="size-3.5" />
            Remove
          </Button>
        </div>
      )}

      {/* Upload + Presets toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Upload className="size-3.5" />
          Upload
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowUrl(!showUrl)}
          disabled={disabled}
        >
          <Link className="size-3.5" />
          URL
          {showUrl ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
        </Button>
      </div>

      {/* URL input (collapsed by default) */}
      {showUrl && (
        <div className="space-y-1.5">
          <Input
            placeholder="https://example.com/avatar.png"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="text-xs"
          />
          <p className="text-[10px] text-muted-foreground">Paste a direct image URL.</p>
        </div>
      )}

      {/* Preset categories */}
      <div className="space-y-2">
        <p className="text-[11px] font-medium text-muted-foreground">Preset Avatars</p>

        {/* Category tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
          {presetCategories.map((cat, i) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => setActiveCategory(i)}
              className={cn(
                'whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors',
                activeCategory === i
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Avatar grid */}
        <div className="grid grid-cols-6 gap-2">
          {presetCategories[activeCategory].avatars.map((url) => (
            <button
              key={url}
              type="button"
              disabled={disabled}
              onClick={() => onChange(url)}
              className={cn(
                'size-10 rounded-lg overflow-hidden ring-2 transition-all hover:ring-primary/50',
                value === url ? 'ring-primary' : 'ring-transparent'
              )}
            >
              <img src={url} alt="Preset" className="size-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
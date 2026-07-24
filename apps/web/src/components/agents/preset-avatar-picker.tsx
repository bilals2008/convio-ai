import { useState, useRef } from 'react'
import { Upload, Palette, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AvatarPresetModal } from '@/components/agents/avatar-preset-modal'
import { useAgentAvatarUpload } from '@/lib/hooks/use-agent-avatar-upload'
import { useOrg } from '@/lib/org-context'
import { toast } from 'sonner'

interface PresetAvatarPickerProps {
  value: string
  onChange: (url: string) => void
  disabled?: boolean
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_MB = 2

export function PresetAvatarPicker({ value, onChange, disabled }: PresetAvatarPickerProps) {
  const { orgId } = useOrg()
  const { upload, isUploading, progress } = useAgentAvatarUpload()
  const [presetModalOpen, setPresetModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Only JPG, PNG, WebP, and GIF images are allowed.')
      e.target.value = ''
      return
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${MAX_SIZE_MB}MB.`)
      e.target.value = ''
      return
    }

    if (!orgId) {
      toast.error('Organization not loaded. Please wait and try again.')
      e.target.value = ''
      return
    }

    try {
      const url = await upload(orgId, file)
      onChange(url)
      toast.success('Avatar uploaded')
    } catch {
      toast.error('Failed to upload avatar')
    } finally {
      e.target.value = ''
    }
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
            disabled={disabled || isUploading}
            className="text-destructive hover:text-destructive"
          >
            <X className="size-3.5" />
            Remove
          </Button>
        </div>
      )}

      {/* Upload + Choose Preset buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          {isUploading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Upload className="size-3.5" />
          )}
          {isUploading ? `Uploading… ${progress}%` : 'Upload Image'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleUpload}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPresetModalOpen(true)}
          disabled={disabled || isUploading}
        >
          <Palette className="size-3.5" />
          Choose Preset
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground">
        JPG, PNG, WebP, or GIF. Max {MAX_SIZE_MB}MB.
      </p>

      <AvatarPresetModal
        open={presetModalOpen}
        onOpenChange={setPresetModalOpen}
        value={value}
        onSelect={onChange}
      />
    </div>
  )
}
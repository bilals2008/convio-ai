import { useState, useRef } from 'react'
import { Upload, ImageIcon, X, Loader2, Camera } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress'
import { useAvatarUpload } from '@/lib/hooks/use-avatar-upload'
import { toast } from 'sonner'

interface AvatarUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  currentAvatar: string | undefined
  currentInitials: string
  onAvatarSaved: (url: string) => void
}

export function AvatarUploadModal({
  open,
  onOpenChange,
  userId,
  currentAvatar,
  currentInitials,
  onAvatarSaved,
}: AvatarUploadModalProps) {
  const { upload: uploadAvatar, saveUrl: saveUrlAvatar, isUploading, progress } = useAvatarUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [urlPreview, setUrlPreview] = useState<string | null>(null)
  const [mode, setMode] = useState<'upload' | 'url'>('upload')

  const handleFileSelect = (file: File | null) => {
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    try {
      const url = await uploadAvatar(userId, selectedFile)
      onAvatarSaved(url)
      onOpenChange(false)
      toast.success('Avatar updated successfully')
    } catch {
      toast.error('Failed to upload avatar')
    }
  }

  const handleUrlSave = async () => {
    const trimmed = urlInput.trim()
    if (!trimmed) return

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      toast.error('Please enter a valid URL')
      return
    }

    try {
      const url = await saveUrlAvatar(trimmed)
      onAvatarSaved(url)
      onOpenChange(false)
      toast.success('Avatar updated successfully')
    } catch {
      toast.error('Failed to save avatar URL')
    }
  }

  const handleClose = () => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setSelectedFile(null)
    setUrlInput('')
    setUrlPreview(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Avatar</DialogTitle>
          <DialogDescription>Upload an image or paste a URL for your profile picture.</DialogDescription>
        </DialogHeader>

        <div className="flex justify-center">
          <Avatar className="size-28 rounded-full ring-4 ring-muted">
            {urlPreview || preview || currentAvatar ? (
              <AvatarImage
                src={urlPreview || preview || currentAvatar}
                alt="Preview"
                className="rounded-full object-cover"
              />
            ) : (
              <AvatarFallback className="rounded-full bg-primary/10 text-3xl font-semibold text-primary">
                {currentInitials}
              </AvatarFallback>
            )}
          </Avatar>
        </div>

        {/* Tabs */}
        <div className="flex -mx-4 border-b border-border/60 px-4">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              mode === 'upload'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload className="size-4" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              mode === 'url'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ImageIcon className="size-4" />
            URL
          </button>
        </div>

        {mode === 'upload' ? (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            />

            {!selectedFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border px-6 py-8 text-center transition-colors hover:border-muted-foreground/30 hover:bg-muted/30"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <Camera className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Click to select an image</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WebP — max 2MB</p>
                </div>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <ImageIcon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null)
                      setPreview(null)
                    }}
                    className="shrink-0 rounded p-1 text-muted-foreground/50 transition-colors hover:text-muted-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {isUploading && (
                  <div className="space-y-1.5">
                    <Progress value={progress}>
                      <ProgressLabel className="text-xs">Uploading...</ProgressLabel>
                      <ProgressValue className="text-xs" />
                    </Progress>
                  </div>
                )}

                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Save Avatar'
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value)
                  if (e.target.value.startsWith('http')) {
                    setUrlPreview(e.target.value)
                  } else {
                    setUrlPreview(null)
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUrlSave()
                }}
                className="flex-1"
              />
              <Button type="button" onClick={handleUrlSave} className="shrink-0">
                Save
              </Button>
            </div>
            {urlPreview && (
              <p className="text-xs text-muted-foreground break-all">{urlPreview}</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

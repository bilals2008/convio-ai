import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Sparkles, Loader2, Wand2, Download, Check, RefreshCw, ChevronDown, ChevronUp, Palette, ImageIcon, Save } from 'lucide-react'
import { toast } from 'sonner'
import { huggingface, avatarPresets } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { useRoleAtLeast } from '@/lib/hooks/useRole'
import { useAgentAvatarUpload } from '@/lib/hooks/use-agent-avatar-upload'
import { PageContainer } from '@/components/shared/page-container'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const AVATAR_MODELS = [
  { id: 'stabilityai/stable-diffusion-3-medium-diffusers', label: 'SD 3 Medium', description: 'Best for avatars' },
  { id: 'black-forest-labs/FLUX.1-dev', label: 'FLUX.1-dev', description: 'High quality, modern' },
]

const TEMPLATE_CATEGORIES = [
  {
    name: 'Support',
    templates: [
      { name: 'Friendly Rep', prompt: '3D cartoon avatar of a friendly customer support representative, warm smile, professional outfit, Pixar style, soft lighting, pastel blue background, cute and approachable' },
      { name: 'Tech Support', prompt: '3D cartoon avatar of a technical support specialist, wearing headset, glasses, modern casual attire, Pixar style, blue and purple theme' },
      { name: 'Chat Support', prompt: '3D cartoon avatar of a chat support agent, sitting at desk with laptop, friendly expression, Pixar style, warm lighting' },
    ],
  },
  {
    name: 'Business',
    templates: [
      { name: 'Executive', prompt: '3D cartoon avatar of a confident business executive, suit and tie, professional pose, Pixar style, corporate setting, navy blue theme' },
      { name: 'Consultant', prompt: '3D cartoon avatar of a friendly consultant, smart casual outfit, approachable smile, Pixar style, warm beige background' },
      { name: 'Sales Rep', prompt: '3D cartoon avatar of a charismatic sales representative, energetic pose, blazer, Pixar style, vibrant orange theme' },
    ],
  },
  {
    name: 'Education',
    templates: [
      { name: 'Tutor', prompt: '3D cartoon avatar of a friendly tutor, glasses, casual sweater, holding a book, Pixar style, warm green library background' },
      { name: 'Professor', prompt: '3D cartoon avatar of a wise professor, academic robe, glasses, thoughtful expression, Pixar style, dark academia theme' },
      { name: 'Mentor', prompt: '3D cartoon avatar of a supportive mentor, encouraging smile, clipboard in hand, Pixar style, warm beige and teal palette' },
    ],
  },
  {
    name: 'Productivity',
    templates: [
      { name: 'Assistant', prompt: '3D cartoon avatar of a reliable assistant, organized desk, calendar in view, helpful expression, Pixar style, clean minimalist theme' },
      { name: 'Scheduler', prompt: '3D cartoon avatar of a scheduling specialist, headset, calendar background, friendly professional look, Pixar style' },
      { name: 'Automator', prompt: '3D cartoon avatar of an automation expert, gears and robots in background, smart casual, Pixar style, tech blue theme' },
    ],
  },
  {
    name: 'Custom',
    templates: [
      { name: 'Wizard', prompt: '3D cartoon avatar of a wise wizard, magical staff, starry robe, mystical glowing background, Pixar style, deep purple and gold' },
      { name: 'Explorer', prompt: '3D cartoon avatar of an adventurous explorer, safari hat, backpack, curious expression, Pixar style, green and brown theme' },
      { name: 'Robot', prompt: '3D cartoon avatar of a cute friendly robot assistant, glowing eyes, metallic body, sci-fi background, Pixar style, blue and silver' },
    ],
  },
]

const PRESET_CATEGORIES = ['support', 'business', 'education', 'developer', 'creative', 'fantasy', 'health', 'custom'] as const

type GeneratedImage = {
  image: string
  model: string
  prompt: string
  id: string
}

export default function AvatarPlaygroundPage() {
  const { orgId } = useOrg()
  const isOwner = useRoleAtLeast('owner')
  const queryClient = useQueryClient()
  const { upload: uploadToStorage, isUploading: uploadingImage } = useAgentAvatarUpload()

  const [selectedModel, setSelectedModel] = useState(AVATAR_MODELS[0].id)
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [showNegative, setShowNegative] = useState(false)
  const [size] = useState(768)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [presetDialogOpen, setPresetDialogOpen] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [presetCategory, setPresetCategory] = useState<string>('custom')
  const [savingPreset, setSavingPreset] = useState(false)
  const [presetTarget, setPresetTarget] = useState<GeneratedImage | null>(null)

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!orgId) throw new Error('No organization selected')
      const res = await huggingface.generate(orgId, {
        prompt,
        model: selectedModel,
        negativePrompt: negativePrompt || undefined,
        width: size,
        height: size,
      })
      return res.data.data as { image: string; model: string }
    },
    onSuccess: (data) => {
      setGeneratedImages((prev) => [
        { ...data, prompt, id: crypto.randomUUID() },
        ...prev,
      ])
      toast.success('Avatar generated')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const openSaveDialog = (img: GeneratedImage) => {
    setPresetTarget(img)
    setPresetName(prompt.slice(0, 50) || 'Custom avatar')
    setPresetCategory('custom')
    setPresetDialogOpen(true)
  }

  const savePreset = async () => {
    if (!orgId || !presetTarget || !presetName.trim()) return
    setSavingPreset(true)
    try {
      const parts = presetTarget.image.split(',')
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png'
      const raw = atob(parts[1])
      const buf = new Uint8Array(raw.length)
      for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i)
      const blob = new Blob([buf], { type: mime })
      const ext = mime.split('/')[1] || 'png'
      const file = new File([blob], `preset-${Date.now()}.${ext}`, { type: mime })
      const url = await uploadToStorage(orgId, file)
      await avatarPresets.create(orgId, { url, name: presetName.trim(), category: presetCategory })
      queryClient.invalidateQueries({ queryKey: ['avatar-presets', orgId] })
      setPresetDialogOpen(false)
      toast.success('Saved to presets! Available when creating an agent.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save preset')
    } finally {
      setSavingPreset(false)
    }
  }

  const applyTemplate = (t: { name: string; prompt: string }) => {
    setPrompt(t.prompt)
  }

  const getDownloadName = (img: GeneratedImage) => {
    const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    for (const cat of TEMPLATE_CATEGORIES) {
      for (const t of cat.templates) {
        if (t.prompt === img.prompt) return `${slug(cat.name)}-${slug(t.name)}.png`
      }
    }
    return `custom-${slug(img.prompt.slice(0, 30))}.png`
  }

  if (!isOwner) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="py-12 text-center">
            <Palette className="mx-auto size-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Owner access required</p>
            <p className="text-sm text-muted-foreground mt-1">Only organization owners can access the avatar playground.</p>
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Avatar Playground</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate cartoon 3D avatars using Hugging Face models. Pick a template or write your own prompt.
          </p>
        </div>

        <Separator />

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left — Controls */}
          <div className="space-y-6 lg:col-span-2">
            {/* Model picker */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Model</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {AVATAR_MODELS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedModel(m.id)}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-left text-xs transition-colors',
                        selectedModel === m.id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground'
                      )}
                    >
                      <div className="font-medium">{m.label}</div>
                      <div className="text-[10px] opacity-70">{m.description}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Prompt templates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Prompt Templates</CardTitle>
                <CardDescription>Click a template to fill the prompt.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <div key={cat.name}>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{cat.name}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.templates.map((t) => (
                          <button
                            key={t.name}
                            type="button"
                            onClick={() => applyTemplate(t)}
                            className={cn(
                              'rounded-md border border-border/60 px-2.5 py-1 text-[11px] transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary',
                              prompt === t.prompt ? 'border-primary bg-primary/5 text-primary' : 'text-muted-foreground'
                            )}
                          >
                            {t.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Prompt input */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Prompt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the avatar you want..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <p className="text-[10px] text-muted-foreground">{prompt.length} / 1000 characters</p>

                <button
                  type="button"
                  onClick={() => setShowNegative(!showNegative)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {showNegative ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                  Negative prompt
                </button>

                {showNegative && (
                  <textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="Things to avoid..."
                    rows={2}
                    className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                )}

                <Button
                  type="button"
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending || !prompt.trim()}
                  className="w-full"
                >
                  {generateMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Wand2 className="size-4" />
                  )}
                  {generateMutation.isPending ? 'Generating…' : 'Generate Avatar'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right — Results */}
          <div className="space-y-6 lg:col-span-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-sm">Generated Avatars</CardTitle>
                  <CardDescription>
                    {generatedImages.length
                      ? `${generatedImages.length} avatar${generatedImages.length > 1 ? 's' : ''} generated`
                      : 'Results will appear here'}
                  </CardDescription>
                </div>
                {generatedImages.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setGeneratedImages([]); setSelectedImage(null) }}
                  >
                    <RefreshCw className="size-3.5" />
                    Clear
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {generatedImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <ImageIcon className="size-12 text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">Pick a template or write a prompt, then generate.</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">You need a Hugging Face API key in .env</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {generatedImages.map((img) => {
                      const isSelected = selectedImage === img.id
                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => setSelectedImage(isSelected ? null : img.id)}
                          className={cn(
                            'group relative aspect-square rounded-xl overflow-hidden ring-2 transition-all',
                            isSelected ? 'ring-primary ring-offset-2 ring-offset-background' : 'ring-transparent hover:ring-muted-foreground/30'
                          )}
                        >
                          <img src={img.image} alt="Avatar" className="size-full object-cover" />
                          <div className={cn(
                            'absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity',
                            isSelected ? 'opacity-100' : 'group-hover:opacity-100'
                          )}>
                            {isSelected ? (
                              <Check className="size-8 text-white" />
                            ) : (
                              <Sparkles className="size-6 text-white/80" />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {selectedImage && (
                  <>
                    <Separator className="my-4" />
                    {(() => {
                      const img = generatedImages.find((i) => i.id === selectedImage)
                      if (!img) return null
                      return (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium">Selected Avatar</p>
                              <p className="text-[10px] text-muted-foreground truncate">
                                Model: {img.model} · Prompt: {img.prompt.slice(0, 60)}…
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const a = document.createElement('a')
                                  a.href = img.image
                                  a.download = getDownloadName(img)
                                  a.click()
                                }}
                              >
                                <Download className="size-3.5" />
                                Download
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => openSaveDialog(img)}
                              >
                                <Save className="size-3.5" />
                                Save as Preset
                              </Button>
                            </div>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Saved presets appear in the avatar picker when creating agents.
                          </p>
                        </div>
                      )
                    })()}
                  </>
                )}

                {generateMutation.isPending && (
                  <div className="mt-4 flex items-center justify-center rounded-xl border border-dashed border-border/60 py-8">
                    <div className="text-center">
                      <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                      <p className="mt-2 text-xs text-muted-foreground">Generating… this may take 10-30s on first call</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={presetDialogOpen} onOpenChange={setPresetDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Save as Preset</DialogTitle>
            <DialogDescription>This avatar will be available when creating agents.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {presetTarget && (
              <div className="flex items-center gap-3">
                <img src={presetTarget.image} alt="Preview" className="size-12 rounded-xl object-cover ring-1 ring-border/60" />
                <p className="text-xs text-muted-foreground truncate">{presetTarget.model}</p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Name</Label>
              <Input
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="e.g. Friendly Support"
                maxLength={50}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Category</Label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setPresetCategory(cat)}
                    className={`rounded-lg border px-2.5 py-1 text-[11px] transition-colors ${
                      presetCategory === cat
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground'
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setPresetDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={savePreset} disabled={savingPreset || !presetName.trim()}>
                {savingPreset ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                {savingPreset ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

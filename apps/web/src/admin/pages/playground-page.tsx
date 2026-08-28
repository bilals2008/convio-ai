import { useEffect, useMemo, useState } from 'react'
import { ArrowUp, Expand, FlaskConical, Image, MessageSquare, Plus, RotateCcw, Square, Download } from 'lucide-react'
import { useAvailableModels } from '@/lib/hooks/use-available-models'
import { usePlaygroundChat } from '@/lib/hooks/use-playground-chat'
import { usePlaygroundImage } from '@/lib/hooks/use-playground-image'
import { AiResponse } from '@/components/shared/ai-response'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

const IMAGE_SIZES = ['1024x1024', '1024x768', '768x1024', '512x512']

const IMAGE_SUGGESTIONS = [
  {
    label: 'Product photo',
    prompt: 'A professional product photo of a wireless headphone on a clean white background, soft studio lighting, sharp details, commercial photography style',
  },
  {
    label: 'Landscape',
    prompt: 'A serene mountain landscape at golden hour, dramatic clouds, vibrant colors, cinematic composition, 8k detail',
  },
  {
    label: 'Abstract art',
    prompt: 'Abstract fluid art with vibrant gradients of purple, blue, and gold, smooth curves, high resolution, modern aesthetic',
  },
]

const CHAT_SUGGESTIONS = [
  {
    label: 'Explain a concept',
    prompt: 'Explain how RAG (retrieval-augmented generation) works in simple terms.',
  },
  {
    label: 'Write markdown',
    prompt: 'Write a short product update with a heading, bullet list, and a table.',
  },
  {
    label: 'Draft a reply',
    prompt: 'Draft a friendly support reply to a customer asking about a refund.',
  },
]

type PlaygroundMode = 'chat' | 'image'

function ModelSelect({
  models,
  value,
  onValueChange,
}: {
  models: { id: string; name: string }[]
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <Select
      items={models.map((m) => ({ label: m.name, value: m.id }))}
      value={value}
      onValueChange={(next) => {
        if (typeof next === 'string') onValueChange(next)
      }}
    >
      <SelectTrigger aria-label="Model" className="bg-background" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          {models.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

function ImageSizeSelect({
  value,
  onValueChange,
}: {
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <Select
      items={IMAGE_SIZES.map((s) => ({ label: s, value: s }))}
      value={value}
      onValueChange={(next) => {
        if (typeof next === 'string') onValueChange(next)
      }}
    >
      <SelectTrigger aria-label="Image size" className="bg-background" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          {IMAGE_SIZES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default function PlaygroundPage() {
  const { data: models = [], isLoading: modelsLoading } = useAvailableModels()
  const [mode, setMode] = useState<PlaygroundMode>('chat')
  const [model, setModel] = useState('')
  const [imageSize, setImageSize] = useState('1024x1024')
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  const chat = usePlaygroundChat()
  const imageGen = usePlaygroundImage()

  const isImageMode = mode === 'image'
  const imageModels = useMemo(
    () => models.filter((m) => m.id.includes('image')),
    [models],
  )
  const activeModels = isImageMode ? imageModels : models

  const resolvedModel =
    activeModels.some((m) => m.id === model) ? model : (activeModels[0]?.id ?? '')

  const isBusy = isImageMode ? imageGen.status === 'generating' : chat.status === 'streaming'

  useEffect(() => {
    if (!model && activeModels.length > 0) setModel(activeModels[0].id)
  }, [activeModels, model])

  const suggestions = useMemo(
    () => (mode === 'chat' ? CHAT_SUGGESTIONS : IMAGE_SUGGESTIONS),
    [mode],
  )

  const handleChatSubmit = (text: string) => {
    if (!resolvedModel) return
    void chat.send(text, { model: resolvedModel, systemPrompt: 'You are a helpful assistant.' })
  }

  const handleImageSubmit = (text: string) => {
    if (!resolvedModel) return
    void imageGen.generate(text, { model: resolvedModel, size: imageSize })
  }

  const handleSubmit = (text: string) => {
    if (mode === 'chat') handleChatSubmit(text)
    else handleImageSubmit(text)
  }

  const handleReset = () => {
    if (mode === 'chat') chat.reset()
    else imageGen.reset()
  }

  const error = mode === 'chat' ? chat.error : imageGen.error

  const handleDownload = async (url: string, prompt: string) => {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `image-${prompt.slice(0, 40).replace(/[^a-zA-Z0-9]/g, '-')}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(url, '_blank')
    }
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-4xl flex-1 flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="size-5 text-primary" />
          <h1 className="text-lg font-semibold tracking-tight">Playground</h1>
          <span className="text-sm text-muted-foreground">Test your agents and models</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border bg-muted p-0.5">
            <button
              onClick={() => setMode('chat')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                mode === 'chat'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <MessageSquare className="size-3.5" />
              Chat
            </button>
            <button
              onClick={() => setMode('image')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                mode === 'image'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Image className="size-3.5" />
              Image
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={mode === 'chat' ? chat.messages.length === 0 : imageGen.images.length === 0}
          >
            <Plus data-icon="inline-start" />
            New
          </Button>
        </div>
      </div>

      {mode === 'chat' ? (
        /* ── Chat mode ── */
        chat.messages.length === 0 ? (
          <div className="flex min-h-0 flex-1 items-center justify-center p-6">
            <Empty>
              <EmptyHeader>
                <EmptyTitle>What can I help with?</EmptyTitle>
                <EmptyDescription>
                  Pick a model and start chatting. Responses stream live from your configured
                  providers.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <Button
                      key={s.label}
                      variant="outline"
                      size="sm"
                      disabled={!resolvedModel || modelsLoading}
                      onClick={() => handleSubmit(s.prompt)}
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
              </EmptyContent>
            </Empty>
          </div>
        ) : (
          <MessageScrollerProvider>
            <MessageScroller className="min-h-0 flex-1">
              <MessageScrollerViewport>
                <MessageScrollerContent className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-6">
                  {chat.messages.map((message) => (
                    <MessageScrollerItem key={message.id} messageId={message.id} scrollAnchor={message.role === 'user'}>
                      {message.role === 'user' ? (
                        <div className="flex justify-end">
                          <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
                            {message.content}
                          </div>
                        </div>
                      ) : (
                        <div className="flex min-w-0 flex-col gap-1">
                          {message.content ? (
                            <AiResponse content={message.content} showActions={false} />
                          ) : (
                            <span className="flex items-center gap-2 px-3 text-sm text-muted-foreground">
                              <Spinner className="size-3.5" /> Thinking…
                            </span>
                          )}
                        </div>
                      )}
                    </MessageScrollerItem>
                  ))}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        )
      ) : (
        /* ── Image mode ── */
        imageGen.images.length === 0 ? (
          <div className="flex min-h-0 flex-1 items-center justify-center p-6">
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Generate images</EmptyTitle>
                <EmptyDescription>
                  Describe what you want to create. Powered by Agnes Image 2.0 Flash.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <Button
                      key={s.label}
                      variant="outline"
                      size="sm"
                      disabled={!resolvedModel || modelsLoading}
                      onClick={() => handleSubmit(s.prompt)}
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
              </EmptyContent>
            </Empty>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            <div className="mx-auto flex max-w-2xl flex-col gap-6">
              {imageGen.images.map((img) => (
                <div key={img.id} className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
                      {img.prompt}
                    </div>
                    {img.url && (
                      <button
                        type="button"
                        onClick={() => handleDownload(img.url!, img.prompt)}
                        className="shrink-0 rounded-md border bg-background p-1.5 text-muted-foreground hover:text-foreground"
                      >
                        <Download className="size-3.5" />
                      </button>
                    )}
                  </div>
                  {img.url ? (
                    <div
                      className="group relative w-64 cursor-zoom-in overflow-hidden rounded-xl border shadow-sm"
                      onClick={() => setLightboxUrl(img.url!)}
                    >
                      <img
                        src={img.url}
                        alt={img.prompt}
                        className="w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                        <Expand className="size-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </div>
                  ) : img.b64Json ? (
                    <div
                      className="group relative w-64 cursor-zoom-in overflow-hidden rounded-xl border shadow-sm"
                      onClick={() => setLightboxUrl(`data:image/png;base64,${img.b64Json}`)}
                    >
                      <img
                        src={`data:image/png;base64,${img.b64Json}`}
                        alt={img.prompt}
                        className="w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                        <Expand className="size-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-64 w-64 items-center justify-center rounded-xl border bg-muted/50">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Spinner className="size-6" />
                        <span className="text-xs">Generating…</span>
                      </div>
                    </div>
                  )}
                  {img.revisedPrompt && img.revisedPrompt !== img.prompt && (
                    <p className="text-xs text-muted-foreground">
                      Revised: {img.revisedPrompt}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      )}

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 pb-2">
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <RotateCcw className="size-3.5 shrink-0" />
            {error}
          </div>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            const input = event.currentTarget.elements.namedItem('prompt') as HTMLTextAreaElement
            const text = input.value.trim()
            if (!text || isBusy) return
            handleSubmit(text)
            input.value = ''
          }}
        >
          <InputGroup>
            <InputGroupTextarea
              name="prompt"
                placeholder={
                resolvedModel
                  ? mode === 'chat'
                    ? 'Send a message…'
                    : 'Describe the image to generate…'
                  : modelsLoading
                    ? 'Loading models…'
                    : isImageMode
                      ? 'No image models — add an Agnes provider key'
                      : 'No models available — add a provider key first'
              }
              className="p-3.5"
              disabled={!resolvedModel}
            />
            <InputGroupAddon align="block-end">
              <div className="flex items-center gap-1.5">
                <ModelSelect models={activeModels} value={resolvedModel} onValueChange={setModel} />
                {mode === 'image' && (
                  <ImageSizeSelect value={imageSize} onValueChange={setImageSize} />
                )}
              </div>
              {isBusy ? (
                <InputGroupButton
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  aria-label="Stop"
                  className="ml-auto"
                  onClick={() => (mode === 'chat' ? chat.stop() : imageGen.stop())}
                >
                  <Square />
                </InputGroupButton>
              ) : (
                <InputGroupButton
                  type="submit"
                  size="icon-sm"
                  variant="default"
                  aria-label={mode === 'chat' ? 'Send message' : 'Generate image'}
                  className="ml-auto"
                  disabled={!resolvedModel || modelsLoading}
                >
                  <ArrowUp />
                </InputGroupButton>
              )}
            </InputGroupAddon>
          </InputGroup>
        </form>
      </div>

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-8"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl}
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm hover:bg-white/20"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

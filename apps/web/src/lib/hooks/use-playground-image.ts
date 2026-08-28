import { useCallback, useRef, useState } from 'react'
import { image } from '@/lib/api'

export interface GeneratedImage {
  id: string
  url?: string
  b64Json?: string
  revisedPrompt?: string
  prompt: string
  model: string
  size: string
  timestamp: number
}

export interface PlaygroundImageConfig {
  model: string
  size: string
  providerKeyId?: string
  responseFormat?: 'url' | 'b64_json'
}

let counter = 0
const nextId = () => `img-${Date.now()}-${counter++}`

function toFriendlyImageError(raw: string): string {
  const lower = (raw || '').toLowerCase()
  if (lower.includes('api key') || lower.includes('unauthorized') || lower.includes('401')) {
    return 'No valid API key for this provider. Add your key in Settings → Provider Keys.'
  }
  if (lower.includes('rate limit') || lower.includes('429')) {
    return 'Rate limited. Wait a moment and try again.'
  }
  return raw || 'Image generation failed. Please try again.'
}

export function usePlaygroundImage() {
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [status, setStatus] = useState<'idle' | 'generating'>('idle')
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setStatus('idle')
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setImages([])
    setError(null)
    setStatus('idle')
  }, [])

  const generate = useCallback(
    async (prompt: string, config: PlaygroundImageConfig) => {
      const trimmed = prompt.trim()
      if (!trimmed || abortRef.current || !config.model) return
      setError(null)
      setStatus('generating')

      const controller = new AbortController()
      abortRef.current = controller

      const id = nextId()
      const entry: GeneratedImage = {
        id,
        prompt: trimmed,
        model: config.model,
        size: config.size,
        timestamp: Date.now(),
      }
      setImages((prev) => [...prev, entry])

      try {
        const response = await image.generate({
          model: config.model,
          prompt: trimmed,
          size: config.size,
          responseFormat: config.responseFormat || 'url',
          providerKeyId: config.providerKeyId,
        })

        if (controller.signal.aborted) return

        const result = response.data?.data
        setImages((prev) =>
          prev.map((img) =>
            img.id === id
              ? {
                  ...img,
                  url: result?.url,
                  b64Json: result?.b64Json,
                  revisedPrompt: result?.revisedPrompt,
                }
              : img,
          ),
        )
      } catch (err) {
        if (controller.signal.aborted) return
        const msg = err instanceof Error ? err.message : 'Image generation failed'
        setError(toFriendlyImageError(msg))
        setImages((prev) => prev.filter((img) => img.id !== id))
      } finally {
        abortRef.current = null
        setStatus('idle')
      }
    },
    [],
  )

  return { images, status, error, generate, stop, reset }
}

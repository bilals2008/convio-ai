import { useEffect, useMemo, useState } from 'react'
import { Loader2, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EmojiCategory } from './data'

type EmojiDataModule = typeof import('./data')

/** Shown while the dataset loads; the dataset then picks the real default tab. */
const INITIAL_CATEGORY: EmojiCategory = 'smileys'

/** Dash-joined codepoints ("1f600", "1f636-200d-1f32b-fe0f") → the emoji character. */
function emojiFromCodepoints(codepoints: string): string {
  return codepoints
    .split('-')
    .map((hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .join('')
}

interface EmojiPicker3DProps {
  onSelect: (emoji: string) => void
}

/**
 * Microsoft Fluent Emoji 3D picker for the widget composer.
 *
 * The ~94 KB emoji index is a dynamic import, so it is only fetched the first
 * time someone actually opens the picker, and each tile pulls its WebP from the
 * jsDelivr npm CDN on demand — neither costs anything on a normal page load.
 */
export function EmojiPicker3D({ onSelect }: EmojiPicker3DProps) {
  const [data, setData] = useState<EmojiDataModule | null>(null)
  const [failed, setFailed] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<EmojiCategory>(INITIAL_CATEGORY)

  useEffect(() => {
    let cancelled = false
    import('./data')
      .then((module) => {
        if (cancelled) return
        setData(module)
        // The dataset decides which categories exist; fall back to its first tab.
        const firstCategory = module.EMOJI_CATEGORY_ORDER[0]
        if (firstCategory) {
          setCategory((current) =>
            module.EMOJI_CATEGORY_ORDER.includes(current) ? current : firstCategory,
          )
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const trimmedQuery = query.trim().toLowerCase()

  const visible = useMemo(() => {
    if (!data) return []
    if (trimmedQuery) {
      return data.EMOJI_DATA.filter(([, terms]) => terms.includes(trimmedQuery))
    }
    return data.EMOJI_DATA.filter(([, , entryCategory]) => entryCategory === category)
  }, [data, trimmedQuery, category])

  // The first emoji of each category doubles as that tab's icon.
  const tabs = useMemo(() => {
    if (!data) return []
    return data.EMOJI_CATEGORY_ORDER.map((key) => ({
      key,
      label: data.EMOJI_CATEGORY_LABELS[key],
      sample: data.EMOJI_DATA.find(([, , entryCategory]) => entryCategory === key)?.[0] ?? '',
    }))
  }, [data])

  if (failed) {
    return (
      <div className="flex h-[168px] w-[280px] items-center justify-center px-6 text-center text-[11px] text-[hsl(var(--widget-muted-foreground))]">
        Couldn&apos;t load emoji. Check your connection and try again.
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-[168px] w-[280px] items-center justify-center">
        <Loader2 className="size-4 animate-spin text-[hsl(var(--widget-muted-foreground))]" />
      </div>
    )
  }

  return (
    <div className="flex w-[280px] flex-col">
      <div className="border-b border-[hsl(var(--widget-border))] p-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-[hsl(var(--widget-muted-foreground))]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search emoji"
            aria-label="Search emoji"
            className="h-7 w-full rounded border border-[hsl(var(--widget-border))] bg-[hsl(var(--widget-input-bg))] pl-7 pr-2 text-[11px] text-[hsl(var(--widget-text))] outline-none placeholder:text-[hsl(var(--widget-muted-foreground))]/60 focus:border-[hsl(var(--widget-primary)_/_0.5)]"
          />
        </div>
      </div>

      <div className="h-[168px] overflow-y-auto p-1.5">
        {visible.length === 0 ? (
          <p className="py-14 text-center text-[11px] text-[hsl(var(--widget-muted-foreground))]">
            No emoji found
          </p>
        ) : (
          <div className="grid grid-cols-8 gap-1">
            {visible.map(([codepoints, terms]) => (
              <button
                key={codepoints}
                type="button"
                onClick={() => onSelect(emojiFromCodepoints(codepoints))}
                title={terms.split(',')[0]}
                aria-label={terms.split(',')[0]}
                className="flex size-7 items-center justify-center rounded transition-colors hover:bg-[hsl(var(--widget-muted))]"
              >
                <img
                  src={`${data.FLUENT_3D_CDN}/${codepoints}.webp`}
                  alt=""
                  loading="lazy"
                  draggable={false}
                  className="size-5 object-contain"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-0.5 border-t border-[hsl(var(--widget-border))] p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setCategory(tab.key)
              setQuery('')
            }}
            aria-label={tab.label}
            aria-pressed={!trimmedQuery && category === tab.key}
            title={tab.label}
            className={cn(
              'flex size-7 shrink-0 items-center justify-center rounded transition-colors',
              !trimmedQuery && category === tab.key
                ? 'bg-[hsl(var(--widget-primary)_/_0.12)]'
                : 'opacity-55 hover:bg-[hsl(var(--widget-muted))] hover:opacity-100',
            )}
          >
            <img
              src={`${data.FLUENT_3D_CDN}/${tab.sample}.webp`}
              alt=""
              loading="lazy"
              draggable={false}
              className="size-5 object-contain"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

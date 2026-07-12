import { useState } from 'react'
import { ChevronDown, Settings2, Info } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface KbSettings {
  embeddingModel: string
  embeddingDimensions: number
  chunkSize: number
  chunkOverlap: number
  retrieverTopK: number
  retrieverMetric: string
  rerankerEnabled: boolean
}

const defaultSettings: KbSettings = {
  embeddingModel: 'text-embedding-3-small',
  embeddingDimensions: 1536,
  chunkSize: 1000,
  chunkOverlap: 40,
  retrieverTopK: 5,
  retrieverMetric: 'cosine',
  rerankerEnabled: false,
}

interface KbSettingsPanelProps {
  settings?: Partial<KbSettings>
  onChange?: (settings: KbSettings) => void
  disabled?: boolean
  className?: string
}

export function KbSettingsPanel({ settings: externalSettings, onChange, disabled, className }: KbSettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<KbSettings>({ ...defaultSettings, ...externalSettings })

  const update = (patch: Partial<KbSettings>) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    onChange?.(next)
  }

  return (
    <div className={cn('rounded-xl border border-border/60 bg-card', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Settings2 className="size-4" />
          </div>
          <div>
            <p className="text-sm font-medium">AI Settings</p>
            <p className="text-xs text-muted-foreground">
              {settings.embeddingModel} · {settings.chunkSize} chars · top-{settings.retrieverTopK}
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'size-4 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen && (
        <div className="border-t border-border/60 p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Embedding Model</Label>
              <Select
                value={settings.embeddingModel}
                onValueChange={(v) => update({ embeddingModel: v })}
                disabled={disabled}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text-embedding-3-small">text-embedding-3-small</SelectItem>
                  <SelectItem value="text-embedding-3-large">text-embedding-3-large</SelectItem>
                  <SelectItem value="text-embedding-ada-002">text-embedding-ada-002</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Dimensions</Label>
              <Select
                value={String(settings.embeddingDimensions)}
                onValueChange={(v) => update({ embeddingDimensions: Number(v) })}
                disabled={disabled}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1536">1536</SelectItem>
                  <SelectItem value="3072">3072</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Chunk Size (chars)</Label>
              <Select
                value={String(settings.chunkSize)}
                onValueChange={(v) => update({ chunkSize: Number(v) })}
                disabled={disabled}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="750">750</SelectItem>
                  <SelectItem value="1000">1000</SelectItem>
                  <SelectItem value="1500">1500</SelectItem>
                  <SelectItem value="2000">2000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Chunk Overlap (words)</Label>
              <Select
                value={String(settings.chunkOverlap)}
                onValueChange={(v) => update({ chunkOverlap: Number(v) })}
                disabled={disabled}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="40">40</SelectItem>
                  <SelectItem value="60">60</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Retriever Top-K</Label>
              <Select
                value={String(settings.retrieverTopK)}
                onValueChange={(v) => update({ retrieverTopK: Number(v) })}
                disabled={disabled}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Similarity Metric</Label>
              <Select
                value={settings.retrieverMetric}
                onValueChange={(v) => update({ retrieverMetric: v })}
                disabled={disabled}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cosine">Cosine</SelectItem>
                  <SelectItem value="l2">L2 (Euclidean)</SelectItem>
                  <SelectItem value="inner_product">Inner Product</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2.5">
            <Info className="size-4 shrink-0 text-primary" />
            <p className="text-xs text-muted-foreground">
              Changes apply to newly indexed documents. Re-index existing documents to use new settings.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

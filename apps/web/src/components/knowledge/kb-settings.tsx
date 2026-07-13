import { Info } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import type { KbSettings } from './kb-types'

interface KbSettingsTabProps {
  settings: KbSettings
  onChange: (next: KbSettings) => void
  disabled?: boolean
}

export function KbSettingsTab({ settings, onChange, disabled }: KbSettingsTabProps) {
  const update = (patch: Partial<KbSettings>) => onChange({ ...settings, ...patch })

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold">AI Settings</h3>

      <div className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Embedding Model</Label>
          <Select value={settings.embeddingModel} disabled={disabled} onValueChange={(v) => update({ embeddingModel: v })}>
            <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="text-embedding-3-small">text-embedding-3-small</SelectItem>
              <SelectItem value="text-embedding-3-large">text-embedding-3-large</SelectItem>
              <SelectItem value="text-embedding-ada-002">text-embedding-ada-002</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Chunk Size (chars)</Label>
          <Select value={String(settings.chunkSize)} disabled={disabled} onValueChange={(v) => update({ chunkSize: Number(v) })}>
            <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="500">500</SelectItem>
              <SelectItem value="750">750</SelectItem>
              <SelectItem value="1000">1000</SelectItem>
              <SelectItem value="1500">1500</SelectItem>
              <SelectItem value="2000">2000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Chunk Overlap</Label>
          <Select value={String(settings.chunkOverlap)} disabled={disabled} onValueChange={(v) => update({ chunkOverlap: Number(v) })}>
            <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="40">40</SelectItem>
              <SelectItem value="60">60</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Top-K</Label>
          <Select value={String(settings.retrieverTopK)} disabled={disabled} onValueChange={(v) => update({ retrieverTopK: Number(v) })}>
            <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Similarity Threshold</Label>
          <Select value={String(settings.similarityThreshold)} disabled={disabled} onValueChange={(v) => update({ similarityThreshold: Number(v) })}>
            <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0.5">0.50</SelectItem>
              <SelectItem value="0.6">0.60</SelectItem>
              <SelectItem value="0.7">0.70</SelectItem>
              <SelectItem value="0.8">0.80</SelectItem>
              <SelectItem value="0.9">0.90</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Search Strategy</Label>
          <Select value={settings.searchStrategy} disabled={disabled} onValueChange={(v) => update({ searchStrategy: v as KbSettings['searchStrategy'] })}>
            <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="vector">Vector</SelectItem>
              <SelectItem value="keyword">Keyword</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator className="my-5" />

      <div className="flex flex-wrap gap-x-8 gap-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <Switch checked={settings.hybridSearch} disabled={disabled} size="sm" onCheckedChange={(v) => update({ hybridSearch: v })} />
          <span className="text-sm font-medium">Hybrid Search</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <Switch checked={settings.metadataFiltering} disabled={disabled} size="sm" onCheckedChange={(v) => update({ metadataFiltering: v })} />
          <span className="text-sm font-medium">Metadata Filtering</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <Switch checked={settings.rerankerEnabled} disabled={disabled} size="sm" onCheckedChange={(v) => update({ rerankerEnabled: v })} />
          <span className="text-sm font-medium">Reranker</span>
        </label>
      </div>

      <div className="mt-5 flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        <span>Applies to newly indexed documents. Re-index existing sources to apply changes.</span>
      </div>
    </div>
  )
}

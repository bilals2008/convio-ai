import { useCallback } from 'react'
import { Star, Check } from 'lucide-react'
import { SectionCard } from './SectionCard'
import { LAUNCHER_TEMPLATES, type LauncherTemplate } from '../constants'
import { cn } from '@/lib/utils'

interface TemplateTabProps {
  activeTemplate: string | null
  onSelectTemplate: (template: LauncherTemplate) => void
}

function TemplatePreview({ template }: { template: LauncherTemplate }) {
  const { config } = template
  const headerStart = config.headerGradientStart || config.primaryColor || '#fb923c'
  const headerEnd = config.headerGradientEnd || config.primaryColor || '#c2410c'
  const bg = config.backgroundColor || '#1c1c1c'
  const primary = config.primaryColor || '#fb923c'
  const promptBg = config.promptBgColor || '#2a2a2a'

  return (
    <div className="relative aspect-[2/1] w-full overflow-hidden rounded" style={{ background: bg }}>
      <div className="h-2 w-full" style={{ background: `linear-gradient(135deg, ${headerStart}, ${headerEnd})` }} />
      <div className="flex flex-col gap-0.5 p-1">
        <div className="flex justify-start">
          <div className="h-1 w-8 rounded-full" style={{ background: promptBg }} />
        </div>
        <div className="flex justify-end">
          <div className="h-1 w-6 rounded-full" style={{ background: primary }} />
        </div>
        <div className="flex items-center gap-0.5 mt-0.5">
          <div className="h-1.5 flex-1 rounded-full" style={{ background: promptBg }} />
          <div className="size-1.5 shrink-0 rounded-full" style={{ background: primary }} />
        </div>
      </div>
      <div className="absolute bottom-0.5 right-0.5 size-2 rounded-full" style={{ background: primary }} />
    </div>
  )
}

export function TemplateTab({ activeTemplate, onSelectTemplate }: TemplateTabProps) {
  const handleSelect = useCallback(
    (template: LauncherTemplate) => {
      onSelectTemplate(template)
    },
    [onSelectTemplate],
  )

  return (
    <SectionCard
      icon={<Star className="size-3.5" />}
      title="Launcher Templates"
      description="Pick a preset design to apply instantly"
    >
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Star className="size-8 text-muted-foreground/40 mb-2" />
        <p className="text-[13px] text-muted-foreground">More templates coming soon</p>
      </div>
    </SectionCard>
  )
}

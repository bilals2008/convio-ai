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
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg" style={{ background: bg }}>
      {/* Header gradient */}
      <div
        className="h-5 w-full"
        style={{ background: `linear-gradient(135deg, ${headerStart}, ${headerEnd})` }}
      />
      {/* Chat area */}
      <div className="flex flex-col gap-1.5 p-2">
        {/* AI bubble */}
        <div className="flex justify-start">
          <div
            className="h-2 w-14 rounded-full"
            style={{ background: promptBg }}
          />
        </div>
        {/* User bubble */}
        <div className="flex justify-end">
          <div
            className="h-2 w-10 rounded-full"
            style={{ background: primary }}
          />
        </div>
        {/* Input area */}
        <div className="mt-1 flex items-center gap-1">
          <div
            className="h-2.5 flex-1 rounded-full"
            style={{ background: promptBg }}
          />
          <div
            className="size-2.5 shrink-0 rounded-full"
            style={{ background: primary }}
          />
        </div>
      </div>
      {/* Launcher button */}
      <div
        className="absolute bottom-1.5 right-1.5 size-4 rounded-full"
        style={{ background: primary }}
      />
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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {LAUNCHER_TEMPLATES.map((template) => {
          const isActive = activeTemplate === template.id
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => handleSelect(template)}
              className={cn(
                'group relative rounded-xl border p-2.5 transition-all text-left',
                isActive
                  ? 'border-primary bg-primary/5 shadow-[0_0_0_2px_rgba(var(--primary)/0.2)]'
                  : 'border-border/60 hover:border-primary/40 hover:bg-primary/5',
              )}
            >
              <TemplatePreview template={template} />
              <div className="mt-2 space-y-0.5 px-0.5">
                <h4 className="font-medium text-sm leading-tight">{template.name}</h4>
                <p className="text-[11px] text-muted-foreground leading-tight line-clamp-1">{template.description}</p>
              </div>
              {isActive && (
                <div className="absolute top-3 right-3">
                  <div className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </SectionCard>
  )
}

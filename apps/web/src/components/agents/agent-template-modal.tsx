import { useState, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Check, Headphones, Briefcase, GraduationCap, Zap, SlidersHorizontal, Wrench, Search, Upload } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { agents as agentsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { cn } from '@/lib/utils'

export interface AgentTemplate {
  id: string
  name: string
  description: string
  systemPrompt: string
  suggestedModel: string
  suggestedTemperature: number
  category: 'support' | 'business' | 'education' | 'productivity' | 'custom'
  suggestedTools: string[]
}

interface AgentTemplateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeTemplateId?: string | null
  onSelect: (template: AgentTemplate) => void
  disabled?: boolean
}

const categories = [
  { id: 'all', label: 'All', icon: null },
  { id: 'support', label: 'Support', icon: Headphones },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'productivity', label: 'Productivity', icon: Zap },
  { id: 'custom', label: 'Custom', icon: SlidersHorizontal },
] as const

const categoryColors: Record<string, string> = {
  support: 'bg-blue-500/10 text-blue-500',
  business: 'bg-amber-500/10 text-amber-500',
  education: 'bg-green-500/10 text-green-500',
  productivity: 'bg-purple-500/10 text-purple-500',
  custom: 'bg-muted text-muted-foreground',
}

const categoryIcons: Record<string, typeof Headphones> = {
  support: Headphones,
  business: Briefcase,
  education: GraduationCap,
  productivity: Zap,
  custom: SlidersHorizontal,
}

const templateCategories: AgentTemplate['category'][] = ['support', 'business', 'education', 'productivity', 'custom']

function normalizeImportedTemplate(data: Record<string, unknown>): AgentTemplate | null {
  const name = (data.name || data.templateName) as string | undefined
  const systemPrompt = (data.systemPrompt || data.prompt) as string | undefined
  if (!name?.trim() || !systemPrompt) return null

  const category = templateCategories.includes(data.category as AgentTemplate['category'])
    ? (data.category as AgentTemplate['category'])
    : 'custom'

  return {
    id: (data.id as string) || 'custom',
    name: name.trim().slice(0, 50),
    description: String(data.description || data.name || 'Imported template').slice(0, 200),
    systemPrompt,
    suggestedModel: data.suggestedModel || (data.model as string) || '',
    suggestedTemperature: typeof data.suggestedTemperature === 'number' ? data.suggestedTemperature : 0.7,
    category,
    suggestedTools: Array.isArray(data.suggestedTools) ? (data.suggestedTools as string[]) : [],
  }
}

export function AgentTemplateModal({ open, onOpenChange, activeTemplateId, onSelect, disabled }: AgentTemplateModalProps) {
  const { orgId } = useOrg()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [search, setSearch] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text) as Record<string, unknown>
      const template = normalizeImportedTemplate(data)
      if (!template) {
        toast.error('Import failed: JSON must include "name" and "systemPrompt"')
        return
      }
      onSelect(template)
      onOpenChange(false)
      toast.success('Template imported')
    } catch {
      toast.error('Import failed: not a valid JSON file')
    }
  }

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['agent-templates', orgId],
    queryFn: async () => {
      const res = await agentsApi.templates(orgId!)
      return (res.data.data || []) as AgentTemplate[]
    },
    enabled: !!orgId,
  })

  const filtered = useMemo(() => {
    let result = templates
    if (activeCategory !== 'all') {
      result = result.filter((t) => t.category === activeCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      )
    }
    return result
  }, [templates, activeCategory, search])

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setSearch(''); setActiveCategory('all') } }}>
      <DialogContent style={{ maxWidth: '80vw' }} className="h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle>Choose a template</DialogTitle>
              <DialogDescription>Prefill the prompt and settings, then customize.</DialogDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0"
            >
              <Upload className="size-3.5" />
              Import JSON
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImport}
            />
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-6 pt-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
            {categories.map((cat) => {
              const Icon = cat.icon
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {Icon && <Icon className="size-3.5" />}
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              {search ? `No templates matching "${search}"` : 'No templates available.'}
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((template) => {
                const isSelected = template.id === activeTemplateId
                const CatIcon = categoryIcons[template.category] || SlidersHorizontal
                return (
                  <button
                    key={template.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onSelect(template)
                      onOpenChange(false)
                    }}
                    className={cn(
                      'group relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-md disabled:opacity-50',
                      isSelected
                        ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border/60 hover:border-border'
                    )}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" />
                      </span>
                    )}

                    {/* Category badge + icon */}
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'flex size-8 items-center justify-center rounded-lg',
                        categoryColors[template.category] || 'bg-muted text-muted-foreground'
                      )}>
                        <CatIcon className="size-4" />
                      </span>
                      <span className={cn(
                        'rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                        categoryColors[template.category] || 'bg-muted text-muted-foreground'
                      )}>
                        {template.category}
                      </span>
                    </div>

                    {/* Name + description */}
                    <div className="min-w-0">
                      <span className="text-sm font-semibold">{template.name}</span>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">{template.description}</p>
                    </div>

                    {/* Tools count */}
                    {template.suggestedTools.length > 0 && (
                      <div className="mt-auto flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Wrench className="size-3" />
                        {template.suggestedTools.length} tool{template.suggestedTools.length > 1 ? 's' : ''} suggested
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
import { useState, useMemo } from 'react'
import { Check, Search, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { avatarPresets as avatarPresetsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import staticPresets from '@/lib/config/avatar-presets.json'

const categoryMeta: Record<string, { label: string }> = {
  support: { label: 'Support' },
  business: { label: 'Business' },
  education: { label: 'Education' },
  developer: { label: 'Developer' },
  researcher: { label: 'Researcher' },
  custom: { label: 'Custom' },
}

interface AvatarPresetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onSelect: (url: string) => void
}

export function AvatarPresetModal({ open, onOpenChange, value, onSelect }: AvatarPresetModalProps) {
  const { orgId } = useOrg()
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  const { data: orgPresets = [], isLoading } = useQuery({
    queryKey: ['avatar-presets', orgId],
    queryFn: async () => {
      if (!orgId) return []
      const res = await avatarPresetsApi.list(orgId)
      return (res.data.data || []) as Array<{ id: string; url: string; name: string; category: string }>
    },
    enabled: open && !!orgId,
  })

  const allPresets = useMemo(() => {
    const staticList = staticPresets.map((p, idx) => ({ ...p, id: `static-${idx}` }))
    return [...staticList, ...orgPresets]
  }, [orgPresets])

  const categories = useMemo(() => {
    const cats = new Set(allPresets.map((a) => a.category))
    return ['all', ...Array.from(cats).filter((c) => c !== 'custom')]
  }, [allPresets])

  const filtered = useMemo(() => {
    let result = allPresets
    if (activeCategory !== 'all') {
      result = result.filter((a) => a.category === activeCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((a) =>
        a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
      )
    }
    return result
  }, [activeCategory, search, allPresets])

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setSearch(''); setActiveCategory('all') } }}>
      <DialogContent style={{ maxWidth: '70vw' }} className="h-[70vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
          <DialogTitle>Choose a preset avatar</DialogTitle>
          <DialogDescription>Select from available presets.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-6 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search avatars..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {categories.length > 1 && (
            <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
              {categories.map((cat) => {
                const isActive = activeCategory === cat
                const meta = cat !== 'all' ? categoryMeta[cat] : null
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {meta?.label || 'All'}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <p className="px-6 pt-2 text-[10px] text-muted-foreground/60 italic">More avatar presets coming soon</p>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              {search ? `No avatars matching "${search}"` : 'No avatars available.'}
            </p>
          ) : (
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
              {filtered.map((avatar) => {
                const isSelected = avatar.url === value
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => { onSelect(avatar.url); onOpenChange(false) }}
                    className={cn(
                      'group relative flex flex-col items-center gap-1 rounded-xl p-1 transition-all hover:bg-muted/50',
                      isSelected && 'bg-primary/5'
                    )}
                  >
                    <div className={cn(
                      'relative size-14 rounded-xl overflow-hidden ring-2 transition-all group-hover:ring-primary/50 group-hover:scale-105',
                      isSelected ? 'ring-primary' : 'ring-transparent'
                    )}>
                      <img src={avatar.url} alt={avatar.name} className="size-full object-cover" />
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center bg-primary/20">
                          <Check className="size-5 text-primary" />
                        </span>
                      )}
                    </div>
                    <span className="w-full truncate text-[9px] leading-tight text-muted-foreground text-center px-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {avatar.name}
                    </span>
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

import { useNavigate } from 'react-router-dom'
import { Copy, Globe2, MoreVertical, Pause, Play, Settings2, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { WidgetSummary } from '@/lib/hooks/use-widgets'

interface WidgetCardProps {
  widget: WidgetSummary
  onCopyEmbed: (widget: WidgetSummary) => void
  onStatusChange: (widget: WidgetSummary) => void
  onArchive: (widget: WidgetSummary) => void
}

export function WidgetCard({ widget, onCopyEmbed, onStatusChange, onArchive }: WidgetCardProps) {
  const navigate = useNavigate()
  const isLive = widget.status === 'active'
  return <Card className="group"><CardContent className="p-5">
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><h2 className="truncate text-base font-semibold">{widget.name}</h2><Badge variant={isLive ? 'default' : 'secondary'} className="capitalize">{widget.status}</Badge></div><p className="mt-1 text-sm text-muted-foreground">Powered by {widget.agent.name}</p></div>
      <DropdownMenu><DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"><MoreVertical className="size-4" /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => navigate(`/widgets/${widget.id}`)}><Settings2 className="size-4" />Configure</DropdownMenuItem><DropdownMenuItem onClick={() => onCopyEmbed(widget)}><Copy className="size-4" />Copy embed</DropdownMenuItem><DropdownMenuItem onClick={() => onStatusChange(widget)}>{isLive ? <Pause className="size-4" /> : <Play className="size-4" />}{isLive ? 'Pause widget' : 'Publish widget'}</DropdownMenuItem><DropdownMenuItem className="text-destructive" onClick={() => onArchive(widget)}><Trash2 className="size-4" />Archive</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
    </div>
    <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground"><span className="flex items-center gap-2"><Globe2 className="size-4" />{widget.allowedDomains.length ? `${widget.allowedDomains.length} domain${widget.allowedDomains.length > 1 ? 's' : ''}` : 'No domains added'}</span><Button variant="outline" size="sm" onClick={() => navigate(`/widgets/${widget.id}`)}>Configure</Button></div>
  </CardContent></Card>
}

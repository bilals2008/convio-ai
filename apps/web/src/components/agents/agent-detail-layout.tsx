import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Loader2,
  RefreshCw,
  Share,
  MoreVertical,
} from 'lucide-react'
import { ShareDialog } from '@/components/agents/share-dialog'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function ScrollableTabs({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showStart, setShowStart] = useState(false)
  const [showEnd, setShowEnd] = useState(false)

  const updateFade = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setShowStart(el.scrollLeft > 1)
    setShowEnd(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    updateFade()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateFade, { passive: true })
    window.addEventListener('resize', updateFade)
    return () => {
      el.removeEventListener('scroll', updateFade)
      window.removeEventListener('resize', updateFade)
    }
  }, [updateFade])

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="px-6">{children}</div>
      </div>
      {showStart && (
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent" />
      )}
      {showEnd && (
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />
      )}
    </div>
  )
}

interface AgentDetailLayoutProps {
  agentName: string
  agentAvatar?: string | null
  agentDescription?: string | null
  isSaving?: boolean
  onSave?: () => void
  onCopyLink?: () => void
  onOpenWidget?: () => void
  onDelete?: () => void
  shareUrl?: string
  tabs: ReactNode
  children: ReactNode
}

export function AgentDetailLayout({
  agentName,
  agentAvatar,
  agentDescription,
  isSaving = false,
  onSave,
  onCopyLink,
  onOpenWidget,
  onDelete,
  shareUrl,
  tabs,
  children,
}: AgentDetailLayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full overflow-x-hidden">
      <div className="px-6 pt-6 pb-0">
        <Breadcrumb className="mb-5">
          <BreadcrumbList className="text-sm text-muted-foreground">
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => navigate('/agents')}
                className="cursor-pointer transition-colors hover:text-foreground"
              >
                Agents
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-foreground">
                {agentName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-12">
              {agentAvatar && <AvatarImage src={agentAvatar} alt={agentName} />}
              <AvatarFallback className="text-base">{agentName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {agentName}
                </h1>
                <Badge
                  variant="secondary"
                  className="gap-1.5 border-0 bg-success/10 px-2.5 py-1 text-xs font-medium text-success"
                >
                  <span className="size-1.5 rounded-full bg-success" />
                  Live
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                {agentDescription || 'No description'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShareDialog shareUrl={shareUrl} agentName={agentName}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Share className="size-3.5" />
                Share
              </Button>
            </ShareDialog>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
              Update
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg border border-input bg-background size-8 text-sm font-medium hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <MoreVertical className="size-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {onCopyLink && (
                  <DropdownMenuItem onClick={onCopyLink}>
                    Copy Link
                  </DropdownMenuItem>
                )}
                {onOpenWidget && (
                  <DropdownMenuItem onClick={onOpenWidget}>
                    Open Widget
                  </DropdownMenuItem>
                )}
                {(onCopyLink || onOpenWidget) && <DropdownMenuSeparator />}
                {onDelete && (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={onDelete}
                  >
                    Delete Agent
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

      </div>

      <ScrollableTabs>{tabs}</ScrollableTabs>
      <Separator />

      <div className="flex-1 min-h-0 overflow-auto px-6 py-5">{children}</div>
    </div>
  )
}

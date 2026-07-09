import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Loader2,
  RefreshCw,
  Share,
  MoreVertical,
} from 'lucide-react'
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

interface AgentDetailLayoutProps {
  agentName: string
  agentAvatar?: string | null
  agentDescription?: string | null
  isSaving?: boolean
  onSave?: () => void
  onCopyLink?: () => void
  onOpenWidget?: () => void
  onDelete?: () => void
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
  tabs,
  children,
}: AgentDetailLayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full">
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
                  className="gap-1.5 text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 border-0 px-2.5 py-1"
                >
                  <span className="size-1.5 rounded-full bg-green-500" />
                  Live
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                {agentDescription || 'No description'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Share className="size-3.5" />
              Share
            </Button>
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

      <div className="px-6 mt-4">{tabs}</div>
      <Separator />

      <div className="flex-1 min-h-0 overflow-auto px-6 py-5">{children}</div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface QuickActionCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  href: string
  iconClassName?: string
}

export function QuickActionCard({ icon: Icon, title, description, href, iconClassName }: QuickActionCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
      onClick={() => navigate(href)}
    >
      <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
        <div className={cn('flex size-10 items-center justify-center rounded-lg', iconClassName)}>
          <Icon className="size-5" />
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
      </CardContent>
    </Card>
  )
}

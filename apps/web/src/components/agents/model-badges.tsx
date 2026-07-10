import { cn } from "@/lib/utils"
import { BADGE_CLASSES, type ModelBadge } from "./model-meta"

export function ModelBadges({ badges, className }: { badges: ModelBadge[]; className?: string }) {
  if (badges.length === 0) return null
  return (
    <span className={cn("flex flex-wrap items-center gap-1", className)}>
      {badges.map((badge) => (
        <span
          key={badge.label}
          className={cn(
            "inline-flex h-4 items-center rounded-full border px-1.5 text-[10px] font-medium leading-none",
            BADGE_CLASSES[badge.tone]
          )}
        >
          {badge.label}
        </span>
      ))}
    </span>
  )
}

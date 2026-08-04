import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: "center" | "left"
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary",
            align === "center" && "justify-center"
          )}
        >
          <span className="h-px w-6 bg-primary/40" aria-hidden="true" />
          {eyebrow}
          <span className="h-px w-6 bg-primary/40" aria-hidden="true" />
        </div>
      )}
      <h2 className="font-heading text-[clamp(28px,4vw,48px)] font-semibold text-foreground leading-[1.06] tracking-[-0.025em] max-w-[20ch]">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "text-[15px] text-muted-foreground leading-[1.7]",
            align === "center" ? "max-w-[540px]" : "max-w-[560px]"
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}

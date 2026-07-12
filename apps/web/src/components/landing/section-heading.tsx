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
        <div className="inline-flex items-center gap-2.5">
          <span className="h-px w-6 bg-primary/70" />
          <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-primary">
            {eyebrow}
          </span>
        </div>
      )}
      <h2 className="font-heading text-[clamp(26px,3.6vw,44px)] font-semibold text-foreground leading-[1.1] tracking-[-0.02em] max-w-[18ch]">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "text-[15px] text-muted-foreground leading-[1.65]",
            align === "center" ? "max-w-[500px]" : "max-w-[560px]"
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}

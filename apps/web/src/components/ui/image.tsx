import * as React from "react"
import { cn } from "@/lib/utils"

function Image({
  className,
  ...props
}: React.ComponentProps<"img">) {
  return (
    <img
      data-slot="image"
      className={cn("aspect-auto size-full object-cover", className)}
      {...props}
    />
  )
}

export { Image }

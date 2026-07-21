import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        owner:
          "bg-success/10 text-success border-success/20",
        admin:
          "bg-warning/10 text-warning border-warning/20",
        member:
          "bg-primary/10 text-primary border-primary/20",
        viewer:
          "bg-info/10 text-info border-info/20",
        active:
          "bg-success/10 text-success border-success/20",
        trialing:
          "bg-info/10 text-info border-info/20",
        canceled:
          "bg-muted text-muted-foreground border-border",
        past_due:
          "bg-warning/10 text-warning border-warning/20",
        waiting:
          "bg-warning/10 text-warning border-warning/20",
        resolved:
          "bg-info/10 text-info border-info/20",
        closed:
          "bg-muted text-muted-foreground border-border",
        archived:
          "bg-muted text-muted-foreground border-border",
        draft:
          "bg-warning/10 text-warning border-warning/20",
        inactive:
          "bg-muted text-muted-foreground border-border",
        processed:
          "bg-success/10 text-success border-success/20",
        failed:
          "bg-destructive/10 text-destructive border-destructive/20",
        pending:
          "bg-warning/10 text-warning border-warning/20",
        free:
          "bg-muted text-muted-foreground border-border",
        pro:
          "bg-primary/10 text-primary border-primary/20",
        enterprise:
          "bg-info/10 text-info border-info/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }

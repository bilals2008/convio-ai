import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive border-destructive/20 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
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
        beta:
          "bg-warning/15 text-warning border-0 h-4 px-1.5 py-0",
        entity_agent:
          "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        entity_member:
          "bg-blue-500/15 text-blue-400 border-blue-500/30",
        entity_organization:
          "bg-violet-500/15 text-violet-400 border-violet-500/30",
        entity_knowledge:
          "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
        entity_api_key:
          "bg-rose-500/15 text-rose-400 border-rose-500/30",
        entity_provider_key:
          "bg-amber-500/15 text-amber-400 border-amber-500/30",
        entity_sso:
          "bg-sky-500/15 text-sky-400 border-sky-500/30",
        entity_moderation:
          "bg-orange-500/15 text-orange-400 border-orange-500/30",
        entity_data_category:
          "bg-slate-500/15 text-slate-400 border-slate-500/30",
        entity_data_wipe:
          "bg-red-500/15 text-red-400 border-red-500/30",
        entity_membership:
          "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
        entity_invitation:
          "bg-pink-500/15 text-pink-400 border-pink-500/30",
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

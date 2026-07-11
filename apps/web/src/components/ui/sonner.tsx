import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "hsl(142 71% 45% / 0.12)",
          "--success-text": "hsl(142 71% 45%)",
          "--success-border": "hsl(142 71% 45% / 0.25)",
          "--error-bg": "hsl(0 84% 60% / 0.12)",
          "--error-text": "hsl(0 84% 60%)",
          "--error-border": "hsl(0 84% 60% / 0.25)",
          "--warning-bg": "hsl(38 92% 50% / 0.12)",
          "--warning-text": "hsl(38 92% 50%)",
          "--warning-border": "hsl(38 92% 50% / 0.25)",
          "--info-bg": "hsl(217 91% 60% / 0.12)",
          "--info-text": "hsl(217 91% 60%)",
          "--info-border": "hsl(217 91% 60% / 0.25)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

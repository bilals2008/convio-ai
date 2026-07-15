import { Globe, Calculator, Link, Clock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export interface BuiltInTool {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  enabled: boolean
}

const builtInTools: BuiltInTool[] = [
  {
    id: "web-search",
    label: "Web Search",
    description: "Search the internet for current information",
    icon: <Globe className="size-4" />,
    enabled: false,
  },
  {
    id: "calculator",
    label: "Calculator",
    description: "Evaluate mathematical expressions",
    icon: <Calculator className="size-4" />,
    enabled: false,
  },
  {
    id: "url-fetcher",
    label: "URL Fetcher",
    description: "Fetch and read webpage content",
    icon: <Link className="size-4" />,
    enabled: false,
  },
  {
    id: "current-time",
    label: "Date & Time",
    description: "Get the current date and time",
    icon: <Clock className="size-4" />,
    enabled: false,
  },
]

export { builtInTools }

interface AgentToolPickerProps {
  tools: BuiltInTool[]
  onToggle: (id: string, enabled: boolean) => void
  disabled?: boolean
}

export function AgentToolPicker({ tools, onToggle, disabled }: AgentToolPickerProps) {
  return (
    <div className="space-y-0.5">
      {tools.map((tool) => (
        <div
          key={tool.id}
          className={cn(
            "flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors",
            !disabled && "hover:bg-muted/40"
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-md",
              tool.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {tool.icon}
            </div>
            <div className="min-w-0">
              <Label className="text-xs font-medium leading-tight">{tool.label}</Label>
              <p className="text-[11px] text-muted-foreground leading-tight">{tool.description}</p>
            </div>
          </div>
          <Switch
            size="sm"
            checked={tool.enabled}
            onCheckedChange={(checked) => onToggle(tool.id, checked)}
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  )
}

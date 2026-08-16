import { useState } from 'react'
import {
  CircleHelp,
  Plug,
  ShieldCheck,
  Zap,
  Link2,
  AlertTriangle,
  CheckCircle2,
  Boxes,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    icon: Plug,
    color: 'bg-blue-500/10 text-blue-500',
    title: 'Add a server',
    body: 'Go to MCP Servers → Add Server. Pick a template (Notion, GitHub, Linear) or enter a custom URL. Streamable HTTP servers are the standard for hosted tools.',
  },
  {
    icon: ShieldCheck,
    color: 'bg-emerald-500/10 text-emerald-500',
    title: 'Authorize (OAuth)',
    body: 'For OAuth servers, click the shield icon. You will be taken to the provider (e.g. Notion, GitHub) to approve access. Tokens are stored encrypted when an encryption key is configured.',
  },
  {
    icon: Link2,
    color: 'bg-purple-500/10 text-purple-500',
    title: 'Link to an agent',
    body: 'Open your agent → Configuration → MCP Servers → toggle the server ON and Save. The agent now sees the server’s tools as callable functions.',
  },
  {
    icon: Zap,
    color: 'bg-amber-500/10 text-amber-500',
    title: 'Use it in chat',
    body: 'Ask your agent something the tool can do — e.g. "Create a Notion page titled Q3 roadmap". The model picks the right tool and calls it automatically.',
  },
]

const FAQ = [
  {
    icon: AlertTriangle,
    title: 'OAuth shows "dynamic client registration not supported"',
    body: 'Some providers (GitHub Copilot) don’t support dynamic registration. Use the Header auth type with a Personal Access Token instead, or bring your own OAuth app.',
  },
  {
    icon: CheckCircle2,
    title: 'Test shows connected but no tools?',
    body: 'A server can respond to a ping without exposing tools. Check the server’s docs for the correct URL — toolset URLs often differ from the base URL.',
  },
  {
    icon: Plug,
    title: 'Tools not showing in an agent?',
    body: 'Make sure the server is enabled, linked to the agent, and the agent has saved. Disabled servers are skipped automatically.',
  },
]

interface McpHelpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function McpHelpModal({ open, onOpenChange }: McpHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={{ maxWidth: '70vw' }}
        className="h-[80vh] flex flex-col p-0 gap-0"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
          <DialogTitle className="flex items-center gap-2">
            <CircleHelp className="size-5 text-primary" />
            How MCP works in Convio
          </DialogTitle>
          <DialogDescription>
            Everything you need to know about connecting external tools via Model Context Protocol.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Overview */}
          <section className="rounded-xl border border-border/60 bg-muted/30 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Boxes className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">What is an MCP server?</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              MCP (Model Context Protocol) lets your agents call tools from external apps — search Notion,
              manage GitHub issues, track Linear projects, and more. You add the server once, authorize access,
              then link it to any agent.
            </p>
          </section>

          {/* Steps */}
          <section>
            <h3 className="text-sm font-semibold mb-3">Connect in 4 steps</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {STEPS.map((step, i) => (
                <div key={step.title} className="rounded-xl border border-border/60 p-4">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', step.color)}>
                      <step.icon className="size-4" />
                    </span>
                    <span className="text-sm font-medium">
                      <span className="text-muted-foreground mr-1">Step {i + 1}.</span>
                      {step.title}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h3 className="text-sm font-semibold mb-3">Common issues</h3>
            <div className="space-y-3">
              {FAQ.map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-xl border border-border/60 p-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                    <item.icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="border-t border-border/60 px-6 py-4 flex items-center justify-between gap-3">
          <a
            href="/docs/connecting-mcp-server"
            onClick={() => onOpenChange(false)}
            className="text-xs text-primary hover:underline"
          >
            Read the full docs →
          </a>
          <Button size="sm" onClick={() => onOpenChange(false)}>Got it</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function McpHelpButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label="MCP help"
      className="size-8 text-muted-foreground hover:text-foreground"
    >
      <CircleHelp className="size-4" />
    </Button>
  )
}
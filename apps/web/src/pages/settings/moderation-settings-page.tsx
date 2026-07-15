import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, ShieldAlert, Plus, Trash2, Play } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useOrg } from '@/lib/org-context'
import { moderation as moderationApi } from '@/lib/api'

type Severity = 'low' | 'medium' | 'high'

interface CustomRule {
  name: string
  pattern: string
  isRegex: boolean
  severity: Severity
}

interface ModerationConfig {
  enabled: boolean
  profanityEnabled: boolean
  piiEnabled: boolean
  injectionEnabled: boolean
  blockOnViolation: boolean
  customRules: CustomRule[]
}

interface ModerationFlag {
  type: string
  severity: Severity
  match: string
  label?: string
}

const severityVariant: Record<Severity, 'secondary' | 'default' | 'destructive'> = {
  low: 'secondary',
  medium: 'default',
  high: 'destructive',
}

export default function ModerationSettingsPage() {
  const queryClient = useQueryClient()
  const { orgId, isLoading: orgLoading } = useOrg()

  const [enabled, setEnabled] = useState(false)
  const [profanityEnabled, setProfanityEnabled] = useState(true)
  const [piiEnabled, setPiiEnabled] = useState(true)
  const [injectionEnabled, setInjectionEnabled] = useState(true)
  const [blockOnViolation, setBlockOnViolation] = useState(true)
  const [customRules, setCustomRules] = useState<CustomRule[]>([])

  const [testText, setTestText] = useState('')
  const [testFlags, setTestFlags] = useState<ModerationFlag[] | null>(null)
  const [testPassed, setTestPassed] = useState<boolean | null>(null)

  const emptyRule: CustomRule = { name: '', pattern: '', isRegex: false, severity: 'medium' }
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false)
  const [newRule, setNewRule] = useState<CustomRule>(emptyRule)

  const { isLoading } = useQuery({
    queryKey: ['moderation-config', orgId],
    queryFn: async () => {
      const res = await moderationApi.get(orgId!)
      const cfg = res.data.data as ModerationConfig
      setEnabled(cfg.enabled)
      setProfanityEnabled(cfg.profanityEnabled)
      setPiiEnabled(cfg.piiEnabled)
      setInjectionEnabled(cfg.injectionEnabled)
      setBlockOnViolation(cfg.blockOnViolation)
      setCustomRules(Array.isArray(cfg.customRules) ? cfg.customRules : [])
      return cfg
    },
    enabled: !!orgId,
  })

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => moderationApi.update(orgId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-config', orgId] })
      queryClient.invalidateQueries({ queryKey: ['audit-logs', orgId] })
      toast.success('Moderation settings saved')
    },
    onError: (error: Error) => toast.error(error.message || 'Unable to save moderation settings'),
  })

  const testMutation = useMutation({
    mutationFn: (text: string) => moderationApi.test(orgId!, text),
    onSuccess: (res) => {
      const data = res.data.data as { passed: boolean; flags: ModerationFlag[] }
      setTestPassed(data.passed)
      setTestFlags(data.flags)
    },
    onError: (error: Error) => toast.error(error.message || 'Test failed'),
  })

  const handleSave = () => {
    // Drop rules with empty names/patterns before persisting.
    const cleanRules = customRules.filter((r) => r.name.trim() && r.pattern.trim())
    updateMutation.mutate({
      enabled,
      profanityEnabled,
      piiEnabled,
      injectionEnabled,
      blockOnViolation,
      customRules: cleanRules,
    })
  }

  const saveNewRule = () => {
    setCustomRules((rules) => [...rules, newRule])
    setNewRule(emptyRule)
    setRuleDialogOpen(false)
  }

  const updateRule = (index: number, patch: Partial<CustomRule>) =>
    setCustomRules((rules) => rules.map((r, i) => (i === index ? { ...r, ...patch } : r)))

  const removeRule = (index: number) =>
    setCustomRules((rules) => rules.filter((_, i) => i !== index))

  if (orgLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moderation"
        description="Screen user messages before they reach your agents"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="size-5" />
            Content Moderation
          </CardTitle>
          <CardDescription>
            Run incoming messages through profanity, PII, and prompt-injection checks. Violations are logged to the audit log.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Enable moderation</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {enabled ? 'Messages are screened before hitting the model' : 'Moderation is disabled'}
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Block on violation</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {blockOnViolation
                  ? 'Flagged messages are rejected and never sent to the model'
                  : 'Flagged messages are logged but still answered'}
              </p>
            </div>
            <Switch checked={blockOnViolation} onCheckedChange={setBlockOnViolation} disabled={!enabled} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">Profanity filter</span>
              <Switch checked={profanityEnabled} onCheckedChange={setProfanityEnabled} disabled={!enabled} />
            </label>
            <label className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">PII detection</span>
              <Switch checked={piiEnabled} onCheckedChange={setPiiEnabled} disabled={!enabled} />
            </label>
            <label className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">Prompt injection</span>
              <Switch checked={injectionEnabled} onCheckedChange={setInjectionEnabled} disabled={!enabled} />
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom rules</CardTitle>
          <CardDescription>
            Match specific keywords or regular expressions. Regex is evaluated case-insensitively.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {customRules.length === 0 && (
            <p className="text-sm text-muted-foreground">No custom rules yet.</p>
          )}
          {customRules.map((rule, index) => (
            <div key={index} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_auto_auto_auto] sm:items-end">
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input
                  value={rule.name}
                  onChange={(e) => updateRule(index, { name: e.target.value })}
                  placeholder="No competitor names"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Pattern</Label>
                <Input
                  value={rule.pattern}
                  onChange={(e) => updateRule(index, { pattern: e.target.value })}
                  placeholder={rule.isRegex ? '\\bexample\\b' : 'keyword'}
                  className={rule.isRegex ? 'font-mono' : undefined}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Severity</Label>
                <Select value={rule.severity} onValueChange={(v) => updateRule(index, { severity: (v as Severity) ?? 'medium' })}>
                  <SelectTrigger className="w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-2 pb-2 text-xs">
                <Switch checked={rule.isRegex} onCheckedChange={(v) => updateRule(index, { isRegex: v })} />
                Regex
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeRule(index)}
                aria-label="Remove rule"
                className="text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Dialog
            open={ruleDialogOpen}
            onOpenChange={(open) => {
              setRuleDialogOpen(open)
              if (!open) setNewRule(emptyRule)
            }}
          >
            <DialogTrigger
              render={
                <Button type="button" size="sm">
                  <Plus className="size-3.5" />
                  Add rule
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add custom rule</DialogTitle>
                <DialogDescription>
                  Match a keyword or regular expression. Regex is evaluated case-insensitively.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={newRule.name}
                    onChange={(e) => setNewRule((r) => ({ ...r, name: e.target.value }))}
                    placeholder="No competitor names"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Pattern</Label>
                  <Input
                    value={newRule.pattern}
                    onChange={(e) => setNewRule((r) => ({ ...r, pattern: e.target.value }))}
                    placeholder={newRule.isRegex ? '\\bexample\\b' : 'keyword'}
                    className={newRule.isRegex ? 'font-mono' : undefined}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Severity</Label>
                    <Select
                      value={newRule.severity}
                      onValueChange={(v) => setNewRule((r) => ({ ...r, severity: (v as Severity) ?? 'medium' }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <label className="flex items-center gap-2 pt-6 text-sm">
                    <Switch
                      checked={newRule.isRegex}
                      onCheckedChange={(v) => setNewRule((r) => ({ ...r, isRegex: v }))}
                    />
                    Regex
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setRuleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={saveNewRule}
                  disabled={!newRule.name.trim() || !newRule.pattern.trim()}
                >
                  Add rule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test</CardTitle>
          <CardDescription>Check a sample message against the current rules (saved or not, checks run regardless of the enable toggle).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Type a message to screen…"
            className="min-h-[80px]"
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => testMutation.mutate(testText)}
              disabled={!testText.trim() || testMutation.isPending}
            >
              {testMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
              Run test
            </Button>
            {testPassed !== null && (
              <Badge variant={testPassed ? 'secondary' : 'destructive'}>
                {testPassed ? 'Passed' : 'Flagged'}
              </Badge>
            )}
          </div>
          {testFlags && testFlags.length > 0 && (
            <div className="space-y-2 rounded-lg border p-3">
              {testFlags.map((flag, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Badge variant={severityVariant[flag.severity]}>{flag.severity}</Badge>
                  <span className="font-medium">{flag.label || flag.type}</span>
                  <span className="text-muted-foreground truncate">{flag.match}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending && <Loader2 className="size-3.5 animate-spin" />}
          Save changes
        </Button>
      </div>
    </div>
  )
}

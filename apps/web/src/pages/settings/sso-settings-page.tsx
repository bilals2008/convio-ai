import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Shield, Check, X } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useOrg } from '@/lib/org-context'
import { organizations as orgsApi } from '@/lib/api'

interface SsoConfig {
  id: string
  provider: string
  issuer: string | null
  entryPoint: string | null
  certificate: string | null
  metadataUrl: string | null
  enabled: boolean
}

export default function SsoSettingsPage() {
  const queryClient = useQueryClient()
  const { orgId } = useOrg()
  const [provider, setProvider] = useState('saml')
  const [issuer, setIssuer] = useState('')
  const [entryPoint, setEntryPoint] = useState('')
  const [certificate, setCertificate] = useState('')
  const [metadataUrl, setMetadataUrl] = useState('')
  const [enabled, setEnabled] = useState(false)

  const { data: config, isLoading } = useQuery({
    queryKey: ['sso-config', orgId],
    queryFn: async () => {
      const res = await orgsApi.api.get(`/organizations/${orgId}/sso`)
      const cfg = res.data.data as SsoConfig
      setProvider(cfg.provider)
      setIssuer(cfg.issuer || '')
      setEntryPoint(cfg.entryPoint || '')
      setCertificate(cfg.certificate || '')
      setMetadataUrl(cfg.metadataUrl || '')
      setEnabled(cfg.enabled)
      return cfg
    },
    enabled: !!orgId,
  })

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      orgsApi.api.patch(`/organizations/${orgId}/sso`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sso-config', orgId] })
      queryClient.invalidateQueries({ queryKey: ['audit-logs', orgId] })
    },
  })

  const handleSave = () => {
    updateMutation.mutate({
      provider,
      issuer: issuer || undefined,
      entryPoint: entryPoint || undefined,
      certificate: certificate || undefined,
      metadataUrl: metadataUrl || undefined,
      enabled,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="SSO / SAML"
        description="Configure single sign-on for your organization"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Single Sign-On Configuration
          </CardTitle>
          <CardDescription>
            Configure SAML or OIDC to allow your team to sign in using your corporate identity provider.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Enable SSO</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {enabled ? 'SSO is active for this organization' : 'SSO is disabled'}
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label>Provider</Label>
            <Select value={provider} onValueChange={(v) => setProvider(v ?? 'saml')}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="saml">SAML 2.0</SelectItem>
                <SelectItem value="oidc">OpenID Connect (OIDC)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Issuer / Entity ID</Label>
            <Input
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="https://your-idp.com/entity-id"
            />
            <p className="text-xs text-muted-foreground">The unique identifier of your identity provider.</p>
          </div>

          <div className="space-y-2">
            <Label>SSO Entry Point</Label>
            <Input
              value={entryPoint}
              onChange={(e) => setEntryPoint(e.target.value)}
              placeholder="https://your-idp.com/saml/sso"
            />
            <p className="text-xs text-muted-foreground">The URL where authentication requests are sent.</p>
          </div>

          <div className="space-y-2">
            <Label>X.509 Certificate</Label>
            <textarea
              value={certificate}
              onChange={(e) => setCertificate(e.target.value)}
              placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
            />
            <p className="text-xs text-muted-foreground">The certificate used to verify SAML responses.</p>
          </div>

          <div className="space-y-2">
            <Label>Metadata URL</Label>
            <Input
              value={metadataUrl}
              onChange={(e) => setMetadataUrl(e.target.value)}
              placeholder="https://your-idp.com/metadata.xml"
            />
            <p className="text-xs text-muted-foreground">Optional URL to fetch IdP metadata automatically.</p>
          </div>

          {config && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              {config.enabled ? (
                <><Check className="size-3.5 text-emerald-500" /> SSO is configured and active</>
              ) : (
                <><X className="size-3.5 text-muted-foreground" /> SSO is not yet active. Fill in the details and enable above.</>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="size-4 animate-spin mr-2" />}
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
          <CardDescription>SSO setup overview for Convio</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. Configure your IdP (Okta, Azure AD, Google Workspace, etc.) with Convio as a SAML/OIDC application.</p>
          <p>2. Fill in the details from your IdP above (Issuer, Entry Point, Certificate).</p>
          <p>3. Enable SSO and save. Members can then sign in using your corporate IdP.</p>
          <p className="text-xs text-muted-foreground/70 mt-3">Note: This stores your SSO configuration. Your Supabase project must also have SSO enabled. Contact support for enterprise setup assistance.</p>
        </CardContent>
      </Card>
    </div>
  )
}

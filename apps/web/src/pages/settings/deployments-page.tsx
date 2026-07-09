import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { deployments as deploymentsApi, agents as agentsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Loader2, Link } from 'lucide-react'
import { DeploymentForm } from '@/components/settings/deployment-form'

interface DeploymentItem {
  id: string
  agentId: string
  channel: string
  status: string
  config: Record<string, unknown>
  createdAt: string
  agentName?: string
}

export default function DeploymentsPage() {
  const { orgId } = useOrg()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<Partial<DeploymentItem> | null>(null)

  const agentsQuery = useQuery({
    queryKey: ['agents-for-deployments', orgId],
    queryFn: () => agentsApi.list(orgId!),
    enabled: !!orgId,
  })

  const allDeploymentsQuery = useQuery({
    queryKey: ['all-deployments', orgId],
    queryFn: async () => {
      const agentsRes = await agentsApi.list(orgId!)
      const agents = agentsRes.data.data || agentsRes.data
      const agentsList = Array.isArray(agents) ? agents : []
      const deploymentPromises = agentsList.map(async (agent: { id: string; name: string }) => {
        try {
          const res = await deploymentsApi.list(agent.id)
          const items = res.data.data || res.data
          const list = Array.isArray(items) ? items : []
          return list.map((d: DeploymentItem) => ({ ...d, agentName: agent.name }))
        } catch {
          return []
        }
      })
      const nested = await Promise.all(deploymentPromises)
      return nested.flat()
    },
    enabled: !!orgId,
  })

  const createMutation = {
    mutate: async (data: {agentId: string; channel: string; config: Record<string, unknown>}) => {
      await deploymentsApi.create(data.agentId, { channel: data.channel, config: data.config })
      queryClient.invalidateQueries({ queryKey: ['all-deployments'] })
    }
  }

  const deleteMutation = {
    mutate: async (id: string) => {
      await deploymentsApi.delete(id)
      queryClient.invalidateQueries({ queryKey: ['all-deployments'] })
    }
  }

  const testMutation = {
    mutateAsync: async (id: string) => {
      const res = await deploymentsApi.test(id)
      return res.data
    }
  }

  const deployments = allDeploymentsQuery.data || []

  if (allDeploymentsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Deployments</h1>
          <p className="text-sm text-muted-foreground">Manage channel deployments for your agents</p>
        </div>
        <Button onClick={() => setEditing({})}>
          <Plus className="size-4 mr-2" />
          New Deployment
        </Button>
      </div>

      {editing && (
        <DeploymentForm
          agents={agentsQuery.data?.data || agentsQuery.data || []}
          onSave={async (data) => {
            await createMutation.mutate(data)
            setEditing(null)
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {deployments.length === 0 && !editing && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Link className="size-8 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No deployments yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add your first deployment to connect an agent to a channel.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {deployments.map((deployment: DeploymentItem) => (
          <Card key={deployment.id}>
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <CardTitle className="text-sm font-medium capitalize">{deployment.channel}</CardTitle>
                <Badge variant={deployment.status === 'active' ? 'default' : 'secondary'}>
                  {deployment.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const result = await testMutation.mutateAsync(deployment.id)
                    alert(result.data?.message || 'Test completed')
                  }}
                >
                  Test
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMutation.mutate(deployment.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="py-2 text-xs text-muted-foreground">
              Agent: {deployment.agentName || deployment.agentId}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

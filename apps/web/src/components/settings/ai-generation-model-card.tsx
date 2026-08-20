import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Wand2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ModelPicker } from '@/components/agents/model-picker-dialog'
import { organizations as orgsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { useAvailableModels } from '@/lib/hooks/use-available-models'
import { toast } from '@/lib/toast'

export function AiGenerationModelCard() {
  const { orgId } = useOrg()
  const queryClient = useQueryClient()
  const { data: availableModels = [], isLoading: modelsLoading } = useAvailableModels()
  const [model, setModel] = useState('')

  const { data: orgData } = useQuery({
    queryKey: ['organization', orgId],
    queryFn: async () => {
      const res = await orgsApi.get(orgId!)
      return (res.data.data || {}) as { aiGenerationModel?: string | null }
    },
    enabled: !!orgId,
  })

  useEffect(() => {
    if (orgData?.aiGenerationModel && model === '') {
      setModel(orgData.aiGenerationModel)
    }
  }, [orgData, model])

  const mutation = useMutation({
    mutationFn: (value: string) => orgsApi.update(orgId!, { aiGenerationModel: value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', orgId] })
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast.success('AI generation model updated')
    },
    onError: () => toast.error('Failed to update AI generation model'),
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
          <Wand2 className="size-4.5" />
        </div>
        <div className="space-y-1">
          <CardTitle>AI Generation Model</CardTitle>
          <CardDescription>
            The model used when you generate agents or widget designs with AI. Pick one of your
            configured providers.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ModelPicker
          value={model}
          models={availableModels}
          loading={modelsLoading}
          onSelect={(value) => {
            setModel(value)
            mutation.mutate(value)
          }}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Used by “Create with AI” and “Design with AI” across your workspace.
        </p>
      </CardContent>
    </Card>
  )
}

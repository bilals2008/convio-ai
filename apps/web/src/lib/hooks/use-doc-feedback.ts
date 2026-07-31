import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getDocFeedback, submitDocFeedback } from '@/lib/api/docs'

export function useDocFeedback(orgId: string | null | undefined, slug: string | undefined) {
  return useQuery({
    queryKey: ['doc-feedback', orgId, slug],
    queryFn: async () => getDocFeedback(orgId!, slug!),
    enabled: !!orgId && !!slug,
    retry: false,
  })
}

export function useSubmitDocFeedback(orgId: string | undefined, slug: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ helpful, comment }: { helpful: boolean; comment?: string }) =>
      submitDocFeedback(orgId!, slug!, helpful, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doc-feedback', orgId, slug] })
    },
  })
}

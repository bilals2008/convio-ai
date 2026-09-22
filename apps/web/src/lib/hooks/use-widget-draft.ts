import { useMutation } from '@tanstack/react-query'
import { widgets as widgetsApi } from '@/lib/api'
import type { WidgetDraft } from '@/components/widgets/types'

export function useGenerateWidgetDraft() {
  return useMutation({
    mutationFn: async (description: string) => {
      const response = await widgetsApi.generateDraft(description)
      return (response.data.data ?? response.data) as WidgetDraft
    },
  })
}

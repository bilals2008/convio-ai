// Standalone widget entry — the embedded iframe loads this bundle instead of
// the full dashboard app, so customer pages never download admin code.
import './index.css'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WidgetEmbedPage } from '@/pages/widget/WidgetDemo'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <WidgetEmbedPage />
  </QueryClientProvider>,
)
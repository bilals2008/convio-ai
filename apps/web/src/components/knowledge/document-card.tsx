export interface DocumentItem {
  id: string
  name: string
  type: 'txt' | 'pdf' | 'csv' | 'md' | 'json' | 'url'
  status: 'pending' | 'processing' | 'ready' | 'error' | 'archived'
  chunkCount?: number
  createdAt: string
}

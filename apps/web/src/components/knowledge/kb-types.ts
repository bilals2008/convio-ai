import type { DocumentItem } from './document-card'

export type KbStatus = 'ready' | 'indexing' | 'failed' | 'draft'

export interface KbSettings {
  embeddingModel: string
  embeddingDimensions: number
  chunkSize: number
  chunkOverlap: number
  retrieverTopK: number
  similarityThreshold: number
  searchStrategy: 'vector' | 'keyword' | 'hybrid'
  hybridSearch: boolean
  metadataFiltering: boolean
  rerankerEnabled: boolean
}

export const DEFAULT_KB_SETTINGS: KbSettings = {
  embeddingModel: 'text-embedding-3-small',
  embeddingDimensions: 1536,
  chunkSize: 1000,
  chunkOverlap: 40,
  retrieverTopK: 5,
  similarityThreshold: 0.7,
  searchStrategy: 'hybrid',
  hybridSearch: true,
  metadataFiltering: false,
  rerankerEnabled: false,
}

export interface KnowledgeBaseDetail {
  id: string
  name: string
  description?: string
  tags?: string[]
  owner?: { id: string; name: string; email?: string }
  status: KbStatus
  documentCount: number
  readyCount: number
  processingCount: number
  errorCount: number
  organizationId: string
  createdAt: string
  updatedAt: string
  lastIndexedAt?: string
  settings: KbSettings
}

export interface KbHealth {
  documents: number
  chunks: number
  embeddingCost: number
  avgChunkSize: number
  retrievalAccuracy: number | null
  failedDocuments: number
  pendingJobs: number
  estimatedTokens: number
  indexHealth: 'healthy' | 'degraded' | 'critical'
}

export interface KbWorkflowStep {
  key: string
  label: string
  state: 'complete' | 'active' | 'pending'
  timestamp?: string
  description: string
}

export interface SearchResult {
  id: string
  content: string
  documentId: string
  documentName: string
  score: number
}

export interface ActivityEvent {
  id: string
  type:
    | 'document.uploaded'
    | 'index.completed'
    | 'settings.changed'
    | 'error'
    | 'reindex.started'
    | 'search.executed'
  title: string
  description: string
  timestamp: string
  meta?: string
}

export function deriveStatus(
  readyCount: number,
  processingCount: number,
  errorCount: number,
  documentCount: number,
): KbStatus {
  if (documentCount > 0 && processingCount > 0) return 'indexing'
  if (errorCount > 0 && readyCount === 0) return 'failed'
  if (documentCount > 0 && readyCount > 0) return 'ready'
  return 'draft'
}

export function computeHealth(
  documents: DocumentItem[],
  settings: KbSettings,
  retrievalAccuracy: number | null,
): KbHealth {
  const chunks = documents.reduce((sum, d) => sum + (d.chunkCount ?? 0), 0)
  const estimatedChars = chunks * settings.chunkSize
  const estimatedTokens = Math.round((estimatedChars / 4) * 1.3)
  const embeddingCost = Number(((chunks * settings.embeddingDimensions * 0.0000001) * 0.02).toFixed(4))
  const failedDocuments = documents.filter((d) => d.status === 'error').length
  const pendingJobs = documents.filter(
    (d) => d.status === 'pending' || d.status === 'processing',
  ).length

  let indexHealth: KbHealth['indexHealth'] = 'healthy'
  if (failedDocuments > 0) indexHealth = 'degraded'
  if (failedDocuments > 0 && documents.length > 0 && failedDocuments === documents.length)
    indexHealth = 'critical'

  return {
    documents: documents.length,
    chunks,
    embeddingCost,
    avgChunkSize: chunks > 0 ? Math.round(estimatedChars / chunks) : 0,
    retrievalAccuracy,
    failedDocuments,
    pendingJobs,
    estimatedTokens,
    indexHealth,
  }
}

export function buildWorkflow(
  kb: KnowledgeBaseDetail,
  documents: DocumentItem[],
  hasTested: boolean,
  hasConnected: boolean,
): KbWorkflowStep[] {
  const firstDoc = documents
    .slice()
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))[0]

  const allReady =
    kb.documentCount > 0 &&
    kb.processingCount === 0 &&
    kb.readyCount === kb.documentCount

  return [
    {
      key: 'created',
      label: 'Created',
      state: 'complete',
      timestamp: kb.createdAt,
      description: 'Knowledge base initialized.',
    },
    {
      key: 'sources',
      label: 'Sources Added',
      state: kb.documentCount > 0 ? 'complete' : 'pending',
      timestamp: firstDoc?.createdAt,
      description:
        kb.documentCount > 0
          ? `${kb.documentCount} source${kb.documentCount > 1 ? 's' : ''} connected.`
          : 'No sources connected yet.',
    },
    {
      key: 'indexing',
      label: 'Indexing',
      state: kb.processingCount > 0 ? 'active' : allReady ? 'complete' : 'pending',
      timestamp: kb.lastIndexedAt,
      description:
        kb.processingCount > 0
          ? `Processing ${kb.processingCount} document${kb.processingCount > 1 ? 's' : ''}…`
          : allReady
            ? 'All documents indexed and embedded.'
            : 'Waiting for documents to index.',
    },
    {
      key: 'testing',
      label: 'Testing',
      state: hasTested ? 'complete' : 'pending',
      description: hasTested
        ? 'Retrieval verified with a test query.'
        : 'Run a test query to validate retrieval.',
    },
    {
      key: 'connected',
      label: 'Connected',
      state: hasConnected ? 'complete' : 'pending',
      description: hasConnected
        ? 'Linked to an active agent.'
        : 'Attach this base to an agent to go live.',
    },
  ]
}

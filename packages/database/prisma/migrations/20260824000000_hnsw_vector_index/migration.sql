-- ponytail: pgvector index lives outside schema.prisma (Prisma can't model Unsupported vector types)
-- Exact KNN seq-scans on every chat message -> HNSW approximate index (no training data needed)
-- If DocumentChunk ever gets large enough that the build lock matters, drop and re-create
-- this index manually with CREATE INDEX CONCURRENTLY (not possible inside a Prisma migration).
CREATE INDEX IF NOT EXISTS "document_chunk_embedding_hnsw"
  ON "DocumentChunk" USING hnsw ("embedding" vector_cosine_ops);

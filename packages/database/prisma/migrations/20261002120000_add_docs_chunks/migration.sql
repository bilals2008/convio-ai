-- ponytail: docs AI assistant retrieval store. Global (not org-scoped) index of
-- the public documentation markdown, one row per heading-level section.
-- The HNSW index and the full-text index live outside schema.prisma because
-- Prisma can't model an Unsupported vector index or an expression index.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "DocsChunk" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "anchor" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "embedding" vector(384),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocsChunk_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DocsChunk_slug_anchor_key" ON "DocsChunk"("slug", "anchor");
CREATE INDEX "DocsChunk_slug_idx" ON "DocsChunk"("slug");
CREATE INDEX "DocsChunk_slug_position_idx" ON "DocsChunk"("slug", "position");

-- Approximate nearest-neighbour index for semantic search (cosine).
CREATE INDEX IF NOT EXISTS "DocsChunk_embedding_hnsw"
  ON "DocsChunk" USING hnsw ("embedding" vector_cosine_ops);

-- Lexical half of the hybrid search. `to_tsvector(regconfig, text)` is immutable,
-- so it is valid in an expression index.
CREATE INDEX IF NOT EXISTS "DocsChunk_content_fts_idx"
  ON "DocsChunk" USING gin (to_tsvector('english', "title" || ' ' || "heading" || ' ' || "content"));

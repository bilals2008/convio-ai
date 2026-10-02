-- ponytail: platform-level config for the public docs AI assistant. Singleton
-- row (id 'default') written only from the admin panel. The API key is encrypted
-- at rest by the app layer; this column just holds the ciphertext + a masked
-- preview. Defaults to Agnes AI so the assistant works with no env var.

CREATE TABLE "docs_assistant_config" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'agnes',
    "model" TEXT NOT NULL DEFAULT 'agnes-2.5',
    "apiKey" TEXT,
    "keyPreview" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "docs_assistant_config_pkey" PRIMARY KEY ("id")
);

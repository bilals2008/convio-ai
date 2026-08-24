-- ponytail: provider ids were buried in metadata JSON (unindexable); promoted to a column for dedup lookups
ALTER TABLE "Message" ADD COLUMN "provider_message_id" TEXT;

CREATE INDEX "Message_provider_message_id_idx" ON "Message"("provider_message_id");

UPDATE "Message"
SET "provider_message_id" = "metadata"->>'providerMessageId'
WHERE "metadata"->>'providerMessageId' IS NOT NULL
  AND "metadata" ? 'providerMessageId';
